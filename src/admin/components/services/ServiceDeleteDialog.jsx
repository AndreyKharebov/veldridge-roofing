import { useEffect, useRef, useState } from 'react';
import { servicesApi } from '../../../lib/services.js';
import Dialog from '../Dialog.jsx';
import { Button, Notice } from '../UI.jsx';

export default function ServiceDeleteDialog({ service, onDeleted, onClose }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const running = useRef(false);
  const mounted = useRef(false);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const close = () => { if (!running.current) onClose(); };
  const remove = async () => {
    if (running.current) return;
    running.current = true; setPending(true); setError('');
    try {
      await servicesApi.remove(service.id);
      if (mounted.current) onDeleted();
    } catch (failure) {
      if (!mounted.current) return;
      if (failure.status === 404) onDeleted();
      else setError(failure.status === 401 ? 'Sign in again before deleting this service.' : failure.message);
    } finally { running.current = false; if (mounted.current) setPending(false); }
  };
  return <Dialog title='Delete service?' className='service-delete' onClose={close}>
    <p>Permanently delete <strong>{service.title}</strong>?</p>
    <p className='admin-hint'>This cannot be undone. The image stays in Media Library. Choose Archived instead to hide a service without deleting it.</p>
    {error && <Notice error>{error}</Notice>}
    <div className='admin-actions admin-actions--end'>
      <Button disabled={pending} onClick={close}>Cancel</Button>
      <Button variant='danger' disabled={pending} onClick={remove}>{pending ? 'Deleting…' : 'Delete service'}</Button>
    </div>
  </Dialog>;
}
