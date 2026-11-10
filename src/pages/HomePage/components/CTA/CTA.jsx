import { Link } from 'react-router';

import './CTA.sass';

const CTA = () => {
  return (
    <section className='cta'>
      <div className='container'>
        <div className='cta__inner'>
          <h2 className='cta__title'>
            Are You Ready to Get Your Roofing Service?
          </h2>

          <p className='cta__description'>
            Protect your home with professional roofing solutions. Whether you
            need repairs, an inspection, or a complete roof replacement, we're
            here to help.
          </p>

          <Link className='cta__button' to='/contact'>
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTA;
