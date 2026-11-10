import { useScrollReveal } from '../../../../hooks/useScrollReveal.js';

import heroFrame from './assets/hero-frame.svg';
import heroRightFrame from './assets/hero-right-frame.svg';
import heroLeftFrame from './assets/hero-left-frame.svg';
import heroBottomFrame from './assets/hero-bottom-frame.svg';
import heroInsuranceIcon from './assets/hero-insurance-icon.svg';
import starIcon from './assets/star-icon.svg';

const HeroSlide = ({
  slides,
  activeIndex,
  topRight,
  topLeft,
  bottom,
}) => {
  const [leftRef, leftVisible] = useScrollReveal();
  const [rightRef, rightVisible] = useScrollReveal();
  const [bottomRef, bottomVisible] = useScrollReveal();
  const [insuranceRef, insuranceVisible] = useScrollReveal();

  return (
    <div
      className='hero__visual'>
      <div className='hero__image-wrapper'>
        {slides.map((image, index) => (
          <img
            className={`hero__image ${
              index === activeIndex ? 'hero__image--active' : ''
            }`}
            src={image.src}
            alt={index === activeIndex ? image.alt : ''}
            aria-hidden={index !== activeIndex}
            fetchPriority={index === 0 ? 'high' : 'auto'}
            loading={index === 0 ? 'eager' : 'lazy'}
            key={image.id}
          />
        ))}

        <img
          className='hero__frame'
          src={heroFrame}
          alt=''
          aria-hidden='true'
        />
      </div>

      <div
        ref={rightRef}
        className={`hero__right-card ${rightVisible ? 'is-revealed' : ''}`}
      >
        <img
          className='hero__right-frame'
          src={heroRightFrame}
          alt=''
          aria-hidden='true'
        />

        <p className='hero__right-text'>{topRight.text}</p>
      </div>

      <div
        ref={leftRef}
        className={`hero__left-card ${leftVisible ? 'is-revealed' : ''}`}
      >
        <img
          className='hero__left-frame'
          src={heroLeftFrame}
          alt=''
          aria-hidden='true'
        />

        <div className='hero__left-content'>
          <div className='hero__left-states' aria-label='Service areas'>
            {topLeft.states.map((state) => (
              <span className='hero__left-state' key={state}>
                {state}
              </span>
            ))}
          </div>

          <p className='hero__left-text'>{topLeft.title}</p>

          <p className='hero__left-description'>{topLeft.description}</p>
        </div>
      </div>

      <div
        ref={bottomRef}
        className={`hero__bottom-card ${bottomVisible ? 'is-revealed' : ''}`}
      >
        <img
          className='hero__bottom-frame'
          src={heroBottomFrame}
          alt=''
          aria-hidden='true'
        />

        <div className='hero__bottom-icon'>
          <img src={starIcon} alt='' aria-hidden='true' />
        </div>

        <div className='hero__bottom-content'>
          <div className='hero__bottom-avatars' aria-hidden='true'>
            {bottom.avatars.map((avatar, index) => (
              <img
                className='hero__bottom-avatar'
                src={avatar}
                alt=''
                key={index}
              />
            ))}
          </div>

          <p className='hero__bottom-text'>{bottom.text}</p>
        </div>
      </div>

      <div
        ref={insuranceRef}
        className={`hero__insurance ${insuranceVisible ? 'is-revealed' : ''}`}
      >
        <img
          className='hero__insurance-icon'
          src={heroInsuranceIcon}
          alt=''
          aria-hidden='true'
        />

        <p className='hero__insurance-text'>
          We handle insurance claims and collaborate with skilled contractors.
        </p>
      </div>
    </div>
  );
};

export default HeroSlide;
