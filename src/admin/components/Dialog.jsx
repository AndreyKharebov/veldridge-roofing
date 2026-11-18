import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { lockBodyScroll } from '../../utils/lockBodyScroll.js';
import { Button } from './UI.jsx';

export default function Dialog({ title, children, onClose, className = '', closeDisabled = false }) {
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
    onCancel={(event) => { event.preventDefault(); if (!closeDisabled) callback.current?.(); }}>
    <div className='admin-dialog__heading'><h2 id={headingId}>{title}</h2><Button aria-label='Close dialog' disabled={closeDisabled} onClick={onClose}>×</Button></div>
    {children}
  </dialog>,document.body);
}
export function ConfirmDialog({ title, children, action = 'Confirm', danger = false, pending = false, pendingLabel, onConfirm, onClose }) {
  return <Dialog title={title} onClose={pending ? () => {} : onClose} closeDisabled={pending}>
    <div className='admin-dialog__body'>{children}</div>
    <div className='admin-dialog__actions'>
      <Button onClick={onClose} disabled={pending}>Cancel</Button>
      <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} disabled={pending}>{pending ? (pendingLabel || (danger ? 'Deleting…' : 'Saving…')) : action}</Button>
    </div>
  </Dialog>;
}
