# Contact motion

Page-owned progressive enhancement. No changes to the inquiry form, validation, optional photo picker, demo submission, router context, map content, shared layout or dependencies.

## Choreography

- The compact introduction and contact overview rise slightly with a fade.
- Phone, email, office and hours reveal individually, with short stagger only on desktop/tablet.
- The service-area description, map heading and complete map figure rise once when 15% visible.
- The pin and address move with the map; no separate bouncing, looping or nested animations.
- Desktop: 18px / 480ms, 60ms contact-row stagger. Tablet (701–1100px): 14px / 420ms, 40ms stagger. Mobile (up to 700px): 10px / 360ms, zero delay. All motion is upward, with no sideways travel.

## Interaction and accessibility

The form, labels, controls, photo picker, errors, result, breadcrumbs and sample-contact disclosure are never motion targets and remain available immediately. Typing, selecting/removing files, submitting and returning to the form cannot replay reveals. The existing #contact-form navigation and Gallery/Blog prefills are unchanged.

`useContactReveal.js` observes individual static elements with one IntersectionObserver. Content is visible before enhancement, with reduced motion or without the observer API. Keyboard focus reveals its target immediately. Enabling reduced motion finishes pending/in-flight transitions without restarting them if the preference changes back. Printing exposes all content. A passive animation-frame-throttled scroll fallback exposes pending items already passed during rapid scrolling or restored navigation; no geometry reads happen once the pending set is empty.

Completed items stay visible through reverse scrolling, viewport changes and form rerenders. A fresh page mount starts a new visit. Cleanup cancels animation frames, disconnects the observer and removes listeners/attributes/styles, including during React StrictMode. No persistent storage or animation libraries.

Edit timing/distance in `ContactMotion.sass`; edit supporting-content selectors in `useContactReveal.js`. Keep the form and demo disclosures outside the reveal groups.
