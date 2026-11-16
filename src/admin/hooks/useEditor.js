import { useRef, useState } from 'react';
import { logForm } from '../../utils/logForm.js';

// Local input state only. Submitting never creates/updates a content record.
export function useEditor(initial, formName) {
  const [values, setValues] = useState(() => structuredClone(initial));
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef(null);
  const update = (name, value) => {
    setSubmitted(false);
    setValues((previous) => ({ ...previous, [name]: value }));
  };
  const field = (name) => ({
    name,
    value: values[name] ?? '',
    onChange: (event) => update(name, event.target.value),
  });
  const log = (payload = values) => {
    logForm(formName, payload);
    setSubmitted(true);
  };
  const submit = (event) => {
    event.preventDefault();
    log();
  };
  return [formRef, { values, update, field, submit, log, submitted }];
}
