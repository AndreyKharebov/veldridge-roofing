import { Link } from 'react-router';

import aboutHeroImage from './assets/about-hero.webp';
import { heroHighlights } from './heroHighlights.js';

import './AboutHero.sass';

const AboutHero = () => {
  return (
    <section className='about-hero' aria-labelledby='about-hero-title'>
      <div className='container'>
        <nav className='about-hero__breadcrumbs' aria-label='Breadcrumb'>
          <ol>
            <li><Link to='/'>Home</Link></li>
            <li aria-hidden='true'>/</li>
            <li><span aria-current='page'>About Us</span></li>
          </ol>
        </nav>

        <div className='about-hero__inner'>
          <div className='about-hero__content'>
            <p className='about-page__eyebrow'>About Veldridge Roofing</p>

            <h1 className='about-hero__title' id='about-hero-title'>
              Good Roofs Start<br />
              With <span>Good People.</span>
            </h1>

            <p className='about-hero__description'>
              A Philadelphia-based roofing team, helping homeowners across
              Pennsylvania, New Jersey, and Delaware protect the place they
              call home.
            </p>

            <div className='about-hero__actions'>
              <Link className='about-page__button' to='/contact'>
                Contact Our Team
              </Link>
              <Link className='about-page__text-link' to='/gallery'>
                Explore Our Work
              </Link>
            </div>

            <p className='about-hero__note'>
              Local care. Lasting protection.
            </p>
          </div>

          <div className='about-hero__visual'>
            <img
              className='about-hero__image'
              src={aboutHeroImage}
              alt='Roofing professionals inspecting a standing-seam metal roof'
              width='608'
              height='536'
              fetchPriority='high'
            />
            <div className='about-hero__area'>
              <span className='about-hero__states'>PA · NJ · DE</span>
              <span className='about-hero__caption'>Proudly serving</span>
            </div>
          </div>
        </div>

        <ul className='about-hero__highlights'>
          {heroHighlights.map(({ id, title, description }) => (
            <li className='about-hero__highlight' key={id}>
              <p className='about-hero__highlight-title'>{title}</p>
              <p className='about-hero__highlight-description'>
                {description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default AboutHero;
