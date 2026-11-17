import { useEffect, useRef, useState } from 'react';
import { mediaApi } from '../../../lib/media.js';
import Dialog from '../Dialog.jsx';
import { Button, Notice } from '../UI.jsx';

const types = new Set(['image/jpeg', 'image/png', 'image/webp']);
export default function ServiceImagePicker({ selectedId, onChoose, onClose, title = 'Choose a service image', entity = 'service' }) {
  const input = useRef(null);
  const uploadLock = useRef(false);
  const mounted = useRef(false);
  const [page, setPage] = useState(1);
  const [retry, setRetry] = useState(0);
  const [selected, setSelected] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [notice, setNotice] = useState('');
  const [result, setResult] = useState({ items: [], pagination: null, status: 'loading', error: '' });
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => {
    const controller = new AbortController();
    mediaApi.getAll(page, { signal: controller.signal }).then((response) => {
      if (controller.signal.aborted) return;
      const last = Math.max(1, response.pagination.totalPages);
      if (page > last) { setPage(last); return; }
      setResult({ items: response.media, pagination: response.pagination, status: 'ready', error: '' });
      setSelected((previous) => previous || response.media.find((image) => image.id === selectedId && !image.deletionPending) || null);
    }).catch((error) => {
      if (!controller.signal.aborted) setResult({ items: [], pagination: null, status: 'error', error: error.message });
    });
    return () => controller.abort();
  }, [page, retry, selectedId]);
  const reload = (nextPage = page) => {
    setResult((previous) => ({ ...previous, status: 'loading', error: '' }));
    setPage(nextPage); setRetry((value) => value + 1);
  };
  const upload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || uploadLock.current) return;
    setUploadError(''); setNotice('');
    if (!types.has(file.type) || !file.size || file.size > 10 * 1024 * 1024) {
      setUploadError('Choose a JPEG, PNG or WebP image, larger than 0 and up to 10 MB.'); return;
    }
    uploadLock.current = true; setUploading(true);
    try {
      const { media } = await mediaApi.upload(file);
      if (!mounted.current) return;
      setSelected(media);
      setNotice(`Image uploaded and selected. Click Use image to attach it to this ${entity}.`);
      reload(1);
    } catch (error) { if (mounted.current) setUploadError(error.message); }
    finally { uploadLock.current = false; if (mounted.current) setUploading(false); }
  };
  const close = () => { if (!uploadLock.current) onClose(); };
  return <Dialog title={title} className='service-image-picker' onClose={close}>
    <div className='service-image-picker__toolbar'>
      <p className='admin-hint'>Choose a library image or upload one here. JPEG, PNG or WebP · Up to 10 MB.</p>
      <div className='admin-actions'>
        <Button variant='primary' disabled={uploading} onClick={() => input.current?.click()}>{uploading ? 'Uploading…' : '+ Upload image'}</Button>
        <Button disabled={uploading || result.status === 'loading'} onClick={() => reload()}>Refresh images</Button>
      </div>
      <input ref={input} hidden type='file' accept='image/jpeg,image/png,image/webp' onChange={upload} disabled={uploading} aria-label={`Upload ${entity} image`} />
    </div>
    <div className='service-image-picker__body' aria-busy={uploading || result.status === 'loading'}>
      {uploadError && <Notice error>{uploadError}</Notice>}{notice && <Notice>{notice}</Notice>}
      {uploading && <p role='status'>Uploading to the media library…</p>}
      {result.status === 'loading' && <p role='status'>Loading images…</p>}
      {result.error && <Notice error>{result.error}</Notice>}
      {result.status === 'ready' && !result.items.length && <p className='service-image-picker__empty'>No images yet. Use Upload image above to get started.</p>}
      {result.status === 'ready' && <div className='service-image-picker__grid'>
        {result.items.map((image) => <button type='button' key={image.id}
          className={`service-image-picker__tile${selected?.id === image.id ? ' is-selected' : ''}`}
          disabled={uploading || image.deletionPending} aria-pressed={selected?.id === image.id}
          onClick={() => { setSelected(image); setNotice(''); }}>
          <span className='service-image-picker__image'><img src={image.url} alt={image.alt || ''} loading='lazy' /></span>
          <span className='service-image-picker__name' title={image.filename}>{image.filename}</span>
          <span className='service-image-picker__meta'>{image.deletionPending ? 'Pending deletion' : selected?.id === image.id ? '✓ Selected' : `${Math.ceil(image.size / 1024)} KB`}</span>
        </button>)}
      </div>}
    </div>
    <div className='service-image-picker__footer'>
      {result.pagination && <div className='service-image-picker__pages'>
        <span>Page {page} of {Math.max(1, result.pagination.totalPages)}</span>
        <Button disabled={uploading || page <= 1 || result.status === 'loading'} onClick={() => reload(page - 1)}>Previous</Button>
        <Button disabled={uploading || page >= result.pagination.totalPages || result.status === 'loading'} onClick={() => reload(page + 1)}>Next</Button>
      </div>}
      <p className='admin-hint'>Uploads remain in Media Library even if you cancel this form.</p>
      <div className='service-image-picker__confirm'>
        <span className='admin-hint'>{selected ? selected.filename : 'No image selected'}</span>
        <Button disabled={uploading} onClick={close}>Cancel</Button>
        <Button variant='primary' disabled={uploading || !selected || selected.deletionPending} onClick={() => onChoose(selected)}>Use image</Button>
      </div>
    </div>
  </Dialog>;
}
