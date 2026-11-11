import { Link } from 'react-router';

import { serviceAreas } from './serviceAreas.js';

import './ServiceAreas.sass';

const ServiceAreas = () => {
  return (
    <section className='service-areas' aria-labelledby='service-areas-title'>
      <div className='container service-areas__inner'>
        <div className='service-areas__content'>
          <p className='about-page__eyebrow'>Rooted In Our Region</p>
          <h2 className='about-page__title' id='service-areas-title'>
            Local Knowledge.<br />
            <span>Neighborly Care.</span>
          </h2>
          <p className='about-page__text service-areas__description'>
            Based in Philadelphia, Veldridge Roofing serves homeowners across
            Pennsylvania, New Jersey, and Delaware. Tell us about your property
            and we’ll help you find the next step.
          </p>
          <Link className='about-page__button' to='/contact'>
            Discuss Your Project
          </Link>
        </div>

        <ul className='service-areas__list'>
          {serviceAreas.map(({ id, abbreviation, name, description }) => (
            <li className='service-areas__card' key={id}>
              <span className='service-areas__badge' aria-hidden='true'>
                {abbreviation}
              </span>
              <div className='service-areas__card-content'>
                <h3 className='service-areas__name'>{name}</h3>
                <p className='service-areas__card-description'>{description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default ServiceAreas;
