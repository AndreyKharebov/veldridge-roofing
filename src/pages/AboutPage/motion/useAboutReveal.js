import { useLayoutEffect, useRef } from 'react';

// Page-owned enhancement: shared PageHero/PageCTA and Home's reveal hook stay
// unchanged. Observe individual items, never an entire tall mobile section.
const REVEAL_GROUPS = [
  { selector: '.page-hero__content', direction: 'up' },
  { selector: '.page-hero__visual', direction: 'right', offset: 1 },
  { selector: '.page-hero__highlight', direction: 'up', stagger: true },
  { selector: '.our-approach__image--main', direction: 'up' },
  { selector: '.our-approach__image--detail', direction: 'right', offset: 1 },
  { selector: '.our-approach__content', direction: 'up' },
  { selector: '.our-values__header', direction: 'up' },
  { selector: '.our-values__card', direction: 'up', stagger: true },
  { selector: '.how-we-work__heading', direction: 'up' },
  { selector: '.how-we-work__description', direction: 'up', offset: 1 },
  { selector: '.how-we-work__step', direction: 'up', stagger: true },
  { selector: '.service-areas__content', direction: 'left' },
  { selector: '.service-areas__card', direction: 'right', stagger: true },
  { selector: '.page-cta__content', direction: 'up' },
  { selector: '.page-cta__image', direction: 'right', offset: 1 },
];

export const useAboutReveal = () => {
  const pageRef = useRef(null);

  useLayoutEffect(() => {
    const root = pageRef.current;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Content is visible by default; only hide it when enhancement is available.
    if (!root || preference.matches || typeof window.IntersectionObserver !== 'function') return;

    const targets = REVEAL_GROUPS.flatMap(({ selector, direction, stagger, offset = 0 }) =>
      Array.from(root.querySelectorAll(selector), (element, index) => ({
        element,
        direction,
        order: (stagger ? index : 0) + offset,
      })),
    );
    const pending = new Set(targets.map(({ element }) => element));
    let disposed = false;
    let firstFrame = 0;
    let secondFrame = 0;

    const reveal = (element, immediate = false) => {
      if (disposed || !pending.delete(element)) return;
      element.dataset.aboutRevealState = immediate ? 'static' : 'visible';
      observer.unobserve(element);
      if (pending.size === 0) observer.disconnect();
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.15) {
          reveal(entry.target);
        } else if (entry.boundingClientRect.bottom <= 0) {
          // Restored scroll positions must not leave already-passed content hidden.
          reveal(entry.target, true);
        }
      });
    }, { threshold: [0, 0.15] });

    targets.forEach(({ element, direction, order }) => {
      element.dataset.aboutReveal = direction;
      element.dataset.aboutRevealState = 'pending';
      element.style.setProperty('--about-reveal-order', String(order));
    });

    // Establish a painted start state before revealing above-the-fold elements.
    // These frames are cancelled during StrictMode cleanup or route unmount.
    firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        if (!disposed) pending.forEach((element) => observer.observe(element));
      });
    });

    const revealAll = () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      [...pending].forEach((element) => reveal(element, true));
      // Also finish any transitions already in flight, without replaying later.
      targets.forEach(({ element }) => { element.dataset.aboutRevealState = 'static'; });
      observer.disconnect();
    };
    const onPreferenceChange = (event) => {
      if (event.matches) revealAll();
    };
    const onFocus = (event) => {
      targets.forEach(({ element }) => {
        if (element.contains(event.target)) {
          reveal(element, true);
          element.dataset.aboutRevealState = 'static';
        }
      });
    };

    // Never make a keyboard user wait for an invisible focus target.
    root.addEventListener('focusin', onFocus);
    preference.addEventListener('change', onPreferenceChange);
    window.addEventListener('beforeprint', revealAll);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      observer.disconnect();
      root.removeEventListener('focusin', onFocus);
      preference.removeEventListener('change', onPreferenceChange);
      window.removeEventListener('beforeprint', revealAll);
      targets.forEach(({ element }) => {
        delete element.dataset.aboutReveal;
        delete element.dataset.aboutRevealState;
        element.style.removeProperty('--about-reveal-order');
      });
    };
  }, []);

  return pageRef;
};
