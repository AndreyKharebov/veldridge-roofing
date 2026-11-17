import { NavLink, Link } from 'react-router';
import { useContent } from '../../../content/context.js';
import { normalizeSocialUrl } from '../../../utils/socialUrl.js';
import FooterMap from './FooterMap.jsx';
import phoneIcon from './assets/phone.svg';
import mailIcon from './assets/mail.svg';
import facebookIcon from './assets/facebook.svg';
import linkedinIcon from './assets/linkedin.svg';
import instagramIcon from './assets/instagram.svg';
import youtubeIcon from './assets/youtube.svg';
import './Footer.sass';

const navLinks = [
  { label: 'Home', path: '/' }, { label: 'About', path: '/about' },
  { label: 'Services', path: '/services' }, { label: 'Gallery', path: '/gallery' },
  { label: 'Blog', path: '/blog' }, { label: 'Contact', path: '/contact' },
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
    { id: 'phone', label: 'Call our team', value: settings.phone, href: settings.phoneHref, icon: phoneIcon },
    { id: 'email', label: 'Send an email', value: settings.email, href: settings.email ? `mailto:${settings.email}` : '', icon: mailIcon },
  ].filter(({ value }) => Boolean(value));
  const socialLinks = socialIcons.flatMap((item) => {
    try {
      const url = normalizeSocialUrl(settings.socials?.[item.id] ?? '');
      return url ? [{ ...item, url }] : [];
    } catch { return []; }
  });
  return <footer className='footer'>
    <div className='container'><div className='footer__main'>
      <div className='footer__information'>
        <Link className='footer__logo' to='/' aria-label='Veldridge Roofing — Home'><span className='footer__logo-name'>Veldridge</span><span className='footer__logo-description'>Roofing</span></Link>
        <p className='footer__description'>Reliable roofing solutions for homes and businesses{settings.serviceArea ? ` across ${settings.serviceArea}` : ''}. Your roof is our priority.</p>
        <nav className='footer__nav' aria-label='Footer navigation'><ul className='footer__nav-list'>
          {navLinks.map(({ label, path }) => <li key={path}><NavLink className='footer__nav-link' to={path} end={path === '/'}>{label}</NavLink></li>)}
        </ul></nav>
        {contacts.length > 0 && <div className='footer__contacts'>{contacts.map(({ id, label, value, href, icon }) => <div className='footer__contact' key={id}>
          <span className='footer__contact-symbol'><img className='footer__contact-icon' src={icon} alt='' /></span>
          <div className='footer__contact-copy'><span className='footer__contact-label'>{label}</span>{href && !settings.isDemo ? <a href={href}>{value}</a> : <span>{value}</span>}</div>
        </div>)}</div>}
        {socialLinks.length > 0 && <div className='footer__socials' aria-label='Social media'>
          {socialLinks.map(({ id, label, icon, url }) => <a className='footer__social' href={url} aria-label={`${label} (opens in a new tab)`} target='_blank' rel='noopener noreferrer' key={id}><img src={icon} alt='' /></a>)}
        </div>}
      </div>
      <FooterMap />
    </div></div>
    <div className='footer__bottom'><div className='container footer__bottom-inner'>
      <p className='footer__copyright'>© {new Date().getFullYear()} Veldridge Roofing. All Rights Reserved.</p>
      <div className='footer__legal'><span>Privacy Policy</span><span className='footer__separator' aria-hidden='true' /><span>Terms of Service</span></div>
    </div></div>
  </footer>;
}
