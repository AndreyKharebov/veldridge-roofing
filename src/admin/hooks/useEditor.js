import { useCallback, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useEditor(initial,save) {
  const [values,setValues] = useState(() => structuredClone(initial));
  const [baseline,setBaseline] = useState(() => JSON.stringify(initial));
  const [saved,setSaved] = useState(false);
  const formRef = useRef(null);
  const setFormElement = useCallback((element) => { formRef.current = element; },[]);
  const client = useQueryClient();
  const mutation = useMutation({ mutationFn:save, onSuccess:async (result) => {
    setValues(result); setBaseline(JSON.stringify(result)); setSaved(true);
    await client.invalidateQueries({queryKey:['workspace']});
  }, onError:(error) => {
    const name = Object.keys(error.fields || {})[0];
    window.requestAnimationFrame(() => {
      const control = name && formRef.current?.elements.namedItem(name);
      if (control instanceof HTMLElement) control.focus();
      else formRef.current?.querySelector('[role="alert"]')?.focus();
    });
  } });
  const update = (name,value) => { setSaved(false); setValues((previous) => ({...previous,[name]:value})); };
  const field = (name) => ({ name, value:values[name] ?? '', onChange:(event) => update(name,event.target.value), error:mutation.error?.fields?.[name] });
  const submit = (event) => {
    event.preventDefault();
    if (mutation.isPending) return;
    mutation.mutate(values);
  };
  return [setFormElement, { values,setValues,update,field,submit,mutation,saved,dirty:JSON.stringify(values) !== baseline }];
}
