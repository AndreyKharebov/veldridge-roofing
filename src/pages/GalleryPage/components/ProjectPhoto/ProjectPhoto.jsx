import { useState } from 'react';
import './ProjectPhoto.sass';

export default function ProjectPhoto({ photo, decorative = false, className = '' }) {
  const [failedSrc, setFailedSrc] = useState(null);
  const src = photo?.src || '';
  const cropStyle = photo?.crop ? {
    width: `${photo.crop.scale * 100}%`, height: `${photo.crop.scale * 100}%`,
    left: `${photo.crop.left}%`, top: `${photo.crop.top}%`,
  } : undefined;
  return <span className={`project-photo ${className}`}>
    {!src || failedSrc === src ? <span className='project-photo__fallback' role={decorative ? undefined : 'status'}>
      {decorative ? 'Photo' : 'This photo is unavailable. Please try another view.'}
    </span> : <img className='project-photo__image' src={src} alt={decorative ? '' : photo.alt || ''} style={cropStyle}
      onError={() => setFailedSrc(src)} draggable='false' loading='lazy' />}
  </span>;
}
