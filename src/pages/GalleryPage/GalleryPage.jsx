import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router';

import GalleryHero from './components/GalleryHero/GalleryHero.jsx';
import ProjectGallery from './components/ProjectGallery/ProjectGallery.jsx';
import GalleryCTA from './components/GalleryCTA/GalleryCTA.jsx';
import { useGalleryReveal } from './motion/useGalleryReveal.js';
import './GalleryPage.sass';
import './motion/GalleryMotion.sass';

const GalleryPage = () => {
  const pageRef = useGalleryReveal();
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
      // Focus reveals the heading before measuring the anchor destination.
      target?.focus({ preventScroll: true });
      target?.scrollIntoView({ behavior: navigationType === 'POP' || reduceMotion ? 'instant' : 'smooth' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [hash, key, navigationType]);

  return (
    <div className='gallery-page' ref={pageRef}>
      <GalleryHero />
      <ProjectGallery />
      <GalleryCTA />
    </div>
  );
};

export default GalleryPage;
