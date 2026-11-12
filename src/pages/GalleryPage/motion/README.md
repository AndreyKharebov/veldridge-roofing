# Gallery motion

Page-owned progressive enhancement. No changes to Home, About, Services, shared sections, assets, data or dependencies.

## Choreography

- Hero: copy rises slightly; visual comes from the right; highlights use a short stagger.
- Project heading rises. Filters, count and Load More are never hidden or delayed.
- Cards rise one time at 15% visibility. Desktop stagger resets every three cards (0 / 80 / 160 ms); tablet resets every two (0 / 50 ms).
- New projects added by filtering or Load More are observed automatically. Already revealed project IDs stay visible when a category is revisited. Closing a project never resets the list.
- CTA copy rises; photo enters from the right.
- Mobile: upward-only 16px movement, 400 ms, zero stagger. Tablet: 22px / 480 ms. Desktop: 28px / 560 ms.
- Project dialog opens with a 220 ms fade and 8px lift; its backdrop fades for 200 ms. Closing stays immediate. Photo switching has no additional animation, timers or autoplay.

## Behavior and accessibility

`useGalleryReveal.js` owns one IntersectionObserver and one child-list MutationObserver, scoped to this page. It remembers revealed IDs only for the current visit. A fresh page mount starts a new sequence. Individual items are observed, not the entire long grid.

The outer card is animated, leaving the existing inner button hover and focus ring intact. Keyboard focus (including Load More focus transfer) reveals its target immediately. Anchor focus occurs before scroll measurement. Finished reveals never replay on resize or subsequent scrolling.

Initial reduced motion or unavailable observer APIs leave everything visible. Enabling reduced motion during a visit finishes current transitions, exposes pending/new cards and does not replay them when the preference changes back. Print exposes all mounted items. Cleanup cancels frames, disconnects both observers, removes listeners and restores unenhanced styles, including in React StrictMode.

Edit timing/distance in `GalleryMotion.sass`; edit the static section selectors in `useGalleryReveal.js`. Keep `data-gallery-project` stable on ProjectCard so filtering cannot reset a previously shown project. No user data or motion state is persisted to storage.
