import PageHero from '../../../../components/sections/PageHero/PageHero.jsx';

import aboutHeroImage from './assets/about-hero.webp';
import { heroHighlights } from './heroHighlights.js';

const AboutHero = () => (
  <PageHero
    idPrefix='about-hero'
    breadcrumb='About Us'
    eyebrow='About Veldridge Roofing'
    title={<>Good Roofs Start<br />With <span>Good People.</span></>}
    description='A Philadelphia-based roofing team, helping homeowners across Pennsylvania, New Jersey, and Delaware protect the place they call home.'
    primaryAction={{ label: 'Contact Our Team', to: '/contact' }}
    secondaryAction={{ label: 'Explore Our Work', to: '/gallery' }}
    note='Local care. Lasting protection.'
    image={aboutHeroImage}
    imageAlt='Roofing professionals inspecting a standing-seam metal roof'
    highlights={heroHighlights}
  />
);

export default AboutHero;
