# Services scroll motion

This is an optional, page-scoped enhancement for `/services`. The existing page layout, photographs, text, shared PageHero/PageCTA, Home service cards, and About animations stay unchanged. No dependencies are added.

## Choreography

- Hero copy rises slightly; the photo enters from the right. The three highlights have a short stagger.
- Service Finder headings rise; all nine navigation links are visible and usable immediately.
- Each of the six service photos enters from its own layout side. Its text rises with a short local delay; the delay does not accumulate across services. Lists and buttons move with their text block rather than as distracting separate sequences.
- The supporting-care heading rises, then its three cards reveal independently with a short stagger.
- The final CTA copy rises and its photograph enters from the right.

Desktop (>1100px): 28px / 0.56s / 0.08s stagger. Tablet (701–1100px): 22px / 0.48s / 0.05s. Mobile (<=700px): 16px upward only / 0.4s / no stagger.

## Behavior and accessibility

Each item reveals once when 15% intersects the viewport. It never hides again during scrolling or breakpoint changes within the current visit. A new page mount starts a new visit. Already-passed items reveal immediately after a direct anchor or restored scroll position.

ServicesPage focuses an anchor before scrolling to it. The focus handler immediately reveals that destination and its animated children, so the user never lands on hidden content and animated care cards are measured at their final position. Direct hashes, repeated menu clicks and Back/Forward retain the existing route behavior.

Keyboard focus reveals its containing item without delay. Initial or live `prefers-reduced-motion: reduce`, printing, and an unavailable IntersectionObserver leave everything visible. Live Reduced Motion finishes all motion and never re-hides content when switched off. Observer callbacks, animation frames and listeners are cleaned up on unmount and React StrictMode cleanup.

Animation CSS uses only `.services-page` and `data-services-reveal*`. Timing/distance are in ServicesMotion.sass; target selection is in useServicesReveal.js. The scope is intentionally separate from Home's `.services` section and About's motion.
