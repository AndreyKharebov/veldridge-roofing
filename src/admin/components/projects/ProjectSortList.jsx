import { useRef, useState } from 'react';
import { Button } from '../UI.jsx';

import { moveProjectItem } from './projectForm.js';

export default function ProjectSortList({ items, onReorder, disabled = false, renderItem, photos = false }) {
  const drag = useRef(null);
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(null);
  const rows = preview || items;
  const start = (event, id) => {
    if (disabled || event.button !== 0) return;
    const list = event.currentTarget.closest('[data-project-sort-list]');
    drag.current = { id, rows: items, pointer: event.pointerId };
    list.setPointerCapture(event.pointerId); setPreview(items); setDragging(id);
  };
  const move = (event) => {
    if (!drag.current || event.pointerId !== drag.current.pointer) return;
    const node = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-project-sort-id]');
    if (!event.currentTarget.contains(node)) return;
    const index = drag.current.rows.findIndex((row) => row.id === node?.dataset.projectSortId);
    if (index >= 0) {
      drag.current.rows = moveProjectItem(drag.current.rows, drag.current.id, index);
      setPreview(drag.current.rows);
    }
    const bounds = event.currentTarget.getBoundingClientRect();
    if (event.clientY < bounds.top + 40) event.currentTarget.scrollTop -= 18;
    if (event.clientY > bounds.bottom - 40) event.currentTarget.scrollTop += 18;
  };
  const cancel = () => { drag.current = null; setPreview(null); setDragging(null); };
  const finish = () => {
    if (!drag.current) return;
    const next = drag.current.rows;
    cancel();
    if (next.map((row) => row.id).join() !== items.map((row) => row.id).join()) onReorder(next);
  };
  const change = (item, to) => { if (!disabled && !preview) onReorder(moveProjectItem(items, item.id, to)); };
  return <ol className={`project-sort${photos ? ' project-sort--photos' : ''}`} data-project-sort-list
    onPointerMove={move} onPointerUp={finish} onPointerCancel={cancel} onLostPointerCapture={cancel}>
    {rows.map((item, index) => <li key={item.id} data-project-sort-id={item.id} className={dragging === item.id ? 'is-dragging' : ''}>
      <div className='project-sort__row'>
        <button type='button' className='project-sort__handle' disabled={disabled}
          aria-label={`Move ${item.title || item.filename}. Use arrow keys to reorder.`}
          onPointerDown={(event) => start(event, item.id)} onKeyDown={(event) => {
            if (event.key === 'Escape' && drag.current) { event.preventDefault(); event.stopPropagation(); cancel(); return; }
            if (!['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key) || disabled || preview) return;
            event.preventDefault();
            change(item, event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : index + (event.key === 'ArrowUp' ? -1 : 1));
          }}>⠿</button>
        <span className='project-sort__number'>{index + 1}</span>
        <div className='project-sort__name'><strong>{item.title || item.filename}</strong>{item.status && <small>{item.status}</small>}</div>
        <div className='project-sort__arrows'>
          <Button aria-label={`Move item ${index + 1} earlier`} disabled={disabled || Boolean(preview) || index === 0} onClick={() => change(item, index - 1)}>↑</Button>
          <Button aria-label={`Move item ${index + 1} later`} disabled={disabled || Boolean(preview) || index === rows.length - 1} onClick={() => change(item, index + 1)}>↓</Button>
        </div>
      </div>
      {renderItem && <div className='project-sort__body'>{renderItem(item, index)}</div>}
    </li>)}
  </ol>;
}
