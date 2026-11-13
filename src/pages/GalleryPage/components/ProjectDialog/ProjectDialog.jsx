import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router';
import { lockBodyScroll } from '../../../../utils/lockBodyScroll.js';
import ProjectPhoto from '../ProjectPhoto/ProjectPhoto.jsx';
import closeIcon from '../../assets/icons/close.svg';
import previousIcon from '../../assets/icons/arrow-left.svg';
import nextIcon from '../../assets/icons/arrow-right.svg';
import './ProjectDialog.sass';

const ProjectDialog = ({ id, project, onClose }) => {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const backdropPress = useRef(false);
  const swipeStart = useRef(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const photos = project.photos;
  const photo = photos[photoIndex];
  const titleId = `${id}-title`;
  const summaryId = `${id}-summary`;

  useEffect(() => {
    const dialog = dialogRef.current;
    const opener = document.activeElement;
    const pathname = window.location.pathname;
    const unlock = lockBodyScroll();
    dialog.showModal();
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      if (dialog.open) dialog.close();
      unlock();
      if (window.location.pathname === pathname && opener instanceof HTMLElement && opener.isConnected) {
        opener.focus({ preventScroll: true });
      }
    };
  }, []);

  const stepPhoto = (step) => setPhotoIndex((current) => (current + step + photos.length) % photos.length);
  const isBackdrop = (event) => {
    if (event.target !== event.currentTarget) return false;
    const bounds = event.currentTarget.getBoundingClientRect();
    return event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
  };
  const facts = [
    ['Property', project.property],
    ['On-site duration', `${project.duration}${project.isDemo ? '*' : ''}`],
    ['Main material', `${project.material}${project.isDemo ? '*' : ''}`],
    ['Finish', `${project.finish}${project.isDemo ? '*' : ''}`],
  ];

  return createPortal(
    <dialog
      ref={dialogRef}
      id={id}
      className='project-dialog'
      aria-labelledby={titleId}
      aria-describedby={summaryId}
      onClose={(event) => {
        // Ignore the queued close event from StrictMode's setup/cleanup cycle.
        if (!event.currentTarget.open && event.currentTarget.isConnected) onClose();
      }}
      onPointerDown={(event) => { backdropPress.current = isBackdrop(event); }}
      onClick={(event) => {
        if (backdropPress.current && isBackdrop(event)) dialogRef.current.close();
        backdropPress.current = false;
      }}
      onKeyDown={(event) => {
        if (event.altKey || event.ctrlKey || event.metaKey || photos.length < 2) return;
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
          event.preventDefault();
          stepPhoto(event.key === 'ArrowRight' ? 1 : -1);
        }
      }}
    >
      <div className='project-dialog__toolbar'>
        <p>Project Details</p>
        <button ref={closeRef} className='project-dialog__icon-button' type='button' aria-label='Close project' onClick={() => dialogRef.current.close()}>
          <img src={closeIcon} alt='' aria-hidden='true' />
        </button>
      </div>
      <div className='project-dialog__body'>
        <div className='project-dialog__viewer' aria-label='Project photographs'>
          <div
            className='project-dialog__stage'
            onPointerDown={(event) => {
              if (event.pointerType !== 'touch' || event.target.closest('button')) return;
              swipeStart.current = { x: event.clientX, y: event.clientY };
            }}
            onPointerCancel={() => { swipeStart.current = null; }}
            onPointerUp={(event) => {
              const start = swipeStart.current;
              swipeStart.current = null;
              if (!start || photos.length < 2) return;
              const dx = event.clientX - start.x;
              const dy = event.clientY - start.y;
              if (Math.abs(dx) > 48 && Math.abs(dy) < 40) stepPhoto(dx < 0 ? 1 : -1);
            }}
          >
            <ProjectPhoto key={photo.id} photo={photo} />
            {photos.length > 1 && <>
              <button className='project-dialog__icon-button project-dialog__previous' type='button' aria-label='Previous photo' onClick={() => stepPhoto(-1)}><img src={previousIcon} alt='' aria-hidden='true' /></button>
              <button className='project-dialog__icon-button project-dialog__next' type='button' aria-label='Next photo' onClick={() => stepPhoto(1)}><img src={nextIcon} alt='' aria-hidden='true' /></button>
            </>}
          </div>
          <div className='project-dialog__caption' aria-live='polite' aria-atomic='true'>
            <span>{photo.caption}</span>
            <span className='project-dialog__counter'>{String(photoIndex + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}</span>
          </div>
          {photos.length > 1 && <div className='project-dialog__thumbnails' role='group' aria-label='Select a project photo'>
            {photos.map((item, index) => (
              <button className='project-dialog__thumbnail' key={item.id} type='button' aria-label={`View photo ${index + 1}: ${item.caption}`} aria-pressed={photoIndex === index} onClick={() => setPhotoIndex(index)}>
                <ProjectPhoto photo={item} decorative />
              </button>
            ))}
          </div>}
          <p className='project-dialog__photo-note'>{project.isDemo ? 'Overview and detail crops of the same illustrative photograph.' : 'View the full roof and the details that make the finish.'}</p>
        </div>
        <div className='project-dialog__details'>
          <p className='project-dialog__category'>{project.categoryLabel}</p>
          <h2 className='project-dialog__title' id={titleId}>{project.dialogTitle ?? project.title}</h2>
          <p className='project-dialog__summary' id={summaryId}>{project.summary}</p>
          <dl className='project-dialog__facts'>
            {facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
          </dl>
          <div className='project-dialog__work'>
            <h3>What we did</h3>
            <ul>{project.work.map((item,index) => <li key={index}>{item}</li>)}</ul>
          </div>
          <Link className='project-dialog__cta' to='/contact' state={{ projectId: project.id, projectTitle: project.title }}>Discuss a Similar Project</Link>
          {project.isDemo && <p className='project-dialog__disclosure'>*Illustrative case study. Materials, duration and project details are sample content for this design.</p>}
        </div>
      </div>
    </dialog>,
    document.body,
  );
};

export default ProjectDialog;
