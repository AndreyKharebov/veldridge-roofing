import { Link } from 'react-router';

import './ServiceDetail.sass';

const ServiceDetail = ({ service, imageRight = false }) => {
  const { id, number, eyebrow, title, description, points, image, imageAlt, cta, tone } = service;
  const titleId = `${id}-title`;

  return (
    <section
      className={`service-detail service-detail--${tone}${imageRight ? ' service-detail--image-right' : ''}`}
      id={id}
      aria-labelledby={titleId}
      data-service-anchor
      tabIndex={-1}
    >
      <div className='container'>
        <div className='service-detail__inner'>
          <img
            className='service-detail__image'
            src={image}
            alt={imageAlt}
            width='608'
            height='432'
            loading='lazy'
          />
          <div className='service-detail__content'>
            <p className='services-page__eyebrow'>{number} / {eyebrow}</p>
            <h2 className='services-page__title' id={titleId}>{title}</h2>
            <p className='services-page__text service-detail__description'>{description}</p>
            <ul className='service-detail__points'>
              {points.map((point) => <li key={point}>{point}</li>)}
            </ul>
            <Link className='services-page__button' to='/contact'>{cta}</Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServiceDetail;
