import { useState } from 'react';
import { useContent } from '../../content/context.js';
import { Button, Field, Panel } from './UI.jsx';
import MediaPicker from './MediaPicker.jsx';
export default function ImageField({ editor, title = 'Cover image' }) {
  const { media } = useContent();
  const [open,setOpen] = useState(false);
  const selected = media.find(({ id }) => id === editor.values.imageId);
  return <Panel title={title}>
    {selected ? <img className='admin-cover' src={selected.src} alt={editor.values.imageAlt || selected.name} /> : <div className='admin-image-placeholder'>No image selected</div>}
    <Button onClick={() => setOpen(true)}>{selected ? 'Replace image' : 'Choose image'}</Button>
    {editor.mutation.error?.fields?.imageId && <p className='admin__field-error'>{editor.mutation.error.fields.imageId}</p>}
    <Field label='Image description *' {...editor.field('imageAlt')} maxLength={250} />
    {open && <MediaPicker onClose={() => setOpen(false)} onChoose={([id]) => {
      editor.update('imageId',id);
      if ('homeImageId' in editor.values) editor.update('homeImageId',id);
      if (!editor.values.imageAlt) editor.update('imageAlt',media.find((item) => item.id === id)?.alt || '');
      setOpen(false);
    }} />}
  </Panel>;
}
