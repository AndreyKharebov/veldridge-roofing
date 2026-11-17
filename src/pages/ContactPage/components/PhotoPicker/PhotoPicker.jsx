import { useRef, useState } from 'react';
import { photoRules } from '../../data/contactData.js';
import { formatFileSize, photoKey, selectPhotos } from '../../data/inquiry.js';
import paperclip from './assets/paperclip.svg';
import closeIcon from './assets/close.svg';
import './PhotoPicker.sass';

const PhotoPicker = ({ photos, onChange, error, onError, disabled = false }) => {
  const inputRef = useRef(null);
  const chooseRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const addPhotos = (incoming) => {
    if (disabled || !incoming.length) return;
    const result = selectPhotos(photos, incoming);
    onError(result.error);
    if (!result.error) onChange(result.files);
  };
  const removePhoto = (key) => {
    if (disabled) return;
    onChange(photos.filter((file) => photoKey(file) !== key));
    onError('');
    chooseRef.current?.focus({ preventScroll: true });
  };
  return <div className='photo-picker'>
    <p className='photo-picker__label' id='contact-photos-label'>Photos (optional)</p>
    <input ref={inputRef} type='file' accept={photoRules.accept} multiple disabled={disabled} hidden aria-label='Choose roof photos' onChange={(event) => {addPhotos(Array.from(event.currentTarget.files ?? []));event.currentTarget.value = '';}} />
    <div className={`photo-picker__dropzone${dragging ? ' is-dragging' : ''}`} onDragOver={(event) => {if (disabled || !Array.from(event.dataTransfer.types).includes('Files')) return;event.preventDefault();event.dataTransfer.dropEffect = 'copy';setDragging(true);}}
      onDragLeave={(event) => {if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false);}}
      onDrop={(event) => {event.preventDefault();setDragging(false);addPhotos(Array.from(event.dataTransfer.files));}}>
      <button ref={chooseRef} id='contact-photos' type='button' className='photo-picker__choose' disabled={disabled} aria-describedby={`contact-photos-help contact-photos-note${error ? ' contact-photos-error' : ''}`} aria-invalid={Boolean(error)} onClick={() => inputRef.current?.click()}>
        <span className='photo-picker__icon' aria-hidden='true'><img src={paperclip} alt='' /></span><span className='photo-picker__guidance'><span className='photo-picker__action'>Choose photos or drop them here</span><span className='photo-picker__help' id='contact-photos-help'>JPG, PNG or WebP · Up to 5 images, 10 MB each</span></span>
      </button>
    </div>
    {photos.length > 0 && <ul className='photo-picker__files' aria-label='Selected photos'>{photos.map((file) => <li className='photo-picker__file' key={photoKey(file)}><span className='photo-picker__file-icon' aria-hidden='true'><img src={paperclip} alt='' /></span><div className='photo-picker__file-text'><span>{file.name}</span><small>{formatFileSize(file.size)} · Ready to send</small></div><button type='button' disabled={disabled} className='photo-picker__remove' aria-label={`Remove ${file.name}`} onClick={() => removePhoto(photoKey(file))}><img src={closeIcon} alt='' aria-hidden='true' /></button></li>)}</ul>}
    {error && <div className='photo-picker__error'><p id='contact-photos-error' role='alert'>{error}</p><button type='button' disabled={disabled} onClick={() => {onError('');chooseRef.current?.focus();}}>Dismiss file error</button></div>}
    <p className='photo-picker__note' id='contact-photos-note'>Photos are uploaded only when you send the inquiry. They remain private and do not appear in the public gallery.</p><span className='photo-picker__status' role='status' aria-live='polite'>{photos.length} of {photoRules.maxCount} photos selected.</span>
  </div>;
};
export default PhotoPicker;
