// Page choreography only. Timing lives in styles/motion/_settings.sass.
export const galleryMotion = [
  { selector: '.page-hero__content', direction: 'up' },
  { selector: '.page-hero__visual', direction: 'right', offset: 1 },
  { selector: '.page-hero__highlight', direction: 'up', stagger: true },
  { selector: '.project-gallery__header', direction: 'up' },
  { selector: '.page-cta__content', direction: 'up' },
  { selector: '.page-cta__image', direction: 'right', offset: 1 },
  { selector: '.project-card[data-gallery-project]', direction: 'up', stagger: true, columns: 3, tabletColumns: 2, idAttribute: 'data-gallery-project' },
];

export const galleryMotionOptions = { dynamic: true };
