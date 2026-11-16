import { useRef, useState } from 'react';
import { useObjectUrls } from '../../hooks/useObjectUrls.js';
import { logForm } from '../../utils/logForm.js';
import Dialog from './Dialog.jsx';
import { Button, Notice } from './UI.jsx';
import './MediaPicker.sass';

export default function MediaPicker({ multiple = false, onChoose, onClose }) {
  const [images, setImages] = useState([]);
  const [selected, setSelected] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);
  const urls = useObjectUrls();
  const selectFiles = (files) => {
    if (!files.length) return;
    const limit = multiple ? 20 : 1;
    if (files.length > limit || (multiple && images.length + files.length > limit)) {
      setError(`Choose up to ${limit} image${multiple ? 's' : ''}.`);
      return;
    }
    if (files.some((file) => !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || !file.size || file.size > 10 * 1024 * 1024)) {
      setError('Choose non-empty JPG, PNG or WebP files up to 10 MB each.');
      return;
    }
    if (!multiple) images.forEach((image) => urls.release(image.src));
    const additions = files.map((file) => ({ id: crypto.randomUUID(), file, src: urls.create(file) }));
    setImages((previous) => multiple ? [...previous, ...additions] : additions);
    setSelected((previous) => multiple ? [...previous, ...additions.map(({ id }) => id)] : [additions[0].id]);
    setError('');
    logForm('Image selection', { files });
  };
  const choose = (id) => setSelected((previous) => !multiple ? [id]
    : previous.includes(id) ? previous.filter((value) => value !== id) : [...previous, id]);
  return <Dialog title={multiple ? 'Choose project images' : 'Choose an image'} onClose={onClose} className='admin-dialog--media'>
    <div className='admin-media-body'>
      <p className='admin-hint'>Local form previews only. There is no media library or upload connection.</p>
      <div className={`admin-dropzone${dragging ? ' is-dragging' : ''}`}
        onDragOver={(event) => { if (Array.from(event.dataTransfer.types).includes('Files')) { event.preventDefault(); setDragging(true); } }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => { event.preventDefault(); setDragging(false); selectFiles(Array.from(event.dataTransfer.files)); }}>
        <p>Drop JPG, PNG or WebP images here · Up to 10 MB each</p>
        <input ref={fileRef} type='file' accept='image/jpeg,image/png,image/webp' multiple={multiple} hidden aria-label='Choose local images'
          onChange={(event) => { const files = Array.from(event.target.files || []); event.target.value = ''; selectFiles(files); }} />
        <Button variant='primary' onClick={() => fileRef.current.click()}>Choose files</Button>
      </div>
      {error && <Notice error>{error}</Notice>}
      {!images.length && <p className='admin-hint' role='status'>No local images selected.</p>}
      <div className='admin-media-grid'>{images.map((image) =>
        <button className={`admin-media-choice${selected.includes(image.id) ? ' is-selected' : ''}`} type='button' key={image.id}
          aria-pressed={selected.includes(image.id)} onClick={() => choose(image.id)}>
          <img src={image.src} alt={image.file.name} />
          <span>{image.file.name}</span><span>{selected.includes(image.id) ? '✓ Selected' : 'Select image'}</span>
        </button>)}
      </div>
    </div>
    <div className='admin-media-footer admin-actions admin-actions--end'>
      <span className='admin-hint' role='status' aria-live='polite'>{selected.length} selected</span>
      <Button onClick={onClose}>Cancel</Button>
      <Button variant='primary' disabled={!selected.length} onClick={() => onChoose(images.filter(({ id }) => selected.includes(id)).map(({ file }) => file))}>{multiple ? 'Use images' : 'Use image'}</Button>
    </div>
  </Dialog>;
}
