import { NavLink, Link } from 'react-router';

import phoneIcon from '../../assets/footer/phone.svg';
import mailIcon from '../../assets/footer/mail.svg';
import locationIcon from '../../assets/footer/location.svg';

import facebookIcon from '../../assets/footer/facebook.svg';
import linkedinIcon from '../../assets/footer/linkedin.svg';
import instagramIcon from '../../assets/footer/instagram.svg';
import youtubeIcon from '../../assets/footer/youtube.svg';

import './Footer.sass';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Services', path: '/services' },
  { label: 'Gallery', path: '/gallery' },
  { label: 'Blog', path: '/blog' },
];

const contacts = {
  phone: '',
  email: '',
  location: 'Philadelphia, PA',
};

const socialLinks = [
  { id: 'facebook', label: 'Facebook', icon: facebookIcon, url: null },
  { id: 'linkedin', label: 'LinkedIn', icon: linkedinIcon, url: null },
  { id: 'instagram', label: 'Instagram', icon: instagramIcon, url: null },
  { id: 'youtube', label: 'YouTube', icon: youtubeIcon, url: null },
];

const Footer = () => {
  return (
    <footer className='footer'>
      <div className='container'>
        <div className='footer__main'>
          <Link
            className='footer__logo'
            to='/'
            aria-label='Veldridge Roofing — Home'
          >
            <span className='footer__logo-name'>Veldridge</span>
            <span className='footer__logo-description'>Roofing</span>
          </Link>

          <p className='footer__description'>
            Reliable roofing solutions for homeowners across Pennsylvania, New
            Jersey, and Delaware. Your roof is our priority.
          </p>

          <nav className='footer__nav' aria-label='Footer navigation'>
            <ul className='footer__nav-list'>
              {navLinks.map(({ label, path }) => (
                <li key={path}>
                  <NavLink
                    className='footer__nav-link'
                    to={path}
                    end={path === '/'}
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className='footer__contacts'>
            <div className='footer__contact'>
              <img className='footer__contact-icon' src={phoneIcon} alt='' />

              {contacts.phone ? (
                <a href={`tel:${contacts.phone.replace(/[^\d+]/g, '')}`}>
                  {contacts.phone}
                </a>
              ) : (
                <Link to='/contact'>Contact our team</Link>
              )}
            </div>

            <div className='footer__contact'>
              <img className='footer__contact-icon' src={mailIcon} alt='' />

              {contacts.email ? (
                <a href={`mailto:${contacts.email}`}>{contacts.email}</a>
              ) : (
                <Link to='/contact'>Send an inquiry</Link>
              )}
            </div>

            <div className='footer__contact'>
              <img className='footer__contact-icon' src={locationIcon} alt='' />

              <span>{contacts.location}</span>
            </div>
          </div>

          <div className='footer__socials'>
            {socialLinks.map(({ id, label, icon, url }) =>
              url ? (
                <a
                  className='footer__social'
                  href={url}
                  aria-label={label}
                  target='_blank'
                  rel='noopener noreferrer'
                  key={id}
                >
                  <img src={icon} alt='' />
                </a>
              ) : (
                <span className='footer__social' key={id}>
                  <img src={icon} alt={label} />
                </span>
              ),
            )}
          </div>
          
        </div>
      </div>

      <div className='footer__bottom'>
        <div className='container footer__bottom-inner'>
          <p className='footer__copyright'>
            © {new Date().getFullYear()} Veldridge Roofing. All Rights Reserved.
          </p>

          <div className='footer__legal'>
            <span>Privacy Policy</span>
            <span className='footer__separator' aria-hidden='true' />
            <span>Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
