import { useEffect, useRef, useState } from 'react';
import { inquiriesApi } from '../../../lib/inquiries.js';
import Dialog from '../Dialog.jsx';
import { Button, Notice } from '../UI.jsx';

export default function InquiryDeleteDialog({ inquiry, onClose, onDeleted }) {
  const lock = useRef(false);
  const mounted = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const close = () => { if (!lock.current) onClose(); };
  const remove = async () => {
    if (lock.current) return;
    lock.current = true; setPending(true); setError('');
    try { await inquiriesApi.remove(inquiry.id, inquiry.version); if (mounted.current) onDeleted(); }
    catch (failure) {
      if (!mounted.current) return;
      if (failure.status === 404) onDeleted(); else setError(failure.message);
    } finally { lock.current = false; if (mounted.current) setPending(false); }
  };
  return <Dialog title='Delete inquiry?' className='inquiry-delete' onClose={close}>
    <p>Permanently delete the inquiry from <strong>{inquiry.name}</strong>?</p>
    <p className='admin-hint'>The message, contact details, internal notes and private photos will be deleted. This cannot be undone. Public Media Library images are not affected.</p>
    {error && <Notice error>{error}</Notice>}
    <div className='admin-actions admin-actions--end'>
      <Button disabled={pending} onClick={close}>Cancel</Button>
      <Button variant='danger' disabled={pending} onClick={remove}>{pending ? 'Deleting…' : 'Delete inquiry'}</Button>
    </div>
  </Dialog>;
}
