import { useState } from 'react';
import { useObjectUrls } from '../../hooks/useObjectUrls.js';
import { Button, Field, Panel } from './UI.jsx';
import MediaPicker from './MediaPicker.jsx';

export default function ImageField({ editor, title = 'Cover image' }) {
  const [open, setOpen] = useState(false);
  const urls = useObjectUrls();
  const { values, update } = editor;
  const select = ([file]) => {
    if (!file) return;
    urls.release(values.imagePreview);
    update('imageFile', file);
    update('imagePreview', urls.create(file));
    setOpen(false);
  };
  return <Panel title={title}>
    {values.imagePreview ? <img className='admin-cover' src={values.imagePreview} alt={values.imageAlt || values.imageFile?.name || ''} /> : <div className='admin-image-placeholder'>No image selected</div>}
    <Button onClick={() => setOpen(true)}>{values.imagePreview ? 'Replace image' : 'Choose image'}</Button>
    <Field label='Image description *' {...editor.field('imageAlt')} maxLength={250} />
    <p className='admin-hint'>Preview only. This file is not uploaded or saved.</p>
    {open && <MediaPicker onClose={() => setOpen(false)} onChoose={select} />}
  </Panel>;
}
