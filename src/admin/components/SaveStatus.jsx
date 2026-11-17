import { createPortal } from 'react-dom';
import './SaveStatus.sass';

export default function SaveStatus({ pending = false, error = '', message = '', onDismiss }) {
  const text = pending ? message || 'Saving…' : error || message;
  if (!text) return null;
  return createPortal(
    <div className={`admin-save-status${error && !pending ? ' admin-save-status--error' : ''}`}
      role={error && !pending ? 'alert' : 'status'} aria-live={error && !pending ? 'assertive' : 'polite'} aria-atomic='true'>
      <span className='admin-save-status__symbol' aria-hidden='true'>{pending ? '…' : error ? '!' : '✓'}</span>
      <p>{text}</p>
      {!pending && onDismiss && <button type='button' aria-label='Dismiss notification' onClick={onDismiss}>×</button>}
    </div>, document.body,
  );
}
