import { Link } from 'react-router';

import { useContent } from '../../../../content/context.js';

import './Gallery.sass';
import ProjectPhoto from '../../../GalleryPage/components/ProjectPhoto/ProjectPhoto.jsx';

const Gallery = () => {
  const { projects } = useContent();
  const galleryImages = projects.filter((project) => project.status === 'published').slice(0,4).map((project) => ({...project,alt:project.imageAlt}));
  if (!galleryImages.length) return null;
  return (
    <section className='gallery'>
      <div className='container'>
        <div className='gallery__header'>
          <h2 className='gallery__title'>
            Our <span>Work</span> Speaks Volumes
          </h2>

          <p className='gallery__description'>
            Explore our roofing projects and see the quality, craftsmanship, and
            attention to detail behind every roof we work on.
          </p>
        </div>

        <div className='gallery__grid'>
          {galleryImages.map((item, index) => (
            <Link
              className={`gallery__item gallery__item--${index + 1}`}
              to='/gallery'
              state={{projectId:item.id}}
              key={item.id}
              aria-label={`View gallery: ${item.alt}`}
            >
              <ProjectPhoto className='gallery__image' photo={item.coverPhoto || item.photos[0]} />
            </Link>
          ))}
        </div>

        <Link className='gallery__button' to='/gallery'>
          View All Images
        </Link>
      </div>
    </section>
  );
};

export default Gallery;
