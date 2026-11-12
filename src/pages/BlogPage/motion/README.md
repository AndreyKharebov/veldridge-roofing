# Blog motion

Page-scoped progressive enhancement. Other pages, shared PageHero/PageCTA, article content, assets, hover behavior and dependencies are unchanged.

## Choreography

- Hero: copy rises; photograph enters from the right; the three highlights use a short stagger.
- Article-list heading rises. Each of the ten article rows rises independently at 15% visibility, with zero row delay on all screens. The list is not an accumulating ten-step animation.
- CTA: copy rises; photograph enters from the right.
- Desktop: 28px / 560ms, 80ms stagger for Hero highlights. Tablet: 22px / 480ms, 50ms stagger. Mobile: upward-only 16px / 400ms, no stagger.
- Reader: 220ms fade with an 8px lift; backdrop fades for 200ms. No exit delay, no effects on individual paragraphs, no autoplay. Existing Escape/backdrop dismissal, focus loop, inner scrolling and Contact navigation are preserved.

## Behavior

`useBlogReveal.js` owns one IntersectionObserver scoped to the Blog root, observing individual items. Completed items never replay when resizing, scrolling back or opening/closing an article. A new page mount starts a new visit. No mutation observer is needed for the static list and nothing is stored persistently.

Content is visible before enhancement. Initial Reduced Motion or unavailable IntersectionObserver leaves it visible. Live Reduced Motion finishes current transitions and reveals pending items without replaying on preference reversal. Keyboard focus reveals its row immediately. The #articles target is focused/revealed before scroll measurement. A passive, animation-frame-throttled scroll fallback exposes any pending elements passed during fast viewport jumps; once all items are revealed it performs no geometry reads. Printing exposes every item.

Unmount and React StrictMode cleanup disconnect the observer, cancel frames, remove listeners and restore unenhanced attributes/styles. Modal re-renders never restart the hook.

Edit timing/distance in `BlogMotion.sass`, and section selectors in `useBlogReveal.js`. Dialog styles are explicitly scoped to `.article-dialog` because the native reader is rendered in a body portal.
