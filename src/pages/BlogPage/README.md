> **Admin integration:** Live content now comes from the shared local workspace.
> Edit it through `/admin`; the original data modules below are seed inputs only.
> See `src/admin/README.md` for demo credentials, persistence and backend limitations.
> Contact submissions are now saved to this browser’s demo inbox, not just logged.

# Blog

Implementation of the approved **Blog — Desktop 1440** frame (`161:932`) and
its ten article overlays (`162:1058` through `162:1355`) in the Roofing company
Figma file. `/blog` keeps the site's existing route, Header and Footer.

## Structure

- `BlogHero` and `BlogCTA` compose the existing shared `PageHero` and `PageCTA`.
- `ArticleList` renders all ten articles in one column, newest date first.
- `ArticleRow` uses a heading with a native button whose hit area covers the row.
- `ArticleDialog` is a native modal dialog: fixed toolbar, independently scrolling
  body, keyboard focus containment, Escape/close/backdrop dismissal, background
  scroll locking and return to the previous scroll/focus position.
- `data/blogArticles.js` owns all dates, titles, summaries, paragraphs, sources,
  images and alt text. `articleDate.js` formats date-only values in UTC.

There are deliberately no search controls, filters, categories, pagination,
Load More, separate article routes or additional runtime dependencies.
`Read the Latest` links to `/blog#articles` and respects reduced motion.
All contact actions use `/contact`; the reader additionally passes `articleId`
and `articleTitle` in navigation state. The Contact form itself is out of scope.

## Editing articles and photography

Add or edit entries in `data/blogArticles.js`. Keep `id` unique and stable, use
`YYYY-MM-DD` for `publishedAt`, and include a title, summary, image, imageAlt,
sections (`heading` and `body`), and a source (`label` and HTTPS `url`).
The list sorts by date automatically and every entry opens its own reading view.
Bodies render as text, not HTML. No text is truncated inside the reader.

Dates are demonstration publication dates copied from the approved design.
The ten English articles are working editorial copy, not project-specific advice.
Review dates, editorial text, photography rights and source links before launch.
No individual author, credentials, warranty or performance claim is invented.

Photography and SVGs are local page-owned copies of the exact images/icons
already used in Figma and Gallery. Replacing them here does not change Gallery.
The photo order maps to Gallery projects 10, 08, 12, 01, 07, 05, 11, 02, 04, 09.
Hero reuses article 02 and the contact panel reuses article 04. The shared Hero
mask stays independent of the rectangular image. List covers are 320 × 208px
at 1440px; reader covers are 800 × 260px before scrollbar allocation.

## Responsive behavior and verification

Desktop follows the approved design. Tablet retains a horizontal article row;
mobile stacks the image and text. The reader fits the viewport, and the Close
button remains reachable while its body scrolls. Only Read More color changes
on desktop hover; there is no scroll-triggered reveal or autoplay.

Run `npm run lint` and `npm run build`. Check `/blog` at 320, 390, 700, 701, 900,
1100, 1101, 1280, 1440 and 1920px; open every article and verify keyboard access,
scroll/focus restoration, source links, the end-of-article CTA and direct anchor
navigation. Existing pages, shared styles and package dependencies are unchanged.

## Animation settings

All timing and motion distances: `src/styles/motion/_settings.sass`.
Trigger/carousel configuration: `src/config/motion.js`.
Shared behavior: `src/hooks/useMotionReveal.js`. Page-specific target selectors
are in `motion/blogMotion.js`. See `src/styles/motion/README.md`.
