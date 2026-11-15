import { useEffect, useId, useRef } from 'react';
import { Link, useLocation } from 'react-router';
import './NotFound.sass';

// Shared by the public catch-all, the protected admin catch-all, and missing
// admin records. Loading/connection errors must not be rendered as a 404.
export default function NotFound({
  variant = 'site',
  title = 'Page not found.',
  description = 'The page you are looking for may have moved, or the address may be incorrect.',
  returnTo,
  returnLabel,
}) {
  const isAdmin = variant === 'admin';
  const { pathname } = useLocation();
  const headingId = useId();
  const headingRef = useRef(null);
  const pageTitle = `404 — ${title.replace(/\.$/, '')} | ${isAdmin ? 'Veldridge Admin' : 'Veldridge Roofing'}`;

  useEffect(() => {
    // Own only this tag: never remove a robots policy supplied elsewhere.
    const robots = document.createElement('meta');
    robots.name = 'robots';
    robots.content = 'noindex, follow';
    robots.dataset.notFound = 'true';
    document.head.appendChild(robots);

    let previousTitle;
    // Wait for the parent layout's title effect before setting the error title.
    const frame = window.requestAnimationFrame(() => {
      previousTitle = document.title;
      document.title = pageTitle;
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      headingRef.current?.focus({ preventScroll: true });
    });
    return () => {
      window.cancelAnimationFrame(frame);
      robots.remove();
      if (previousTitle !== undefined && document.title === pageTitle) {
        document.title = previousTitle;
      }
    };
  }, [pathname, pageTitle]);

  return (
    <section className={`not-found not-found--${variant}`} aria-labelledby={headingId} data-page-status='404'>
      <div className='not-found__inner'>
        <p className='not-found__code' aria-hidden='true'>404</p>
        <p className='not-found__eyebrow'>{isAdmin ? 'Admin workspace' : 'Let’s get you back home'}</p>
        <h1 className='not-found__title' id={headingId} ref={headingRef} tabIndex={-1}>
          <span className='not-found__sr-only'>Error 404. </span>{title}
        </h1>
        <p className='not-found__description'>{description}</p>
        <div className='not-found__actions'>
          <Link className='not-found__button not-found__button--primary' to={returnTo || (isAdmin ? '/admin' : '/')}>
            {returnLabel || (isAdmin ? 'Back to overview' : 'Back to Home')}
          </Link>
          <Link className='not-found__button not-found__button--secondary' to={isAdmin ? '/' : '/contact'}>
            {isAdmin ? 'View website' : 'Contact us'}
          </Link>
        </div>
        {!isAdmin && (
          <nav className='not-found__links' aria-label='Explore the website'>
            <span>Or explore</span>
            <Link to='/services'>Our services</Link>
            <Link to='/gallery'>Our projects</Link>
            <Link to='/blog'>Roofing journal</Link>
          </nav>
        )}
      </div>
    </section>
  );
}
