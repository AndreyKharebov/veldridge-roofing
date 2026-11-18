import { Link } from 'react-router';
import './ServiceCare.sass';

const ServiceCare = ({ services }) => <section className='service-care' aria-labelledby='service-care-title'>
  <div className='container'>
    <div className='service-care__header'>
      <p className='services-page__eyebrow'>Care Beyond The Big Project</p>
      <h2 className='services-page__title' id='service-care-title'>Keep your roof ready for what comes next.</h2>
      <p className='services-page__text'>Routine care, storm recovery, and the details that protect your property.</p>
    </div>
    <div className='service-care__grid'>
      {services.map(({ id, number, title, summary, points, image, imageAlt, cta }) => <article
        className='service-care__card' id={id} key={id} aria-labelledby={`${id}-title`} data-service-anchor tabIndex={-1}>
        <Link className='service-care__card-link' to='/contact#contact-form' state={{ serviceId: id, serviceTitle: title }} aria-label={`Discuss ${title.toLowerCase()} with our team`}>
          <img className='service-care__image' src={image} alt={imageAlt} width='411' height='208' loading='lazy' />
          <div className='service-care__content'>
            <p className='services-page__eyebrow'>{number} / Ongoing Care</p>
            <h3 className='service-care__title' id={`${id}-title`}>{title}</h3>
            <p className='services-page__text'>{summary}</p>
            <ul className='service-care__points'>{points.map((point, index) => <li key={`${id}-${index}`}>{point}</li>)}</ul>
            <span className='service-care__action'>{cta || 'Discuss Your Project'}</span>
          </div>
        </Link>
      </article>)}
    </div>
  </div>
</section>;
export default ServiceCare;
