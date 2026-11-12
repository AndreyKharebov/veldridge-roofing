import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router';

import BlogHero from './components/BlogHero/BlogHero.jsx';
import ArticleList from './components/ArticleList/ArticleList.jsx';
import BlogCTA from './components/BlogCTA/BlogCTA.jsx';
import './BlogPage.sass';

const BlogPage = () => {
  const { hash, key } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Roofing Blog | Veldridge Roofing';
    return () => { document.title = previousTitle; };
  }, []);

  useEffect(() => {
    if (!hash) {
      if (navigationType !== 'POP') {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }
      return;
    }
    if (hash !== '#articles') return;

    const frameId = window.requestAnimationFrame(() => {
      const target = document.getElementById('articles');
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      target?.scrollIntoView({
        behavior: navigationType === 'POP' || reducedMotion ? 'instant' : 'smooth',
        block: 'start',
      });
      target?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [hash, key, navigationType]);

  return (
    <div className='blog-page'>
      <BlogHero />
      <ArticleList />
      <BlogCTA />
    </div>
  );
};

export default BlogPage;
