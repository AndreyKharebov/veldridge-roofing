import { Link } from 'react-router';

import HeroSlide from './HeroSlide';

import { heroSlides } from './heroSlides.js';

import './Hero.sass';

const Hero = () => {
  const currentSlide = heroSlides[0];

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
        <HeroSlide
          image={currentSlide.image}
          imageAlt={currentSlide.imageAlt}
          topRight={currentSlide.topRight}
          topLeft={currentSlide.topLeft}
          bottom={currentSlide.bottom}
        />
      </div>
    </section>
  );
};

export default Hero;
