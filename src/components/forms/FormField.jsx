import { useId } from 'react';

// Shared accessible field structure. Prefixes let Contact retain its exact styles.
export default function FormField({ name, label, error, hint, id: suppliedId, classPrefix = 'admin', children, multiline = false, ...props }) {
  const generatedId = useId();
  const id = suppliedId || `${classPrefix}-${name}-${generatedId}`;
  const describedBy = [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(' ');
  const controlProps = { ...props, id, name, className:`${classPrefix}__control`,
    'aria-invalid':Boolean(error), 'aria-describedby':describedBy || undefined };
  return <div className={`${classPrefix}__field`}>
    <label htmlFor={id}>{label}</label>
    {children ? <select {...controlProps}>{children}</select>
      : multiline ? <textarea {...controlProps} /> : <input {...controlProps} />}
    {hint && <p className={`${classPrefix}__hint`} id={`${id}-hint`}>{hint}</p>}
    {error && <p className={`${classPrefix}__field-error`} id={`${id}-error`}>{error}</p>}
  </div>;
}
