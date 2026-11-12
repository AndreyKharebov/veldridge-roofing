import { useLayoutEffect, useRef } from 'react';

// Keep filters, status, Load More and the photo viewer out of scroll reveals.
const STATIC_GROUPS = [
  { selector: '.page-hero__content', direction: 'up' },
  { selector: '.page-hero__visual', direction: 'right', offset: 1 },
  { selector: '.page-hero__highlight', direction: 'up', stagger: true },
  { selector: '.project-gallery__header', direction: 'up' },
  { selector: '.page-cta__content', direction: 'up' },
  { selector: '.page-cta__image', direction: 'right', offset: 1 },
];

export const useGalleryReveal = () => {
  const pageRef = useRef(null);

  useLayoutEffect(() => {
    const root = pageRef.current;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!root || preference.matches || typeof window.IntersectionObserver !== 'function'
      || typeof window.MutationObserver !== 'function') return;

    const targets = new Map();
    const pending = new Set();
    const queued = new Set();
    // Stable project IDs survive filter unmount/remount within this visit.
    const seenProjects = new Set();
    let disposed = false;
    let motionDisabled = false;
    let firstFrame = 0;
    let secondFrame = 0;

    const reveal = (element, immediate = false) => {
      if (disposed || !targets.has(element)) return;
      if (!pending.delete(element) && !immediate) return;
      queued.delete(element);
      element.dataset.galleryRevealState = immediate ? 'static' : 'visible';
      const projectId = targets.get(element);
      if (projectId) seenProjects.add(projectId);
      observer.unobserve(element);
      if (pending.size === 0) observer.disconnect();
    };

    const observer = new IntersectionObserver((entries) => {
      if (disposed) return;
      entries.forEach((entry) => {
        if (!root.contains(entry.target)) return;
        if (entry.isIntersecting && entry.intersectionRatio >= 0.15) {
          reveal(entry.target);
        } else if (entry.boundingClientRect.bottom <= 0) {
          reveal(entry.target, true);
        }
      });
    }, { threshold: [0, 0.15] });

    const observeAfterPaint = () => {
      if (disposed || motionDisabled || !queued.size || firstFrame || secondFrame) return;
      firstFrame = window.requestAnimationFrame(() => {
        firstFrame = 0;
        secondFrame = window.requestAnimationFrame(() => {
          secondFrame = 0;
          if (disposed || motionDisabled) return;
          queued.forEach((element) => {
            if (pending.has(element) && root.contains(element)) observer.observe(element);
          });
          queued.clear();
        });
      });
    };

    const register = (element, direction, order, tabletOrder = order, projectId = null) => {
      element.style.setProperty('--gallery-reveal-order', String(order));
      element.style.setProperty('--gallery-reveal-tablet-order', String(tabletOrder));
      if (targets.has(element)) return;
      targets.set(element, projectId);
      element.dataset.galleryReveal = direction;
      if (motionDisabled || (projectId && seenProjects.has(projectId))) {
        element.dataset.galleryRevealState = 'static';
        return;
      }
      element.dataset.galleryRevealState = 'pending';
      pending.add(element);
      queued.add(element);
    };

    const syncTargets = () => {
      if (disposed) return;
      targets.forEach((_, element) => {
        if (!root.contains(element)) {
          observer.unobserve(element);
          pending.delete(element);
          queued.delete(element);
          targets.delete(element);
        }
      });
      STATIC_GROUPS.forEach(({ selector, direction, offset = 0, stagger }) => {
        root.querySelectorAll(selector).forEach((element, index) => {
          register(element, direction, (stagger ? index : 0) + offset);
        });
      });
      root.querySelectorAll('.project-card[data-gallery-project]').forEach((element, index) => {
        // Stagger within a row, never accumulate a delay across the whole list.
        register(element, 'up', index % 3, index % 2, element.dataset.galleryProject);
      });
      observeAfterPaint();
    };

    const revealAll = () => {
      motionDisabled = true;
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      firstFrame = 0;
      secondFrame = 0;
      queued.clear();
      targets.forEach((_, element) => reveal(element, true));
      observer.disconnect();
    };
    const onPreferenceChange = (event) => { if (event.matches) revealAll(); };
    const onFocus = (event) => {
      // Load More can focus a newly mounted card before the mutation callback.
      syncTargets();
      targets.forEach((_, element) => {
        if (element.contains(event.target)) reveal(element, true);
      });
    };

    const mutations = new MutationObserver(syncTargets);
    // Only React's child-list changes matter; our own attributes cannot loop.
    mutations.observe(root, { childList: true, subtree: true });
    root.addEventListener('focusin', onFocus);
    preference.addEventListener('change', onPreferenceChange);
    window.addEventListener('beforeprint', revealAll);
    syncTargets();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      observer.disconnect();
      mutations.disconnect();
      root.removeEventListener('focusin', onFocus);
      preference.removeEventListener('change', onPreferenceChange);
      window.removeEventListener('beforeprint', revealAll);
      targets.forEach((_, element) => {
        delete element.dataset.galleryReveal;
        delete element.dataset.galleryRevealState;
        element.style.removeProperty('--gallery-reveal-order');
        element.style.removeProperty('--gallery-reveal-tablet-order');
      });
      targets.clear();
      pending.clear();
      queued.clear();
    };
  }, []);

  return pageRef;
};
