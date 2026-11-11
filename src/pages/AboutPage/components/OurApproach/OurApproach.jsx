import approachMainImage from './assets/approach-main.webp';
import approachDetailImage from './assets/approach-detail.webp';

import './OurApproach.sass';

const OurApproach = () => {
  return (
    <section className='our-approach' aria-labelledby='our-approach-title'>
      <div className='container our-approach__inner'>
        <div className='our-approach__visual'>
          <img
            className='our-approach__image our-approach__image--main'
            src={approachMainImage}
            alt='Asphalt-shingle roof with a skylight and chimney'
            width='540'
            height='416'
            loading='lazy'
          />
          <img
            className='our-approach__image our-approach__image--detail'
            src={approachDetailImage}
            alt='A roofing professional working on a metal roof'
            width='272'
            height='208'
            loading='lazy'
          />
        </div>

        <div className='our-approach__content'>
          <p className='about-page__eyebrow'>Our Approach</p>
          <h2 className='about-page__title' id='our-approach-title'>
            More Than A Roof.<br />
            <span>Peace Of Mind.</span>
          </h2>
          <p className='about-page__text our-approach__description'>
            Your roof protects more than a building. It protects your everyday
            life — the people, routines, and memories that make a house your home.
          </p>
          <p className='about-page__text our-approach__description'>
            At Veldridge Roofing, we focus on the essentials: understanding your
            roof, explaining your options, and carrying out the work with care.
            From a repair to a full replacement, the details matter.
          </p>
          <div className='our-approach__promise'>
            <p className='our-approach__promise-title'>Your roof is our priority.</p>
            <p className='our-approach__promise-caption'>
              The Veldridge Roofing approach
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurApproach;
