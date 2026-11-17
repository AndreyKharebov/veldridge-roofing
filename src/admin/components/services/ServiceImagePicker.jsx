import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { mediaApi } from '../../../lib/media.js';
import Dialog from '../Dialog.jsx';
import { Button, Empty, Notice } from '../UI.jsx';

export default function ServiceImagePicker({ selectedId, onChoose, onClose }) {
  const [page, setPage] = useState(1);
  const [retry, setRetry] = useState(0);
  const [result, setResult] = useState({ items: [], pagination: null, status: 'loading', error: '' });
  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setResult((previous) => ({ ...previous, status: 'loading', error: '' }));
      try {
        const response = await mediaApi.getAll(page, { signal: controller.signal });
        if (controller.signal.aborted) return;
        const last = Math.max(1, response.pagination.totalPages);
        if (page > last) { setPage(last); return; }
        setResult({ items: response.media, pagination: response.pagination, status: 'ready', error: '' });
      } catch (error) {
        if (!controller.signal.aborted) setResult({ items: [], pagination: null, status: 'error', error: error.message });
      }
    };
    void load();
    return () => controller.abort();
  }, [page, retry]);
  return <Dialog title='Choose a service image' className='admin-dialog--media service-image-picker' onClose={onClose}>
    <p className='admin-hint'>Select an image already uploaded to the library. Choosing it does not create another copy.</p>
    <div className='admin-actions'>
      <Link className='admin-button' to='/admin/media' target='_blank' rel='noopener noreferrer'>Open Media Library ↗</Link>
      <Button disabled={result.status === 'loading'} onClick={() => setRetry((value) => value + 1)}>Refresh images</Button>
    </div>
    {result.status === 'loading' && <p role='status'>Loading images…</p>}
    {result.error && <Notice error>{result.error}</Notice>}
    {result.status === 'ready' && !result.items.length && <Empty title='No images yet.'>Upload an image in Media Library, then click Refresh images.</Empty>}
    {result.status === 'ready' && <div className='service-image-picker__grid'>
      {result.items.map((image) => <button type='button' key={image.id}
        className={`admin-media-choice${selectedId === image.id ? ' is-selected' : ''}`}
        disabled={image.deletionPending} aria-pressed={selectedId === image.id}
        onClick={() => onChoose(image)}>
        <img src={image.url} alt={image.alt || ''} loading='lazy' />
        <strong>{image.filename}</strong>
        <span className='admin-hint'>{image.deletionPending ? 'Deletion pending — unavailable' : 'Use this image'}</span>
      </button>)}
    </div>}
    {result.pagination && <div className='admin-actions'>
      <p className='admin-hint'>Page {page} of {Math.max(1, result.pagination.totalPages)}</p>
      <span className='admin-spacer' />
      <Button disabled={page <= 1 || result.status === 'loading'} onClick={() => setPage((value) => value - 1)}>Previous</Button>
      <Button disabled={page >= result.pagination.totalPages || result.status === 'loading'} onClick={() => setPage((value) => value + 1)}>Next</Button>
    </div>}
  </Dialog>;
}
