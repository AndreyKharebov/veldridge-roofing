const FormField = ({ name, label, error, children, multiline = false, ...props }) => {
  const id = `contact-${name}`;
  const controlProps = {
    ...props,
    id,
    name,
    className: 'inquiry-form__control',
    'aria-invalid': Boolean(error),
    'aria-describedby': error ? `${id}-error` : undefined,
  };
  return (
    <div className='inquiry-form__field'>
      <label htmlFor={id}>{label}</label>
      {children ? <select {...controlProps}>{children}</select>
        : multiline ? <textarea {...controlProps} /> : <input {...controlProps} />}
      {error && <p className='inquiry-form__field-error' id={`${id}-error`}>{error}</p>}
    </div>
  );
};
export default FormField;
