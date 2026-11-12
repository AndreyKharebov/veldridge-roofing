import { useLayoutEffect, useRef } from 'react';

// The journal is a static, newest-first list. Reveal each row independently;
// never delay all ten articles or animate text inside the reading dialog.
const REVEAL_GROUPS = [
  { selector: '.page-hero__content', direction: 'up' },
  { selector: '.page-hero__visual', direction: 'right', offset: 1 },
  { selector: '.page-hero__highlight', direction: 'up', stagger: true },
  { selector: '.article-list__header', direction: 'up' },
  { selector: '.article-row', direction: 'up' },
  { selector: '.page-cta__content', direction: 'up' },
  { selector: '.page-cta__image', direction: 'right', offset: 1 },
];

export const useBlogReveal = () => {
  const pageRef = useRef(null);

  useLayoutEffect(() => {
    const root = pageRef.current;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
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
    let passedFrame = 0;

    const reveal = (element, immediate = false) => {
      if (disposed || !pending.delete(element)) return;
      element.dataset.blogRevealState = immediate ? 'static' : 'visible';
      observer.unobserve(element);
      if (pending.size === 0) observer.disconnect();
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.15) {
          reveal(entry.target);
        } else if (entry.boundingClientRect.bottom <= 0) {
          reveal(entry.target, true);
        }
      });
    }, { threshold: [0, 0.15] });

    // A fast jump can skip both observer thresholds. Never strand a passed row.
    const revealPassed = () => {
      passedFrame = 0;
      if (disposed) return;
      pending.forEach((element) => {
        if (element.getBoundingClientRect().bottom <= 0) reveal(element, true);
      });
    };
    const onScroll = () => {
      if (!disposed && pending.size > 0 && !passedFrame) {
        passedFrame = window.requestAnimationFrame(revealPassed);
      }
    };

    targets.forEach(({ element, direction, order }) => {
      element.dataset.blogReveal = direction;
      element.dataset.blogRevealState = 'pending';
      element.style.setProperty('--blog-reveal-order', String(order));
    });

    const revealAll = () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      window.cancelAnimationFrame(passedFrame);
      passedFrame = 0;
      [...pending].forEach((element) => reveal(element, true));
      targets.forEach(({ element }) => { element.dataset.blogRevealState = 'static'; });
      observer.disconnect();
    };
    const onPreferenceChange = (event) => {
      if (event.matches) revealAll();
    };
    const onFocus = (event) => {
      targets.forEach(({ element }) => {
        if (element.contains(event.target)) {
          reveal(element, true);
          element.dataset.blogRevealState = 'static';
        }
      });
    };

    root.addEventListener('focusin', onFocus);
    preference.addEventListener('change', onPreferenceChange);
    window.addEventListener('beforeprint', revealAll);
    window.addEventListener('scroll', onScroll, { passive: true });
    onFocus({ target: document.activeElement });

    // Paint the start state before observing above-the-fold items. Cancel both
    // frames on unmount/StrictMode so an old visit cannot affect the next one.
    firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        if (disposed) return;
        revealPassed();
        pending.forEach((element) => observer.observe(element));
      });
    });

    return () => {
      disposed = true;
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      window.cancelAnimationFrame(passedFrame);
      observer.disconnect();
      root.removeEventListener('focusin', onFocus);
      preference.removeEventListener('change', onPreferenceChange);
      window.removeEventListener('beforeprint', revealAll);
      window.removeEventListener('scroll', onScroll);
      targets.forEach(({ element }) => {
        delete element.dataset.blogReveal;
        delete element.dataset.blogRevealState;
        element.style.removeProperty('--blog-reveal-order');
      });
      pending.clear();
    };
  }, []);

  return pageRef;
};
