import { useEffect, useRef, useState } from 'react';
import { testimonialsApi } from '../../../lib/testimonials.js';
import Dialog from '../Dialog.jsx';
import { Button, Notice } from '../UI.jsx';

export default function TestimonialDeleteDialog({ item, onClose, onDone }) {
  const lock = useRef(false);
  const mounted = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const close = () => { if (!lock.current) onClose(); };
  const remove = async () => {
    if (lock.current) return;
    lock.current = true; setPending(true); setError('');
    try {
      await testimonialsApi.remove(item.id, item.version);
      if (mounted.current) onDone();
    } catch (failure) {
      if (!mounted.current) return;
      if (failure.status === 404) onDone();
      else setError(failure.status === 409 ? 'This review changed. Close this window and reload the review before deleting.' : failure.message);
    } finally { lock.current = false; if (mounted.current) setPending(false); }
  };
  return <Dialog title='Delete review?' onClose={close}>
    <p>Permanently delete the review by <strong>{item.name}</strong>?</p>
    <p className='admin-hint'>The author photo stays in Media Library. Use Archived to hide the review without deleting it.</p>
    {error && <Notice error>{error}</Notice>}
    <div className='admin-actions admin-actions--end'>
      <Button disabled={pending} onClick={close}>Cancel</Button>
      <Button variant='danger' disabled={pending} onClick={remove}>{pending ? 'Deleting…' : 'Delete review'}</Button>
    </div>
  </Dialog>;
}
