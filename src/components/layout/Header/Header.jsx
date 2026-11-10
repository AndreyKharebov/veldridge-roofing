import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';

import './Header.sass';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Services', path: '/services' },
  { label: 'Gallery', path: '/gallery' },
  { label: 'Blog', path: '/blog' },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const toggleMenu = () => {
    setHasInteracted(true);
    setIsMenuOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleNavClick = (event) => {
    const link = event.target.closest('a');

    if (link && event.currentTarget.contains(link) && isMenuOpen) {
      closeMenu();
    }
  };

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeMenu();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');

    const handleBreakpointChange = (event) => {
      if (event.matches) {
        setIsMenuOpen(false);
        setHasInteracted(false);
      }
    };

    mediaQuery.addEventListener('change', handleBreakpointChange);

    return () => {
      mediaQuery.removeEventListener('change', handleBreakpointChange);
    };
  }, []);

  return (
    <header className='header'>
      <div className='container header__inner'>
        <NavLink
          className='header__logo'
          to='/'
          aria-label='Veldridge Roofing — Home'
        >
          <span className='header__logo-name'>Veldridge</span>
          <span className='header__logo-description'>Roofing</span>
        </NavLink>

        <nav
          className={[
            'header__nav',
            isMenuOpen && 'header__nav--open',
            hasInteracted && 'header__nav--animated',
          ]
            .filter(Boolean)
            .join(' ')}
          id='main-navigation'
          aria-label='Main navigation'
          onClick={handleNavClick}
        >
          <ul className='header__nav-list'>
            {navLinks.map(({ label, path }) => (
              <li className='header__nav-item' key={path}>
                <NavLink
                  className='header__nav-link'
                  to={path}
                  end={path === '/'}
                >
                  {label}
                </NavLink>
              </li>
            ))}

            <li className='header__nav-item header__nav-item--contact'>
              <NavLink
                className='header__nav-link header__nav-link--contact'
                to='/contact'
              >
                Contact
              </NavLink>
            </li>
          </ul>
        </nav>

        <NavLink className='header__contact' to='/contact'>
          Contact
        </NavLink>

        <button
          className='header__burger'
          type='button'
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
          aria-controls='main-navigation'
          onClick={toggleMenu}
        >
          <span className='header__burger-line'></span>
          <span className='header__burger-line'></span>
        </button>
      </div>
    </header>
  );
};

export default Header;
