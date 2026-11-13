> **Admin integration:** Live content now comes from the shared local workspace.
> Edit it through `/admin`; the original data modules below are seed inputs only.
> See `src/admin/README.md` for demo credentials, persistence and backend limitations.
> Contact submissions are now saved to this browser’s demo inbox, not just logged.

# Gallery

Implementation of the approved Gallery Desktop 1440 (`155:531`) and Project Dialog (`156:636`) in the Roofing company Figma file.

## Structure

- `GalleryHero` and `GalleryCTA` configure the existing shared `PageHero` / `PageCTA` components. Header/Footer remain global in App.
- `ProjectGallery` owns category filtering, 12 initial cards, Load More batches of 6, and the selected project.
- `ProjectCard` is one accessible whole-card button, not a link to a separate route. It opens a modal dialog.
- `ProjectDialog` uses native `dialog.showModal()` and a React portal. It supports Escape, backdrop/close button, keyboard photo arrows, thumbnails and touch swipes. The native dialog makes background content inert and restores focus; body scroll is locked and restored when returning to the grid.
- `ProjectPhoto` renders an image, an optional data-driven crop, and a non-breaking unavailable-image state.
- `data/galleryProjects.js` contains all project details, categories, photographs and pagination constants. Assets are local to this page because they are shared by its hero, cards, modal and CTA.

## Demo content — replace before publication

All 18 records are **illustrative examples**, not verified jobs completed by Veldridge. The first 12 follow the approved Figma grid. Six additional examples reuse separate HomePage photographs to make Load More demonstrable without repeating the first 12 cards. Visible disclosures remain in the grid and every sample dialog.

The example durations, materials, finishes and scopes are not factual company claims or quotes. Replace them with verified project information before setting `isDemo: false`. No addresses, customer identities, warranties or performance claims are invented.

Each sample currently uses an overview and two detail crops of the **same image**, as in the approved modal. These are labelled as crops, not separate photographs or before/after stages. For real projects, replace `photos` with entries `{ id, src, alt, caption }` importing real photographs of that project, and omit `crop`. The dialog also supports a single-photo project (no navigation/thumbnails).

Change the `isDemo` mapping at the end of `galleryProjects.js` when migrating to individually verified records. `image` is the grid cover; `photos` is the modal sequence; `dialogTitle` optionally specifies a line break. Keep unique IDs. Adding a project to the data automatically updates category results and pagination. No backend is required.

## Interaction and routes

- `/gallery` displays 12 cards. Load More reveals the next six and transfers keyboard focus to the first added card. It disappears when the selected category is exhausted.
- Filters use `aria-pressed`, reset the visible count, and announce the result count. Closing a project preserves the current category, loaded count and scroll position.
- Explore Projects uses `/gallery#projects`, including direct links and repeated clicks.
- Contact actions go to the existing `/contact` page. The dialog passes `projectId` and `projectTitle` in router state for a future contact form; Contact is still the existing placeholder and no form submission is implemented.
- Desktop hover adds a small lift; touch/tablet cards do not lift. Reduced-motion preferences disable decorative transitions.

Desktop follows the Figma composition. Tablet uses two columns, Mobile one; the modal becomes one scrollable column on narrow screens. No new runtime dependency or global style change is needed.

## Checks

Run `npm run lint` and `npm run build`. Verify filtering, Load More, all project details, photo arrows/thumbnails, Escape, backdrop click, focus return, scroll restoration, Contact navigation and 320–1920px layouts. Browser verification is performed on a separate temporary GitHub verification branch; temporary asset URLs and CI preparation scripts are not part of the production page.

## Animation settings

All timing and motion distances: `src/styles/motion/_settings.sass`.
Trigger/carousel configuration: `src/config/motion.js`.
Shared behavior: `src/hooks/useMotionReveal.js`. Page-specific target selectors
are in `motion/galleryMotion.js`. See `src/styles/motion/README.md`.
