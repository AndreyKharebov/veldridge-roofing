import { Link } from 'react-router';

import heroImage from '../../assets/hero.png';
import client1 from '../../assets/clients/client-1.png';
import client2 from '../../assets/clients/client-2.png';
import client3 from '../../assets/clients/client-3.png';
import client4 from '../../assets/clients/client-4.png';

import './Hero.sass';

const clientAvatars = [client1, client2, client3, client4];

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
            alt='Residential house with a professionally installed roof'
            fetchPriority='high'
          />

          <div className='hero__info-card'>
            <p className='hero__info-text'>
              Quality Roofing. Lasting Protection.
            </p>
          </div>

          <div className='hero__service-card'>
            <div className='hero__states'>
              <span className='hero__state'>PA</span>
              <span className='hero__state'>NJ</span>
              <span className='hero__state'>DE</span>
            </div>

            <p className='hero__service-title'>Proudly Serving</p>

            <p className='hero__service-description'>PA • NJ • DE</p>
          </div>

          <div className='hero__clients-card'>
            <div className='hero__clients-avatars' aria-hidden='true'>
              {clientAvatars.map((avatar, index) => (
                <img
                  className='hero__clients-avatar'
                  src={avatar}
                  alt=''
                  key={index}
                />
              ))}
            </div>

            <p className='hero__clients-text'>Satisfied Clients</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
