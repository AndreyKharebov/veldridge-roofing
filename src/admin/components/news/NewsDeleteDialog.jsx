import { useRef, useState } from 'react';
import { newsApi } from '../../../lib/news.js';
import Dialog from '../Dialog.jsx';
import { Button, Notice } from '../UI.jsx';

export default function NewsDeleteDialog({ item, kind = 'article', onDone, onClose }) {
  const lock = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const close = () => { if (!lock.current) onClose(); };
  const remove = async () => {
    if (lock.current) return;
    lock.current = true; setPending(true); setError('');
    try {
      if (kind === 'category') await newsApi.removeCategory(item.id);
      else await newsApi.remove(item.id);
      onDone();
    } catch (failure) {
      if (failure.status === 404) onDone();
      else setError(failure.message);
    } finally { lock.current = false; setPending(false); }
  };
  return <Dialog title={`Delete ${kind}?`} className='news-delete' onClose={close}>
    <p>Permanently delete <strong>{item.title || item.name}</strong>?</p>
    <p className='admin-hint'>{kind === 'article'
      ? 'The article will be removed from News and Blog. Its cover image stays in Media Library.'
      : 'A category used by any article, including drafts or archives, cannot be deleted. Reassign those articles first.'}</p>
    {error && <Notice error>{error}</Notice>}
    <div className='admin-actions admin-actions--end'>
      <Button disabled={pending} onClick={close}>Cancel</Button>
      <Button variant='danger' disabled={pending} onClick={remove}>{pending ? 'Deleting…' : `Delete ${kind}`}</Button>
    </div>
  </Dialog>;
}
