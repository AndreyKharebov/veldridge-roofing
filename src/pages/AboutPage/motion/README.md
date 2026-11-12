# About page motion

`useAboutReveal` attaches to the existing `.about-page` root. Its selectors are scoped to that root, so shared PageHero and PageCTA remain unchanged on every other page. No extra wrappers, libraries or layout changes are needed. Home's `useScrollReveal` is not modified.

## Choreography

- Hero copy lifts slightly; the shaped image comes from the right. Each highlight is observed independently.
- Our Approach: the main photo lifts and the detail photo comes from the right. The copy has a short upward reveal.
- Our Values: heading plus three gently staggered cards.
- How We Work: heading/description plus four staggered steps.
- Service Areas: copy from the left, three region cards from the right.
- Contact CTA: copy lifts, image comes from the right.

Every target reveals once per page mount at 15% intersection. Already-passed targets at restored scroll positions become visible without motion. Scrolling back, rerendering, or changing breakpoints never hides a revealed target. Each mobile item is observed separately, with no cumulative delay.

Desktop uses 28px / 560ms / 80ms stagger; tablet 22px / 480ms / 50ms; mobile 16px / 400ms / no stagger and upward motion only. Adjust the CSS custom properties in `AboutMotion.sass`. Keep properties and selectors at the same Sass indentation level.

## Accessibility and lifecycle

Content is visible before enhancement and when IntersectionObserver is unavailable. Reduced Motion at mount skips motion entirely; enabling it later immediately finishes all motion and does not replay when disabled. Keyboard focus immediately reveals its containing target. Printing reveals everything. Only opacity and transform transition; layout footprints do not move. Horizontal overflow is clipped on About only.

One IntersectionObserver is used per mount and each target is unobserved once revealed. RequestAnimationFrame setup, media listeners and focus/print listeners are cleaned up on route changes and React StrictMode's extra effect cycle. No scroll-event polling, timers or permanently promoted `will-change` layers.

The hook owns only the `data-about-reveal*` attributes and `--about-reveal-order` inline property. Do not set those attributes from JSX. If a section's class names change, update REVEAL_GROUPS. Static/final content, links, imagery, typography and existing responsive layouts stay unchanged.
