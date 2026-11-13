import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { lockBodyScroll } from '../../utils/lockBodyScroll.js';
import { Button } from './UI.jsx';

export default function Dialog({ title, children, onClose, className = '' }) {
  const ref = useRef(null);
  const headingId = useId();
  const callback = useRef(onClose);
  useEffect(() => { callback.current = onClose; },[onClose]);
  useEffect(() => {
    const dialog = ref.current;
    const opener = document.activeElement;
    const pathname = window.location.pathname;
    const unlock = lockBodyScroll();
    dialog.showModal();
    return () => {
      dialog.close(); unlock();
      if (window.location.pathname === pathname && opener?.isConnected) opener.focus({preventScroll:true});
    };
  },[]);
  return createPortal(<dialog ref={ref} className={`admin-dialog ${className}`} aria-labelledby={headingId}
    onCancel={(event) => { event.preventDefault(); callback.current?.(); }}>
    <div className='admin-dialog__heading'><h2 id={headingId}>{title}</h2><Button aria-label='Close dialog' onClick={onClose}>×</Button></div>
    {children}
  </dialog>,document.body);
}
export function ConfirmDialog({ title, children, action = 'Confirm', danger = false, pending = false, onConfirm, onClose }) {
  return <Dialog title={title} onClose={pending ? () => {} : onClose}>
    <div className='admin-dialog__body'>{children}</div>
    <div className='admin-actions admin-actions--end'>
      <Button onClick={onClose} disabled={pending}>Cancel</Button>
      <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} disabled={pending}>{pending ? 'Saving…' : action}</Button>
    </div>
  </Dialog>;
}
