import { NavLink, Link } from 'react-router';
import { useContent } from '../../../content/context.js';
import FooterMap from './FooterMap.jsx';

import phoneIcon from './assets/phone.svg';
import mailIcon from './assets/mail.svg';
import facebookIcon from './assets/facebook.svg';
import linkedinIcon from './assets/linkedin.svg';
import instagramIcon from './assets/instagram.svg';
import youtubeIcon from './assets/youtube.svg';

import './Footer.sass';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Services', path: '/services' },
  { label: 'Gallery', path: '/gallery' },
  { label: 'Blog', path: '/blog' },
  { label: 'Contact', path: '/contact' },
];

const socialIcons = [
  { id: 'facebook', label: 'Facebook', icon: facebookIcon },
  { id: 'linkedin', label: 'LinkedIn', icon: linkedinIcon },
  { id: 'instagram', label: 'Instagram', icon: instagramIcon },
  { id: 'youtube', label: 'YouTube', icon: youtubeIcon },
];

export default function Footer() {
  const { settings } = useContent();
  const contacts = [
    {
      id: 'phone',
      label: 'Call our team',
      value: settings.phone,
      href: settings.phoneHref,
      icon: phoneIcon,
    },
    {
      id: 'email',
      label: 'Send an email',
      value: settings.email,
      href: settings.email ? `mailto:${settings.email}` : '',
      icon: mailIcon,
    },
  ].filter(({ value }) => Boolean(value));

  return (
    <footer className='footer'>
      <div className='container'>
        <div className='footer__main'>
          <div className='footer__information'>
            <Link className='footer__logo' to='/' aria-label='Veldridge Roofing — Home'>
              <span className='footer__logo-name'>Veldridge</span>
              <span className='footer__logo-description'>Roofing</span>
            </Link>

            <p className='footer__description'>
              Reliable roofing solutions for homes and businesses
              {settings.serviceArea ? ` across ${settings.serviceArea}` : ''}.
              {' '}Your roof is our priority.
            </p>

            <nav className='footer__nav' aria-label='Footer navigation'>
              <ul className='footer__nav-list'>
                {navLinks.map(({ label, path }) => (
                  <li key={path}>
                    <NavLink className='footer__nav-link' to={path} end={path === '/'}>
                      {label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            {contacts.length > 0 && (
              <div className='footer__contacts'>
                {contacts.map(({ id, label, value, href, icon }) => (
                  <div className='footer__contact' key={id}>
                    <span className='footer__contact-symbol'>
                      <img className='footer__contact-icon' src={icon} alt='' />
                    </span>
                    <div className='footer__contact-copy'>
                      <span className='footer__contact-label'>{label}</span>
                      {href && !settings.isDemo
                        ? <a href={href}>{value}</a>
                        : <span>{value}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className='footer__socials' aria-label='Social media'>
              {socialIcons.map(({ id, label, icon }) => {
                const url = settings.socials?.[id];
                return url ? (
                  <a
                    className='footer__social'
                    href={url}
                    aria-label={`${label} (opens in a new tab)`}
                    target='_blank'
                    rel='noopener noreferrer'
                    key={id}
                  >
                    <img src={icon} alt='' />
                  </a>
                ) : (
                  <span className='footer__social footer__social--inactive' key={id} title={`${label} link not configured`}>
                    <img src={icon} alt={label} />
                  </span>
                );
              })}
            </div>
          </div>

          <FooterMap />
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
}
