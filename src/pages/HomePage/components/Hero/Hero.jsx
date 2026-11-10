import { useEffect, useState } from 'react';

import { Link } from 'react-router';

import HeroSlide from './HeroSlide';

import { heroImages, heroContent } from './heroSlides.js';

import './Hero.sass';

const Hero = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [introFinished, setIntroFinished] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setIntroFinished(true);
    }, 2800);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (heroImages.length <= 1) return;

    let intervalId;

    const timeoutId = window.setTimeout(() => {
      setActiveIndex((current) => (current + 1) % heroImages.length);

      intervalId = window.setInterval(() => {
        setActiveIndex((current) => (current + 1) % heroImages.length);
      }, 5000);
    }, 3300);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, []);

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
          slides={heroImages}
          activeIndex={activeIndex}
          introFinished={introFinished}
          {...heroContent}
        />
      </div>
    </section>
  );
};

export default Hero;
