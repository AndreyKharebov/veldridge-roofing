import { Link } from 'react-router';

import aboutMain from './assets/about-main.webp';
import aboutSecondary from './assets/about-secondary.webp';
import aboutMainFrame from './assets/about-main-frame.svg';
import aboutSecondaryFrame from './assets/about-secondary-frame.svg';

import './About.sass';

const About = () => {
  return (
    <section className='about'>
      <div className='container'>
        <div className='about__inner'>
          <div className='about__content'>
            <h2 className='about__title'>
              <span>About</span> Our Quality Roofing Services We Provide
            </h2>

            <p className='about__description'>
              At Veldridge Roofing, we provide reliable roofing solutions for
              homeowners across Pennsylvania, New Jersey, and Delaware.
            </p>

            <ul className='about__benefits'>
              <li className='about__benefit'>
                Quality roofing solutions tailored to your home's needs.
              </li>

              <li className='about__benefit'>
                Reliable service with attention to every detail.
              </li>

              <li className='about__benefit'>
                Serving homeowners across PA, NJ, and DE.
              </li>
            </ul>

            <Link className='about__button' to='/about'>
              About Us
            </Link>
          </div>

          <div className='about__visual'>
            <div
              className='about__photo about__photo--main'
            >
              <img
                className='about__image'
                src={aboutMain}
                alt='Completed residential roofing project'
                loading='lazy'
              />

              <img
                className='about__frame'
                src={aboutMainFrame}
                alt=''
                aria-hidden='true'
              />
            </div>

            <div
              className='about__photo about__photo--secondary'
            >
              <img
                className='about__image'
                src={aboutSecondary}
                alt='Roofing professionals working on a residential roof'
                loading='lazy'
              />

              <img
                className='about__frame about__frame--secondary'
                src={aboutSecondaryFrame}
                alt=''
                aria-hidden='true'
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
