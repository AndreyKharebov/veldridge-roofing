import heroFrame from '../../assets/hero-frame.svg';
import heroRightFrame from '../../assets/hero-right-frame.svg';
import heroLeftFrame from '../../assets/hero-left-frame.svg';
import heroBottomFrame from '../../assets/hero-bottom-frame.svg';
import heroInsuranceIcon from '../../assets/hero-insurance-icon.svg';
import starIcon from '../../assets/star-icon.svg';

const HeroSlide = ({ image, imageAlt, topRight, topLeft, bottom }) => {
  return (
    <div className='hero__visual'>
      <div className='hero__image-wrapper'>
        <img
          className='hero__image'
          src={image}
          alt={imageAlt}
          fetchPriority='high'
        />

        <img
          className='hero__frame'
          src={heroFrame}
          alt=''
          aria-hidden='true'
        />
      </div>

      <div className='hero__right-card'>
        <img
          className='hero__right-frame'
          src={heroRightFrame}
          alt=''
          aria-hidden='true'
        />

        <p className='hero__right-text'>{topRight.text}</p>
      </div>

      <div className='hero__left-card'>
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

      <div className='hero__bottom-card'>
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

      <div className='hero__insurance'>
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
