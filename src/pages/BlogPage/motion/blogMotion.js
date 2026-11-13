// Page choreography only. Timing lives in styles/motion/_settings.sass.
export const blogMotion = [
  { selector: '.page-hero__content', direction: 'up' },
  { selector: '.page-hero__visual', direction: 'right', offset: 1 },
  { selector: '.page-hero__highlight', direction: 'up', stagger: true },
  { selector: '.article-list__header', direction: 'up' },
  { selector: '.article-row', direction: 'up' },
  { selector: '.page-cta__content', direction: 'up' },
  { selector: '.page-cta__image', direction: 'right', offset: 1 },
];
