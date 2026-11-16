import { useEffect, useRef, useState } from 'react';
import { mediaApi } from '../../../lib/media.js';
import Dialog from '../Dialog.jsx';
import { Button, Notice } from '../UI.jsx';

export default function MediaDeleteDialog({ items, onDeleted, onClose, onBusy }) {
  // The confirmation applies only to this snapshot, never to unseen pages.
  const [remaining, setRemaining] = useState(items);
  const [failures, setFailures] = useState([]);
  const [pending, setPending] = useState(false);
  const [completed, setCompleted] = useState(0);
  const [removedCount, setRemovedCount] = useState(0);
  const running = useRef(false);
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const close = () => { if (!running.current) onClose(); };
  const remove = async () => {
    if (running.current || !remaining.length) return;
    running.current = true;
    setPending(true);
    setCompleted(0);
    setFailures([]);
    onBusy(true);
    const deletedIds = [];
    const failed = [];
    try {
      for (let index = 0; index < remaining.length; index += 1) {
        if (!mounted.current) break;
        const item = remaining[index];
        try {
          await mediaApi.remove(item.id);
          deletedIds.push(item.id);
        } catch (error) {
          if (error.status === 404) {
            // Another tab may already have removed this record.
            deletedIds.push(item.id);
          } else {
            failed.push({ item, message: error.message });
            if (error.status === 401 || error.status === 403) {
              for (const unprocessed of remaining.slice(index + 1)) {
                failed.push({ item: unprocessed, message: 'Not attempted. Check your session and access before retrying.' });
              }
              break;
            }
          }
        }
        if (mounted.current) setCompleted(index + 1);
      }
      if (!mounted.current) return;
      if (deletedIds.length) onDeleted(deletedIds);
      setRemovedCount((count) => count + deletedIds.length);
      setFailures(failed);
      setRemaining(failed.map(({ item }) => item));
      if (!failed.length) onClose();
    } finally {
      running.current = false;
      if (mounted.current) { setPending(false); onBusy(false); }
    }
  };

  const count = remaining.length;
  return (
    <Dialog title={items.length === 1 ? 'Delete image?' : 'Delete selected images?'} className='media-delete' onClose={close}>
      <div className='media-delete__body' aria-busy={pending}>
        <p>{failures.length ? `${removedCount} removed from the library. ${count} could not be removed.`
          : `Permanently delete ${count} ${count === 1 ? 'image' : 'images'}?`}</p>
        <p className='admin-hint'>Files will be removed from Cloudflare R2 and MongoDB. This cannot be undone. Only the images listed below are included.</p>
        <ul className='media-delete__list' aria-label='Images to delete'>
          {remaining.map((item) => <li key={item.id}>{item.filename}</li>)}
        </ul>
        {pending && <div className='media-library__progress' role='status'>
          <span>Deleting {Math.min(completed + 1, count)} of {count}…</span>
          <progress value={completed} max={Math.max(count, 1)} aria-label='Images processed' />
        </div>}
        {failures.length > 0 && <Notice error>
          <p>Some images could not be deleted. Retrying will only process the remaining images.</p>
          <ul className='media-delete__failures'>{failures.map(({ item, message }) => (
            <li key={item.id}><strong>{item.filename}:</strong> {message}</li>
          ))}</ul>
        </Notice>}
        <div className='media-delete__actions'>
          <Button disabled={pending} onClick={close}>{failures.length ? 'Close' : 'Cancel'}</Button>
          <Button variant='danger' disabled={pending || !count} onClick={remove}>
            {pending ? 'Deleting…' : failures.length ? `Retry ${count} remaining` : `Delete ${count === 1 ? 'image' : `${count} images`}`}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
