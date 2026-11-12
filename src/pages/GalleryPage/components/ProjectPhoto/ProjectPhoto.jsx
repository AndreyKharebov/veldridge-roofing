import { useState } from 'react';
import './ProjectPhoto.sass';

const ProjectPhoto = ({ photo, decorative = false }) => {
  const [failed, setFailed] = useState(false);
  const cropStyle = photo.crop ? {
    width: `${photo.crop.scale * 100}%`,
    height: `${photo.crop.scale * 100}%`,
    left: `${photo.crop.left}%`,
    top: `${photo.crop.top}%`,
  } : undefined;

  return (
    <span className='project-photo'>
      {failed ? (
        <span className='project-photo__fallback' role={decorative ? undefined : 'status'}>
          {decorative ? 'Photo' : 'This photo is unavailable. Please try another view.'}
        </span>
      ) : (
        <img className='project-photo__image' src={photo.src} alt={decorative ? '' : photo.alt} style={cropStyle} onError={() => setFailed(true)} draggable='false' />
      )}
    </span>
  );
};

export default ProjectPhoto;
