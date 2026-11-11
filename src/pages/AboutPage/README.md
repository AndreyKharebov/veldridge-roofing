# About Us page

Desktop implementation of the **About Us — Desktop 1440** Figma frame (`134:264`).

## Organization

`AboutPage.jsx` composes six independent sections. Each section owns its JSX,
indented Sass, local content data, and (where needed) image assets. The page uses
the existing 1280px content area, color/font tokens, and global Header/Footer in
`App.jsx`; it does not import components or styles from HomePage.

- `AboutHero`: breadcrumb, page introduction, shaped image, trust strip.
- `OurApproach`: two-photo composition and company approach.
- `OurValues`: three numbered values.
- `HowWeWork`: four ordered project stages.
- `ServiceAreas`: PA, NJ, and DE coverage.
- `AboutCTA`: dark contact panel.

Desktop (1101px and above) follows the supplied composition. Narrower screens
have a simple non-overflowing fallback; a separately art-directed Tablet/Mobile
layout can be refined later. No new animation library or other dependency is used.

## Replacing the temporary photography

The following local files initially reuse existing project photographs. These
are deliberate temporary copies so that replacing About photography does not
change HomePage or create imports into another page's private asset directory.

| Replace this local asset | Original HomePage source |
| --- | --- |
| `components/AboutHero/assets/about-hero.webp` | `About/assets/about-secondary.webp` |
| `components/OurApproach/assets/approach-main.webp` | `About/assets/about-main.webp` |
| `components/OurApproach/assets/approach-detail.webp` | `LatestNews/assets/news-1.webp` |
| `components/AboutCTA/assets/about-cta.webp` | `Hero/assets/hero-1.webp` |

Keep filenames when replacing files and update the corresponding `alt` text.
The Hero photo uses an independent SVG alpha mask, so the original WebP remains
rectangular and can be replaced without pre-cutting the photo.

## Routes and checks

The existing `/about` route already points at this page. Contact actions use the
existing `/contact` route and Explore Our Work uses `/gallery`. These destination
pages remain the project's existing placeholders; this change does not claim to
implement their content.

Run `npm run lint` and `npm run build`. Inspect `/about` at 1101, 1280, 1440, and
1920px and check keyboard focus, image loading, and the shared navigation.
