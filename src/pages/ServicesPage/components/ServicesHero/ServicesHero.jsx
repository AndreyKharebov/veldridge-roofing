import PageHero from '../../../../components/sections/PageHero/PageHero.jsx';

import servicesHeroImage from './assets/services-hero.webp';
import { heroHighlights } from './heroHighlights.js';

const ServicesHero = () => (
  <PageHero
    idPrefix='services-hero'
    breadcrumb='Services'
    eyebrow='Services by Veldridge Roofing'
    title={<>Roofing Services.<br /><span>Built Around You.</span></>}
    description='From a small repair to a fresh start, find roofing services for your home or business across Pennsylvania, New Jersey, and Delaware.'
    primaryAction={{ label: 'Book a Free Inspection', to: '/contact' }}
    secondaryAction={{ label: 'Explore Services', to: '#service-finder' }}
    note='Repair. Replace. Protect.'
    image={servicesHeroImage}
    imageAlt='A completed slate-colored roof with dormer windows'
    highlights={heroHighlights}
  />
);

export default ServicesHero;
