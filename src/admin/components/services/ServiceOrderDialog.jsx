import { useEffect, useRef, useState } from 'react';
import { servicesApi } from '../../../lib/services.js';
import Dialog from '../Dialog.jsx';
import { Button, Notice } from '../UI.jsx';

const labels = { main: 'Detailed service sections', supporting: 'Additional care cards' };
export default function ServiceOrderDialog({ onClose, onChanged }) {
  const [group, setGroup] = useState('main');
  const [catalog, setCatalog] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [dragging, setDragging] = useState(null);
  const [retry, setRetry] = useState(0);
  const mounted = useRef(false);
  const lock = useRef(false);
  const drag = useRef(null);
  const rowsRef = useRef([]);
  const applyRows = (next) => { rowsRef.current = next; setRows(next); };
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => {
    const controller = new AbortController();
    servicesApi.getOrder({ signal: controller.signal }).then((data) => {
      if (controller.signal.aborted) return;
      setCatalog(data); rowsRef.current = data.groups[group]; setRows(data.groups[group]); setLoading(false);
    }).catch((failure) => { if (!controller.signal.aborted) { setError(failure.message); setLoading(false); } });
    return () => controller.abort();
  }, [group, retry]);
  const reload = () => { setLoading(true); setError(''); setNotice(''); setRetry((value) => value + 1); };
  const save = async (next) => {
    if (lock.current || !catalog) return;
    if (next.map(({ id }) => id).join() === catalog.groups[group].map(({ id }) => id).join()) return;
    lock.current = true; setPending(true); setError(''); setNotice('');
    applyRows(next);
    try {
      const data = await servicesApi.reorder({ group, ids: next.map(({ id }) => id), revision: catalog.revision });
      if (!mounted.current) return;
      setCatalog(data); applyRows(data.groups[group]); setNotice('Order saved automatically.'); onChanged();
    } catch (failure) {
      if (!mounted.current) return;
      applyRows(catalog.groups[group]);
      setError(failure.status === 409 ? 'The list changed in another tab. Reload the order and try again.' : failure.message);
    } finally { lock.current = false; if (mounted.current) setPending(false); }
  };
  const move = (id, position) => {
    const current = rowsRef.current;
    const index = current.findIndex((item) => item.id === id);
    if (index < 0 || position < 0 || position >= current.length || index === position) return current;
    const next = [...current]; const [item] = next.splice(index, 1); next.splice(position, 0, item); return next;
  };
  const startDrag = (event, id) => {
    if (event.button !== 0 || pending || loading || error) return;
    drag.current = { id, initial: rowsRef.current, pointer: event.pointerId };
    event.currentTarget.closest('.service-order__list').setPointerCapture(event.pointerId);
    setDragging(id); setNotice('');
  };
  const moveDrag = (event) => {
    if (!drag.current) return;
    const node = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-service-order-id]');
    const index = rowsRef.current.findIndex((row) => row.id === node?.dataset.serviceOrderId);
    if (index >= 0) applyRows(move(drag.current.id, index));
    const container = event.currentTarget.closest('.service-order__list');
    if (container) {
      const rect = container.getBoundingClientRect();
      if (event.clientY < rect.top + 45) container.scrollTop -= 16;
      else if (event.clientY > rect.bottom - 45) container.scrollTop += 16;
    }
  };
  const endDrag = () => {
    if (!drag.current) return;
    drag.current = null; setDragging(null); void save(rowsRef.current);
  };
  const cancelDrag = () => { if (drag.current) applyRows(drag.current.initial); drag.current = null; setDragging(null); };
  const close = () => { if (!lock.current && !drag.current) onClose(); };
  const unavailable = pending || loading || Boolean(error);
  return <Dialog title='Arrange services' className='service-order' onClose={close}>
    <label className='admin__field'><span>Placement group</span><select className='admin__control' value={group} disabled={pending || Boolean(dragging)} onChange={(event) => {
      setGroup(event.target.value); setLoading(true); setError(''); setNotice('');
    }}>{Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
    <p className='admin-hint'>Drag the handle, use its ↑/↓ keys, or use the arrow buttons. Changes save automatically. This list includes all pages, drafts and archived services in the selected group.</p>
    {error && <Notice error><p>{error}</p><Button onClick={reload}>Reload order</Button></Notice>}
    {loading ? <p role='status'>Loading service order…</p> : <ol className='service-order__list' onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={cancelDrag} onLostPointerCapture={cancelDrag}>
      {rows.map((item, index) => <li key={item.id} data-service-order-id={item.id} className={dragging === item.id ? 'is-dragging' : ''}>
        <button type='button' className='service-order__handle' aria-label={`Move ${item.title}. Use arrow keys to reorder.`} disabled={unavailable}
          onPointerDown={(event) => startDrag(event, item.id)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') { cancelDrag(); return; }
            if (!['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key) || unavailable) return;
            event.preventDefault();
            const position = event.key === 'Home' ? 0 : event.key === 'End' ? rows.length - 1 : index + (event.key === 'ArrowUp' ? -1 : 1);
            void save(move(item.id, position));
          }}>⠿</button>
        <span className='service-order__number'>{index + 1}</span>
        <div className='service-order__name'><strong>{item.title}</strong><small>{item.status === 'active' ? 'Published' : item.status}</small></div>
        <div className='service-order__arrows'><Button aria-label={`Move ${item.title} up`} disabled={unavailable || Boolean(dragging) || index === 0} onClick={() => void save(move(item.id, index - 1))}>↑</Button><Button aria-label={`Move ${item.title} down`} disabled={unavailable || Boolean(dragging) || index === rows.length - 1} onClick={() => void save(move(item.id, index + 1))}>↓</Button></div>
      </li>)}
    </ol>}
    {!loading && !rows.length && <p>No services in this group.</p>}
    <p className='service-order__status' role='status'>{pending ? 'Saving order…' : notice || 'Positions are assigned automatically, without duplicates.'}</p>
    <div className='admin-actions admin-actions--end'><Button disabled={pending || Boolean(dragging)} onClick={close}>Done</Button></div>
  </Dialog>;
}
