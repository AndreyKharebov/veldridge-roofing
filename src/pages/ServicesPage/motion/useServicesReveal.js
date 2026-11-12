import { useLayoutEffect, useRef } from 'react';

// Services-only enhancement. Keep shared sections and Home/About motion intact.
// The service menu is deliberately excluded so navigation is available at once.
const REVEAL_GROUPS = [
  { selector: '.page-hero__content', direction: 'up' },
  { selector: '.page-hero__visual', direction: 'right', offset: 1 },
  { selector: '.page-hero__highlight', direction: 'up', stagger: true },
  { selector: '.service-finder__heading', direction: 'up' },
  { selector: '.service-finder__description', direction: 'up', offset: 1 },
  { selector: '.service-detail:not(.service-detail--image-right) .service-detail__image', direction: 'left' },
  { selector: '.service-detail--image-right .service-detail__image', direction: 'right' },
  // Each service starts its own short sequence; delays never grow down the page.
  { selector: '.service-detail__content', direction: 'up', offset: 1 },
  { selector: '.service-care__header', direction: 'up' },
  { selector: '.service-care__card', direction: 'up', stagger: true },
  { selector: '.page-cta__content', direction: 'up' },
  { selector: '.page-cta__image', direction: 'right', offset: 1 },
];

export const useServicesReveal = () => {
  const pageRef = useRef(null);

  useLayoutEffect(() => {
    const root = pageRef.current;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Visible by default: a missing observer or Reduced Motion never hides content.
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
      element.dataset.servicesRevealState = immediate ? 'static' : 'visible';
      observer.unobserve(element);
      if (pending.size === 0) observer.disconnect();
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.15) {
          reveal(entry.target);
        } else if (entry.boundingClientRect.bottom <= 0) {
          // Direct anchors and restored scroll positions may skip entire sections.
          reveal(entry.target, true);
        }
      });
    }, { threshold: [0, 0.15] });

    targets.forEach(({ element, direction, order }) => {
      element.dataset.servicesReveal = direction;
      element.dataset.servicesRevealState = 'pending';
      element.style.setProperty('--services-reveal-order', String(order));
    });

    // Paint the initial state before observing above-the-fold content.
    firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        if (!disposed) pending.forEach((element) => observer.observe(element));
      });
    });

    const revealAll = () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      [...pending].forEach((element) => reveal(element, true));
      targets.forEach(({ element }) => { element.dataset.servicesRevealState = 'static'; });
      observer.disconnect();
    };
    const onPreferenceChange = (event) => {
      if (event.matches) revealAll();
    };
    const onFocus = (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      targets.forEach(({ element }) => {
        // Native anchor focus is on a section, not on its animated children.
        const isAnchorDestination = target.matches('[data-service-anchor]') && target.contains(element);
        if (element.contains(target) || isAnchorDestination) {
          reveal(element, true);
          element.dataset.servicesRevealState = 'static';
        }
      });
    };

    root.addEventListener('focusin', onFocus);
    preference.addEventListener('change', onPreferenceChange);
    window.addEventListener('beforeprint', revealAll);
    if (root.contains(document.activeElement)) onFocus({ target: document.activeElement });

    return () => {
      disposed = true;
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
      observer.disconnect();
      root.removeEventListener('focusin', onFocus);
      preference.removeEventListener('change', onPreferenceChange);
      window.removeEventListener('beforeprint', revealAll);
      targets.forEach(({ element }) => {
        delete element.dataset.servicesReveal;
        delete element.dataset.servicesRevealState;
        element.style.removeProperty('--services-reveal-order');
      });
    };
  }, []);

  return pageRef;
};
