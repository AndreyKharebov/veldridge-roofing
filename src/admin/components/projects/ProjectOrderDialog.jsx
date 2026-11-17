import { useEffect, useRef, useState } from 'react';
import { projectsApi } from '../../../lib/projects.js';
import Dialog from '../Dialog.jsx';
import { Button, Notice } from '../UI.jsx';
import ProjectSortList from './ProjectSortList.jsx';

export default function ProjectOrderDialog({ onClose, onChanged }) {
  const [catalog, setCatalog] = useState(null);
  const [rows, setRows] = useState([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [retry, setRetry] = useState(0);
  const lock = useRef(false);
  const mounted = useRef(false);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => {
    const controller = new AbortController();
    projectsApi.getOrder({ signal: controller.signal }).then((data) => {
      if (!controller.signal.aborted) { setCatalog(data); setRows(data.projects); }
    }).catch((failure) => { if (!controller.signal.aborted) setError(failure.message); });
    return () => controller.abort();
  }, [retry]);
  const save = async (next) => {
    if (lock.current || !catalog || error || next.map((row) => row.id).join() === catalog.projects.map((row) => row.id).join()) return;
    lock.current = true; setPending(true); setRows(next); setNotice('');
    try {
      const data = await projectsApi.reorder({ ids: next.map((row) => row.id), revision: catalog.revision });
      if (mounted.current) { setCatalog(data); setRows(data.projects); setNotice('Order saved automatically.'); onChanged(); }
    } catch (failure) {
      if (mounted.current) { setRows(catalog.projects); setError(failure.message); }
    } finally { lock.current = false; if (mounted.current) setPending(false); }
  };
  const close = () => { if (!lock.current) onClose(); };
  return <Dialog title='Arrange projects' className='project-order' onClose={close}>
    <p className='admin-hint'>Drag a handle, use its arrow keys, or use ↑/↓ buttons. The list includes all pages, drafts and archives. Changes save automatically.</p>
    {error && <Notice error><p>{error}</p><Button disabled={pending} onClick={() => { setCatalog(null); setError(''); setNotice(''); setRetry((value) => value + 1); }}>Reload order</Button></Notice>}
    {!catalog && !error && <p role='status'>Loading projects…</p>}
    {catalog && <ProjectSortList items={rows} disabled={pending || Boolean(error)} onReorder={save} />}
    {catalog && !rows.length && <p>No projects yet.</p>}
    <p role='status' className='admin-hint'>{pending ? 'Saving order…' : notice}</p>
    <div className='admin-actions admin-actions--end'><Button disabled={pending} onClick={close}>Done</Button></div>
  </Dialog>;
}
