import { Link } from 'react-router';
import { useState } from 'react';

import whyChooseUsImage from './assets/why-choose-us.webp';
import whyChooseUsFullImage from './assets/why-choose-us-full.webp';

import './WhyChooseUs.sass';

const benefits = [
  {
    id: 'local',
    title: 'Local Knowledge',
    description:
      'We understand the roofing needs of homeowners across Pennsylvania, New Jersey, and Delaware.',
  },
  {
    id: 'materials',
    title: 'Quality Materials',
    description:
      'We prioritize durable roofing materials designed for lasting protection.',
  },
  {
    id: 'professional',
    title: 'Professional Work',
    description:
      'Our team approaches every roofing project with care and attention to detail.',
  },
  {
    id: 'customers',
    title: 'Happy Customers',
    description: 'Customer satisfaction is at the heart of everything we do.',
  },
];

const WhyChooseUs = () => {
  const [activeBenefits, setActiveBenefits] = useState(['local']);

  const toggleBenefit = (id) => {
    setActiveBenefits((current) =>
      current.includes(id)
        ? current.filter((benefitId) => benefitId !== id)
        : [...current, id],
    );
  };

  return (
    <section className='why-choose-us'>
      <div className='container'>
        <div className='why-choose-us__header'>
          <h2 className='why-choose-us__title'>
            Experience, Craftsmanship,
            <br />
            And <span>Client Satisfaction</span>
          </h2>

          <p className='why-choose-us__description'>
            We combine roofing expertise, quality materials, and dedicated
            service to protect what matters most.
          </p>
        </div>

        <div className='why-choose-us__inner'>
          <div className='why-choose-us__visual'>
            <picture>
              <source
                media='(max-width: 700px)'
                srcSet={whyChooseUsFullImage}
              />

              <img
                className='why-choose-us__image'
                src={whyChooseUsImage}
                alt='Residential roof with high-quality shingles'
                loading='lazy'
              />
            </picture>
          </div>

          <div className='why-choose-us__content'>
            <div className='why-choose-us__benefits'>
              {benefits.map((benefit) => {
                const isOpen = activeBenefits.includes(benefit.id);

                return (
                  <article
                    className={`why-choose-us__benefit${
                      isOpen ? ' why-choose-us__benefit--open' : ''
                    }`}
                    key={benefit.id}
                    role='button'
                    tabIndex={0}
                    aria-expanded={isOpen}
                    aria-controls={`benefit-${benefit.id}`}
                    onClick={() => toggleBenefit(benefit.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        toggleBenefit(benefit.id);
                      }
                    }}
                  >
                    <h3 className='why-choose-us__benefit-title'>
                      <span className='why-choose-us__benefit-heading'>
                        {benefit.title}
                      </span>

                      <span className='why-choose-us__benefit-toggle'>
                        <span>{benefit.title}</span>

                        <span
                          className='why-choose-us__benefit-symbol'
                          aria-hidden='true'
                        />
                      </span>
                    </h3>

                    <div className='why-choose-us__benefit-panel'>
                      <div className='why-choose-us__benefit-panel-inner'>
                        <p
                          className='why-choose-us__benefit-description'
                          id={`benefit-${benefit.id}`}
                        >
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <Link className='why-choose-us__button' to='/about'>
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
