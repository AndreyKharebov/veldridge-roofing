import { useState } from 'react';
import { Button, Field } from '../UI.jsx';
import ProjectSortList from './ProjectSortList.jsx';

export default function ProjectPhotos({ photos, coverPhotoId, onChange, onCover, disabled }) {
  const [selected, setSelected] = useState('');
  const photo = photos.find((item) => item.id === selected) || photos[0];
  const updatePhoto = (name, value) => onChange(photos.map((item) => item.id === photo.id ? { ...item, [name]: value } : item));
  const remove = (item) => {
    const next = photos.filter((entry) => entry.id !== item.id);
    onChange(next);
    if (coverPhotoId === item.mediaId) onCover(next[0]?.mediaId || null);
    if (selected === item.id) setSelected('');
  };
  return <>
    <p className='admin-hint'>Drag handles or use ↑/↓ to arrange photos. Photo order, captions and cover are saved with the project. Removing a photo here does not delete the library image.</p>
    <ProjectSortList items={photos} onReorder={onChange} disabled={disabled} photos renderItem={(item, index) => <>
      <button type='button' className='project-editor__photo-button' disabled={disabled}
        aria-label={`Edit photo ${index + 1}: ${item.filename}`} aria-pressed={photo?.id === item.id} onClick={() => setSelected(item.id)}>
        {item.src ? <img src={item.src} alt={item.alt || item.libraryAlt || ''} loading='lazy' /> : <span>Image unavailable</span>}
      </button>
      <div className='project-editor__photo-actions'>
        <Button variant={coverPhotoId === item.mediaId ? 'primary' : 'secondary'} disabled={disabled || item.unavailable} onClick={() => onCover(item.mediaId)}>{coverPhotoId === item.mediaId ? '✓ Cover' : 'Set as cover'}</Button>
        <Button variant='danger' disabled={disabled} onClick={() => remove(item)}>Remove</Button>
      </div>
    </>} />
    {photo && <div className='project-editor__photo-fields'>
      <h3>Photo {photos.indexOf(photo) + 1}: {photo.filename}</h3>
      <Field label='Photo caption' name='photoCaption' value={photo.caption} onChange={(event) => updatePhoto('caption', event.target.value)} maxLength={250} disabled={disabled} hint={`${photo.caption.length}/250 characters`} />
      <Field label='Alt text override' name='photoAlt' multiline rows={2} value={photo.alt} onChange={(event) => updatePhoto('alt', event.target.value)} maxLength={300} disabled={disabled} hint='Leave blank to use the Media Library description. This does not edit the original image.' />
    </div>}
  </>;
}
