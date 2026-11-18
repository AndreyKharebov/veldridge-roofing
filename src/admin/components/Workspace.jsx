import { Button } from './UI.jsx';
import '../Workspace.css';

// Presentational components only. Callers retain API, validation and routing logic.
export function ListToolbar({ children, label = 'List filters', className = '' }) {
  return <section className={`admin-list-toolbar ${className}`} aria-label={label}>{children}</section>;
}

export function StatusFilters({ options, value, onChange, disabled = false, label = 'Status' }) {
  return <div className='admin-status-filter'>
    <span className='admin-toolbar-label'>{label}</span>
    <div className='admin-status-filter__options' role='group' aria-label={label}>
      {options.map(([key, text]) => <Button key={key} disabled={disabled}
        aria-pressed={value === key} onClick={() => { if (!disabled && key !== value) onChange(key); }}>
        {text}
      </Button>)}
    </div>
  </div>;
}

export function Pagination({ pagination, page = pagination?.page ?? 1, onPageChange, disabled = false, noun = 'records' }) {
  if (!pagination) return null;
  const total = Math.max(0, Number(pagination.total) || 0);
  const pages = Math.max(1, Number(pagination.totalPages) || 1);
  const current = Math.min(pages, Math.max(1, Number(page) || 1));
  const change = (next) => {
    if (!disabled && next >= 1 && next <= pages && next !== current) onPageChange(next);
  };
  return <nav className='admin-pagination' aria-label={`${noun} pages`}>
    <p>{total} {noun}<span aria-hidden='true'> · </span>Page {current} of {pages}</p>
    <div className='admin-pagination__actions'>
      <Button disabled={disabled || current <= 1} onClick={() => change(current - 1)}>Previous</Button>
      <Button disabled={disabled || current >= pages} onClick={() => change(current + 1)}>Next</Button>
    </div>
  </nav>;
}

export function SaveBar({ pending = false, disabled = false, dirty = false, message = '', error = '',
  submitLabel = 'Save changes', onCancel, cancelLabel = 'Cancel', formId }) {
  const text = pending ? submitLabel : error || message || (dirty ? 'Unsaved changes' : 'No unsaved changes');
  return <div className={`admin-savebar${error ? ' admin-savebar--error' : ''}`} aria-busy={pending}>
    <p className='admin-savebar__message'>{text}</p>
    <div className='admin-savebar__actions'>
      {onCancel && <Button disabled={pending} onClick={onCancel}>{cancelLabel}</Button>}
      <Button type='submit' form={formId} variant='primary' disabled={pending || disabled}>{submitLabel}</Button>
    </div>
  </div>;
}

export function DangerZone({ title, children, actionLabel, onAction, disabled = false }) {
  return <section className='admin-danger-zone'>
    <div className='admin-danger-zone__copy'><h2>{title}</h2>{children}</div>
    <Button variant='danger' disabled={disabled} onClick={onAction}>{actionLabel}</Button>
  </section>;
}

export function FormActions({ children }) {
  return <div className='admin-form-actions'>{children}</div>;
}
