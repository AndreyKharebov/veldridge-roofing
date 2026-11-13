import { Link } from 'react-router';

import ServiceCard from './ServiceCard';

import { useContent } from '../../../../content/context.js';

import './Services.sass';

const Services = () => {
  const { services } = useContent();
  const servicesData = services.filter((service) => service.status === 'active' && service.showOnHome).map((service) => ({...service, image:service.homeImage, description:service.summary}));
  if (!servicesData.length) return null;
  return (
    <section className='services'>
      <div className='container'>
        <div className='services__header'>
          <h2 className='services__title'>
            We Offer <span>High-Quality</span>
            <br />
            Roofing Services
          </h2>

          <p className='services__description'>
            Discover reliable roofing solutions designed to protect your home
            and provide lasting peace of mind.
          </p>
        </div>

        <div className='services__grid'>
          {servicesData.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>

        <Link className='services__button' to='/services'>
          View All Services
        </Link>
      </div>
    </section>
  );
};

export default Services;
