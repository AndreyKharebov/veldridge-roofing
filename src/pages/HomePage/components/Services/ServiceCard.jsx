import { useState } from 'react';
import { useScrollReveal } from '../../../../hooks/useScrollReveal.js';
import { Link } from 'react-router';

const ServiceCard = ({ service }) => {
  const { title, description, image, icon } = service;
  const [failedImage, setFailedImage] = useState(null);
  const [cardRef, cardVisible] = useScrollReveal();

  const hasImage = Boolean(image) && failedImage !== image;

  return (
    <article
      ref={cardRef}
      className={`service-card${hasImage ? ' service-card--with-image' : ''}${
        cardVisible ? ' is-revealed' : ''
      }`}
    >
      {hasImage && (
        <img
          className='service-card__background'
          src={image}
          alt=''
          loading='lazy'
          onError={() => setFailedImage(image)}
        />
      )}

      <div className='service-card__content'>
        <div className='service-card__icon' aria-hidden='true'>
          {icon ? (
            <img src={icon} alt='' />
          ) : (
            <svg
              width='28'
              height='28'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='1.8'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <path d='M3 11.5 12 4l9 7.5' />
              <path d='M5.5 10.5V20h13v-9.5' />
              <path d='M9 20v-6h6v6' />
            </svg>
          )}
        </div>

        <h3 className='service-card__title'>{title}</h3>

        <p className='service-card__description'>{description}</p>

        <Link className='service-card__link' to='/services'>
          Read More
        </Link>
      </div>
    </article>
  );
};

export default ServiceCard;
