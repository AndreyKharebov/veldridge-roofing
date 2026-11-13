import { Link } from 'react-router';
import FormField from '../../components/forms/FormField.jsx';

export function Button({ children, variant = 'secondary', to, className = '', ...props }) {
  const classes = `admin-button admin-button--${variant} ${className}`;
  return to ? <Link className={classes} to={to} {...props}>{children}</Link>
    : <button type='button' className={classes} {...props}>{children}</button>;
}
export function Field(props) { return <FormField {...props} />; }
export function Panel({ title, description, children, className = '' }) {
  return <section className={`admin-panel ${className}`}>
    {title && <h2>{title}</h2>}{description && <p className='admin-hint'>{description}</p>}{children}
  </section>;
}
export function PageHeading({ title, description, children }) {
  return <div className='admin-heading'><div><h1>{title}</h1>{description && <p>{description}</p>}</div>{children}</div>;
}
export function Badge({ status }) {
  const labels = { 'in-progress':'In progress', new:'New', closed:'Closed', spam:'Spam', published:'Published', draft:'Draft', archived:'Archived', active:'Active' };
  return <span className={`admin-badge admin-badge--${status}`}>{labels[status] || status}</span>;
}
export function Checkbox({ label, ...props }) {
  return <label className='admin-checkbox'><input type='checkbox' {...props} /><span>{label}</span></label>;
}
export function Notice({ children, error = false }) {
  return <div className={`admin-notice${error ? ' admin-notice--error' : ''}`} role={error ? 'alert' : 'status'}>{children}</div>;
}
export function Empty({ title = 'Nothing here yet.', children }) {
  return <Panel className='admin-empty'><h2>{title}</h2>{children}</Panel>;
}
export function Wordmark() {
  return <div className='admin-wordmark'><strong>VELDRIDGE</strong><span>ROOFING</span></div>;
}
