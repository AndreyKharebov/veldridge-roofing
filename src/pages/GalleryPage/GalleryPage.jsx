import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router';

import GalleryHero from './components/GalleryHero/GalleryHero.jsx';
import ProjectGallery from './components/ProjectGallery/ProjectGallery.jsx';
import GalleryCTA from './components/GalleryCTA/GalleryCTA.jsx';
import './GalleryPage.sass';

const GalleryPage = () => {
  const { hash, key } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Project Gallery | Veldridge Roofing';
    return () => { document.title = previousTitle; };
  }, []);

  useEffect(() => {
    if (hash !== '#projects') {
      if (!hash && navigationType !== 'POP') {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }
      return;
    }
    const frame = window.requestAnimationFrame(() => {
      const target = document.getElementById('projects');
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      target?.scrollIntoView({ behavior: navigationType === 'POP' || reduceMotion ? 'instant' : 'smooth' });
      target?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [hash, key, navigationType]);

  return (
    <div className='gallery-page'>
      <GalleryHero />
      <ProjectGallery />
      <GalleryCTA />
    </div>
  );
};

export default GalleryPage;
