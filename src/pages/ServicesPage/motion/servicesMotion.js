// Page choreography only. Timing lives in styles/motion/_settings.sass.
export const servicesMotion = [
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

export const servicesMotionOptions = { dynamic: true, anchorSelector: '[data-service-anchor]' };
