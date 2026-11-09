import { Link } from 'react-router';

import gallery1 from '../../assets/gallery/gallery-1.webp';
import gallery2 from '../../assets/gallery/gallery-2.webp';
import gallery3 from '../../assets/gallery/gallery-3.webp';
import gallery4 from '../../assets/gallery/gallery-4.webp';

import './Gallery.sass';

const galleryImages = [
  {
    id: 1,
    image: gallery1,
    alt: 'Residential roofing project with dark shingles',
  },
  {
    id: 2,
    image: gallery2,
    alt: 'Modern residential roof with multiple gables',
  },
  {
    id: 3,
    image: gallery3,
    alt: 'Newly installed residential roofing shingles',
  },
  {
    id: 4,
    image: gallery4,
    alt: 'Completed pitched roof on a residential property',
  },
];

const Gallery = () => {
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
              key={item.id}
              aria-label={`View gallery: ${item.alt}`}
            >
              <img
                className='gallery__image'
                src={item.image}
                alt={item.alt}
                loading='lazy'
              />
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
