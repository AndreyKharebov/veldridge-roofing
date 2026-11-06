import { useEffect, useState } from 'react';
import './Header.sass';

const Header = () => {
  const [menuState, setMenuState] = useState('closed');

  const isMenuOpen = menuState === 'open';

  const toggleMenu = () => {
    setMenuState((prev) => (prev === 'open' ? 'closing' : 'open'));
  };

  const handleNavClick = (event) => {
    const link = event.target.closest('a');

    if (link && event.currentTarget.contains(link) && isMenuOpen) {
      setMenuState('closing');
    }
  };

  const handleMenuAnimationEnd = (event) => {
    if (
      event.target === event.currentTarget &&
      menuState === 'closing' &&
      event.animationName === 'menu-slide-up'
    ) {
      setMenuState('closed');
    }
  };

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMenuState('closing');
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
        setMenuState('closed');
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
        <a
          className='header__logo'
          href='/'
          aria-label='Veldridge Roofing — Home'
        >
          <span className='header__logo-name'>Veldridge</span>
          <span className='header__logo-description'>Roofing</span>
        </a>

        <nav
          className={`header__nav header__nav--${menuState}`}
          id='main-navigation'
          aria-label='Main navigation'
          onClick={handleNavClick}
          onAnimationEnd={handleMenuAnimationEnd}
        >
          <ul className='header__nav-list'>
            <li className='header__nav-item'>
              <a className='header__nav-link' href='#home' aria-current='page'>
                Home
              </a>
            </li>

            <li className='header__nav-item'>
              <a className='header__nav-link' href='#about'>
                About
              </a>
            </li>

            <li className='header__nav-item'>
              <a className='header__nav-link' href='#services'>
                Services
              </a>
            </li>

            <li className='header__nav-item'>
              <a className='header__nav-link' href='#gallery'>
                Gallery
              </a>
            </li>

            <li className='header__nav-item'>
              <a className='header__nav-link' href='#blog'>
                Blog
              </a>
            </li>
          </ul>
        </nav>

        <a className='header__contact' href='#contact'>
          Contact
        </a>

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
