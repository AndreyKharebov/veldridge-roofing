import { useEffect, useRef, useState } from 'react';
import { projectsApi } from '../../../lib/projects.js';
import Dialog from '../Dialog.jsx';
import { Button, Notice } from '../UI.jsx';
import { projectFailure } from './projectForm.js';

export default function ProjectDeleteDialog({ project, onDeleted, onClose }) {
  const lock = useRef(false);
  const mounted = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const close = () => { if (!lock.current) onClose(); };
  const remove = async () => {
    if (lock.current) return;
    lock.current = true; setPending(true); setError('');
    try { await projectsApi.remove(project.id); if (mounted.current) onDeleted(project.id); }
    catch (failure) {
      if (!mounted.current) return;
      if (failure.status === 404) onDeleted(project.id);
      else setError(projectFailure(failure));
    } finally { lock.current = false; if (mounted.current) setPending(false); }
  };
  return <Dialog title='Delete project?' className='project-delete' onClose={close}>
    <p>Permanently delete <strong>{project.title}</strong>?</p>
    <p className='admin-hint'>This cannot be undone. Its original images stay in Media Library. To hide the project instead, choose Archived.</p>
    {error && <Notice error>{error}</Notice>}
    <div className='admin-actions admin-actions--end'>
      <Button disabled={pending} onClick={close}>Cancel</Button>
      <Button variant='danger' disabled={pending} onClick={remove}>{pending ? 'Deleting…' : 'Delete project'}</Button>
    </div>
  </Dialog>;
}
