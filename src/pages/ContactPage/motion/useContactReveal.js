import { useLayoutEffect, useRef } from 'react';

// Animate supporting content only. Never hide the form, its controls, uploads,
// validation, demo result, breadcrumbs or the sample-data disclosure.
const REVEAL_GROUPS = [
  { selector: '.contact-intro__heading' },
  { selector: '.contact-details__intro' },
  { selector: '.contact-details__row', stagger: true },
  { selector: '.contact-details__area' },
  { selector: '.contact-map__heading' },
  { selector: '.contact-map__figure' },
];

export const useContactReveal = () => {
  const pageRef = useRef(null);

  useLayoutEffect(() => {
    const root = pageRef.current;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    // Progressive enhancement: CSS never hides content until this hook is ready.
    if (!root || preference.matches || typeof window.IntersectionObserver !== 'function') return;

    const targets = REVEAL_GROUPS.flatMap(({ selector, stagger }) =>
      Array.from(root.querySelectorAll(selector), (element, index) => ({
        element,
        order: stagger ? index : 0,
      })),
    );
    const pending = new Set(targets.map(({ element }) => element));
    let disposed = false;
    let firstFrame = 0;
    let secondFrame = 0;
    let passedFrame = 0;

    const reveal = (element, immediate = false) => {
      if (disposed || !pending.delete(element)) return;
      element.dataset.contactRevealState = immediate ? 'static' : 'visible';
      observer.unobserve(element);
      if (pending.size === 0) observer.disconnect();
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.15) {
          reveal(entry.target);
        } else if (entry.boundingClientRect.bottom <= 0) {
          // Restore already-passed content after hash navigation/history jumps.
          reveal(entry.target, true);
        }
      });
    }, { threshold: [0, 0.15] });

    // Fast scrolling can skip an intersection. Once all nine targets have been
    // revealed, this passive handler performs no further geometry reads.
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

    targets.forEach(({ element, order }) => {
      element.dataset.contactReveal = 'up';
      element.dataset.contactRevealState = 'pending';
      element.style.setProperty('--contact-reveal-order', String(order));
    });

    const revealAll = () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      window.cancelAnimationFrame(passedFrame);
      passedFrame = 0;
      [...pending].forEach((element) => reveal(element, true));
      // Also finish transitions already in progress. Do not replay them later.
      targets.forEach(({ element }) => { element.dataset.contactRevealState = 'static'; });
      observer.disconnect();
    };
    const onPreferenceChange = (event) => {
      if (event.matches) revealAll();
    };
    const onFocus = (event) => {
      targets.forEach(({ element }) => {
        if (element.contains(event.target)) {
          reveal(element, true);
          element.dataset.contactRevealState = 'static';
        }
      });
    };

    root.addEventListener('focusin', onFocus);
    preference.addEventListener('change', onPreferenceChange);
    window.addEventListener('beforeprint', revealAll);
    window.addEventListener('scroll', onScroll, { passive: true });
    onFocus({ target: document.activeElement });

    // Establish a painted start state, including on a direct /contact visit.
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
        delete element.dataset.contactReveal;
        delete element.dataset.contactRevealState;
        element.style.removeProperty('--contact-reveal-order');
      });
      pending.clear();
    };
  }, []);

  return pageRef;
};
