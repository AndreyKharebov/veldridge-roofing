# About Us page

Desktop implementation of the **About Us — Desktop 1440** Figma frame (`134:264`).

## Organization

`AboutPage.jsx` composes six sections using the existing 1280px content area,
color/font tokens, and global Header/Footer in `App.jsx`.

- `AboutHero`: page-owned content and photography passed to the shared `PageHero`.
- `OurApproach`: two-photo composition and company approach.
- `OurValues`: three numbered values.
- `HowWeWork`: four ordered project stages.
- `ServiceAreas`: PA, NJ, and DE coverage.
- `AboutCTA`: page-owned content and photography passed to the shared `PageCTA`.

`PageHero` and `PageCTA` live in `src/components/sections` and are also used by
Services. Their Sass uses `styles/abstracts/_interior-page.sass` presentation
mixins. Other About sections retain their own JSX and indented Sass. No component
or stylesheet is imported from HomePage.

Desktop (1101px and above) follows the supplied composition. Narrower screens
have a simple non-overflowing fallback; a separately art-directed Tablet/Mobile
layout can be refined later. No new runtime dependency is used.

## Replacing the temporary photography

These independent copies of existing project photos can be replaced without
changing HomePage or Services:

| Replace this local asset | Original HomePage source |
| --- | --- |
| `components/AboutHero/assets/about-hero.webp` | `About/assets/about-secondary.webp` |
| `components/OurApproach/assets/approach-main.webp` | `About/assets/about-main.webp` |
| `components/OurApproach/assets/approach-detail.webp` | `LatestNews/assets/news-1.webp` |
| `components/AboutCTA/assets/about-cta.webp` | `Hero/assets/hero-1.webp` |

Keep filenames when replacing files and update the corresponding alt text.
The shared Hero mask is `src/components/sections/PageHero/assets/page-hero-mask.svg`;
About's original WebP remains rectangular and does not need pre-cutting.

## Routes and checks

The existing `/about` route points at this page. Contact actions use `/contact`
and Explore Our Work uses `/gallery`. These destinations retain their existing
content; this page does not implement them.

Run `npm run lint` and `npm run build`. Inspect `/about` at 1101, 1280, 1440, and
1920px and check keyboard focus, image loading, and shared navigation.

## Animation settings

All timing and motion distances: `src/styles/motion/_settings.sass`.
Trigger/carousel configuration: `src/config/motion.js`.
Shared behavior: `src/hooks/useMotionReveal.js`. Page-specific target selectors
are in `motion/aboutMotion.js`. See `src/styles/motion/README.md`.
