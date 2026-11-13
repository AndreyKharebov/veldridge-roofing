// Page choreography only. Timing lives in styles/motion/_settings.sass.
export const aboutMotion = [
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
