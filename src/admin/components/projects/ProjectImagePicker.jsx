import { useEffect, useRef, useState } from 'react';
import { mediaApi } from '../../../lib/media.js';
import Dialog from '../Dialog.jsx';
import { Button, Notice } from '../UI.jsx';

const types = new Set(['image/jpeg', 'image/png', 'image/webp']);
export default function ProjectImagePicker({ existingIds, onChoose, onClose }) {
  const input = useRef(null);
  const mounted = useRef(false);
  const lock = useRef(false);
  const [selected, setSelected] = useState([]);
  const [query, setQuery] = useState({ page: 1, revision: 0 });
  const [result, setResult] = useState({ items: [], pagination: null, loading: true, error: '' });
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const capacity = Math.max(0, 20 - existingIds.length);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => {
    const controller = new AbortController();
    mediaApi.getAll(query.page, { signal: controller.signal }).then((data) => {
      if (controller.signal.aborted) return;
      const last = Math.max(1, data.pagination.totalPages);
      if (query.page > last) { setQuery((old) => ({ ...old, page: last })); return; }
      setResult({ items: data.media, pagination: data.pagination, loading: false, error: '' });
      setSelected((old) => old.filter((image) => !data.media.some((fresh) => fresh.id === image.id && fresh.deletionPending)));
    }).catch((failure) => {
      if (!controller.signal.aborted) setResult({ items: [], pagination: null, loading: false, error: failure.message });
    });
    return () => controller.abort();
  }, [query]);
  const reload = (page = query.page) => {
    setResult((old) => ({ ...old, loading: true, error: '' }));
    setQuery((old) => ({ page, revision: old.revision + 1 }));
  };
  const toggle = (image) => {
    if (uploading || image.deletionPending || existingIds.includes(image.id)) return;
    setSelected((old) => old.some((item) => item.id === image.id) ? old.filter((item) => item.id !== image.id) : old.length < capacity ? [...old, image] : old);
    setError('');
  };
  const upload = async (event) => {
    const files = Array.from(event.target.files || []); event.target.value = '';
    if (!files.length || lock.current) return;
    setResults([]); setError('');
    if (files.length > Math.min(10, capacity - selected.length)) {
      setError(`Choose up to ${Math.min(10, capacity - selected.length)} more images for this upload.`); return;
    }
    lock.current = true; setUploading(true);
    const outcomes = [];
    let added = 0;
    try {
      for (let index = 0; index < files.length; index += 1) {
        if (!mounted.current) break;
        const file = files[index]; setProgress(`Uploading ${index + 1} of ${files.length}…`);
        if (!types.has(file.type) || !file.size || file.size > 10 * 1024 * 1024) {
          outcomes.push(`${file.name}: use a nonempty JPEG, PNG or WebP up to 10 MB.`);
          setResults([...outcomes]); continue;
        }
        try {
          const { media } = await mediaApi.upload(file);
          added += 1;
          if (mounted.current) setSelected((old) => [...old, media]);
          outcomes.push(`${file.name}: uploaded and selected.`);
        } catch (failure) {
          outcomes.push(`${file.name}: ${failure.message}`);
          if (failure.status === 401 || failure.status === 403) {
            outcomes.push('Remaining files were not uploaded. Check your session.'); break;
          }
        }
        if (mounted.current) setResults([...outcomes]);
      }
    } finally {
      lock.current = false;
      if (mounted.current) { setUploading(false); setResults(outcomes); setProgress(''); if (added) reload(1); }
    }
  };
  const close = () => { if (!lock.current) onClose(); };
  return <Dialog title='Add project photos' className='project-picker' onClose={close} closeDisabled={uploading}>
    <div className='project-picker__toolbar'>
      <p className='admin-hint'>Choose multiple library images or upload here. Up to 20 photos per project; 10 files per upload, 10 MB each.</p>
      <div className='admin-actions'>
        <Button variant='primary' disabled={uploading || selected.length >= capacity} onClick={() => input.current?.click()}>+ Upload images</Button>
        <Button disabled={uploading || result.loading} onClick={() => reload()}>Refresh</Button>
      </div>
      <input ref={input} type='file' hidden multiple accept='image/jpeg,image/png,image/webp' disabled={uploading} onChange={upload} aria-label='Upload project images' />
    </div>
    <div className='project-picker__body' aria-busy={uploading || result.loading}>
      {error && <Notice error>{error}</Notice>}
      {uploading && <p role='status'>{progress}</p>}
      {results.length > 0 && <ul className='project-picker__results' aria-live='polite'>{results.map((message, index) => <li key={index}>{message}</li>)}</ul>}
      {result.loading && <p role='status'>Loading images…</p>}
      {result.error && <Notice error>{result.error}</Notice>}
      {!result.loading && !result.error && !result.items.length && <p>No images yet. Upload your first image above.</p>}
      {!result.loading && <div className='project-picker__grid'>{result.items.map((image) => {
        const checked = selected.some((item) => item.id === image.id);
        const attached = existingIds.includes(image.id);
        return <button type='button' key={image.id} className={`project-picker__tile${checked ? ' is-selected' : ''}`}
          aria-pressed={checked} disabled={uploading || attached || image.deletionPending || (!checked && selected.length >= capacity)} onClick={() => toggle(image)}>
          <span className='project-picker__image'><img src={image.url} alt={image.alt || ''} loading='lazy' /></span>
          <strong title={image.filename}>{image.filename}</strong>
          <span>{attached ? 'Already in project' : image.deletionPending ? 'Pending deletion' : checked ? '✓ Selected' : 'Select image'}</span>
        </button>;
      })}</div>}
    </div>
    <div className='project-picker__footer'>
      {result.pagination && <div className='project-picker__pages'>
        <span>Page {query.page} of {Math.max(1, result.pagination.totalPages)}</span>
        <Button disabled={uploading || result.loading || query.page <= 1} onClick={() => reload(query.page - 1)}>Previous</Button>
        <Button disabled={uploading || result.loading || query.page >= result.pagination.totalPages} onClick={() => reload(query.page + 1)}>Next</Button>
      </div>}
      <p className='admin-hint'>Selection is kept across pages. Uploaded files remain in Media Library even if you cancel.</p>
      <div className='project-picker__confirm'><span aria-live='polite'>{selected.length} / {capacity} selected</span>
        <Button disabled={uploading} onClick={close}>Cancel</Button>
        <Button variant='primary' disabled={uploading || !selected.length} onClick={() => onChoose(selected)}>Add {selected.length || ''} photos</Button>
      </div>
    </div>
  </Dialog>;
}
