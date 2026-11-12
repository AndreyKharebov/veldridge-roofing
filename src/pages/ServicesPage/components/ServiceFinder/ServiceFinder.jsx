import { Link } from 'react-router';

import './ServiceFinder.sass';

const ServiceFinder = ({ services }) => (
  <section
    className='service-finder'
    id='service-finder'
    aria-labelledby='service-finder-title'
    data-service-anchor
    tabIndex={-1}
  >
    <div className='container'>
      <div className='service-finder__header'>
        <div className='service-finder__heading'>
          <p className='services-page__eyebrow'>Explore Our Services</p>
          <h2 className='services-page__title' id='service-finder-title'>
            Find the right service.
          </h2>
        </div>
        <p className='services-page__text service-finder__description'>
          Choose a service to jump to the details. Not sure where to start?
          Begin with a free inspection.
        </p>
      </div>

      <nav aria-label='Find a roofing service'>
        <ol className='service-finder__grid'>
          {services.map(({ id, number, title }) => (
            <li className='service-finder__item' key={id}>
              <Link className='service-finder__link' to={`#${id}`} preventScrollReset>
                <span className='service-finder__number' aria-hidden='true'>{number}</span>
                <span className='service-finder__label'>{title}</span>
                <span className='service-finder__arrow' aria-hidden='true'>↓</span>
              </Link>
            </li>
          ))}
        </ol>
      </nav>
    </div>
  </section>
);

export default ServiceFinder;
