import { useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useContent } from '../../content/context.js';
import { workspaceApi } from '../../api/workspace.js';
import Dialog from './Dialog.jsx';
import { Button, Notice } from './UI.jsx';

export default function MediaPicker({ multiple = false, onChoose, onClose }) {
  const { media } = useContent();
  const [selected,setSelected] = useState([]);
  const [dragging,setDragging] = useState(false);
  const fileRef = useRef(null);
  const client = useQueryClient();
  const upload = useMutation({ mutationFn:workspaceApi.uploadMedia, onSuccess:async (ids) => {
    await client.invalidateQueries({queryKey:['workspace','content']});
    setSelected(multiple ? ids : ids.slice(0,1));
  } });
  const choose = (id) => setSelected((previous) => !multiple ? [id]
    : previous.includes(id) ? previous.filter((value) => value !== id) : [...previous,id]);
  return <Dialog title={multiple ? 'Choose project images' : 'Choose an image'} onClose={upload.isPending ? () => {} : onClose} className='admin-dialog--media'>
    <p className='admin-hint'>Public content only. Customer inquiry attachments are never shown here.</p>
    <div className={`admin-dropzone${dragging ? ' is-dragging' : ''}`}
      onDragOver={(event) => { if (event.dataTransfer.types.includes('Files')) { event.preventDefault(); setDragging(true); } }}
      onDragLeave={() => setDragging(false)} onDrop={(event) => {
        event.preventDefault(); setDragging(false);
        if (!upload.isPending) upload.mutate(Array.from(event.dataTransfer.files));
      }}>
      <p>Drop JPG, PNG or WebP images here · Up to 10 MB each</p>
      <input ref={fileRef} type='file' accept='image/jpeg,image/png,image/webp' multiple hidden aria-label='Upload public images'
        onChange={(event) => { const files = Array.from(event.target.files); event.target.value = ''; if (files.length) upload.mutate(files); }} />
      <Button variant='primary' disabled={upload.isPending} onClick={() => fileRef.current.click()}>{upload.isPending ? 'Validating images…' : 'Upload images'}</Button>
    </div>
    {upload.isError && <Notice error>{upload.error.message}</Notice>}
    <div className='admin-media-grid'>
      {media.map((image) => <button className={`admin-media-choice${selected.includes(image.id) ? ' is-selected' : ''}`} type='button' key={image.id}
        aria-pressed={selected.includes(image.id)} onClick={() => choose(image.id)}>
        <img src={image.src} alt={image.alt || image.name} loading='lazy' />
        <span>{image.name}</span><span>{selected.includes(image.id) ? '✓ Selected' : 'Select image'}</span>
      </button>)}
    </div>
    <div className='admin-actions admin-actions--end'><span className='admin-hint'>{selected.length} selected</span>
      <Button onClick={onClose} disabled={upload.isPending}>Cancel</Button>
      <Button variant='primary' disabled={!selected.length || upload.isPending} onClick={() => onChoose(selected)}>{multiple ? 'Use images' : 'Use image'}</Button>
    </div>
  </Dialog>;
}
