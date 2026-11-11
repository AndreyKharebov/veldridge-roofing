import { Link } from 'react-router';

import aboutCtaImage from './assets/about-cta.webp';

import './AboutCTA.sass';

const AboutCTA = () => {
  return (
    <section className='about-cta' aria-labelledby='about-cta-title'>
      <div className='container'>
        <div className='about-cta__inner'>
          <div className='about-cta__content'>
            <p className='about-page__eyebrow'>Let’s Start A Conversation</p>
            <h2 className='about-page__title about-cta__title' id='about-cta-title'>
              Let’s Talk About<br />Your Roof.
            </h2>
            <p className='about-page__text about-cta__description'>
              A question, a repair, or a new roof — tell us what you need.
              We’re here to help you understand the next step.
            </p>
            <Link className='about-page__button about-cta__button' to='/contact'>
              Contact Us
            </Link>
          </div>
          <img
            className='about-cta__image'
            src={aboutCtaImage}
            alt='A completed residential roofing project'
            width='496'
            height='320'
            loading='lazy'
          />
        </div>
      </div>
    </section>
  );
};

export default AboutCTA;
