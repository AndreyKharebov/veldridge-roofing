import { Link } from 'react-router';

import heroImage from '../../assets/hero.png';
import heroFrame from '../../assets/hero-frame.svg';

import './Hero.sass';

const Hero = () => {
  return (
    <section className='hero'>
      <div className='container'>
        <div className='hero__content'>
          <h1 className='hero__title'>Your Roof Is Our Priority!</h1>

          <p className='hero__description'>
            Protect your home with reliable roofing services. Based in
            Philadelphia, Veldridge Roofing proudly serves homeowners across
            Pennsylvania, New Jersey, and Delaware.
          </p>

          <Link className='hero__button' to='/contact'>
            Contact
          </Link>
        </div>
        <div className='hero__visual'>
          <img
            className='hero__image'
            src={heroImage}
            alt='Residential home with a newly installed roof'
            fetchPriority='high'
          />

          <img
            className='hero__frame'
            src={heroFrame}
            alt=''
            aria-hidden='true'
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
