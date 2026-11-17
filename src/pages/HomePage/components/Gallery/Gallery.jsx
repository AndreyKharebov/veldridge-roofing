import { Link } from 'react-router';
import { useContent } from '../../../../content/context.js';
import ProjectPhoto from '../../../GalleryPage/components/ProjectPhoto/ProjectPhoto.jsx';
import './Gallery.sass';

export default function Gallery() {
  const { projects, projectsStatus, projectsError, reloadProjects } = useContent();
  const galleryImages = projects.filter((project) => project.status === 'published' && project.showOnHome).slice(0, 4);
  return <section className='gallery'>
    <div className='container'>
      <div className='gallery__header'>
        <h2 className='gallery__title'>Our <span>Work</span> Speaks Volumes</h2>
        <p className='gallery__description'>Explore our roofing projects and see the quality, craftsmanship, and attention to detail behind every roof we work on.</p>
      </div>
      {projectsStatus === 'loading' && <p className='gallery__description' role='status'>Loading projects…</p>}
      {projectsError && <div role='status'><p className='gallery__description'>Projects are temporarily unavailable.</p><button type='button' className='gallery__button' onClick={reloadProjects}>Try again</button></div>}
      <div className='gallery__grid'>{galleryImages.map((item, index) => <Link className={`gallery__item gallery__item--${index + 1}`}
        to={`/gallery?project=${encodeURIComponent(item.id)}#projects`} key={item.id} aria-label={`View project: ${item.title}`}>
        <ProjectPhoto className='gallery__image' photo={item.coverPhoto || item.photos[0]} />
      </Link>)}</div>
      {projectsStatus === 'ready' && !galleryImages.length && <p className='gallery__description'>No projects added yet.</p>}
      {galleryImages.some((item) => item.isDemo) && <p className='gallery__description'>Portfolio preview · Includes demonstration projects.</p>}
      <Link className='gallery__button' to='/gallery'>View All Images</Link>
    </div>
  </section>;
}
