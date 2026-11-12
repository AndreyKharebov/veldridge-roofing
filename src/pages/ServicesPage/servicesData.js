import inspectionImage from './components/ServiceDetail/assets/inspection.webp';
import replacementImage from './components/ServiceDetail/assets/replacement.webp';
import repairsImage from './components/ServiceDetail/assets/repairs.webp';
import renovationImage from './components/ServiceDetail/assets/renovation.webp';
import commercialImage from './components/ServiceDetail/assets/commercial.webp';
import solarImage from './components/ServiceDetail/assets/solar.webp';
import maintenanceImage from './components/ServiceCare/assets/maintenance.webp';
import guttersImage from './components/ServiceCare/assets/gutters.webp';

// One source for the detail sections and the service finder's anchor links.
export const mainServices = [
  {
    id: 'free-inspection',
    number: '01',
    eyebrow: 'Start with clarity',
    title: 'Free Inspection',
    description: 'Not sure what your roof needs? Start with a careful look at its condition and a conversation about the next step.',
    points: [
      'Roof condition and visible concerns',
      'A clear explanation of the findings',
      'Repair or replacement options to consider',
    ],
    cta: 'Book a Free Inspection',
    tone: 'warm',
    image: inspectionImage,
    imageAlt: 'Roofing professional checking the details of a standing-seam roof',
  },
  {
    id: 'roof-replacement',
    number: '02',
    eyebrow: 'A fresh start for your home',
    title: 'Roof Replacement',
    description: 'When repairs are no longer the right fit, plan a new roofing system around your home, your priorities, and the way you want it to look.',
    points: [
      'Material and roof-style selection',
      'Removal and replacement planning',
      'Finishing details and a final walkthrough',
    ],
    cta: 'Discuss Your Project',
    tone: 'white',
    image: replacementImage,
    imageAlt: 'Roofing crew replacing tiles on a pitched residential roof',
  },
  {
    id: 'damage-repairs',
    number: '03',
    eyebrow: 'Targeted care, where it matters',
    title: 'Damage Repairs',
    description: 'A leak or damaged roof detail does not always mean a full replacement. We look at the problem and discuss a focused repair approach.',
    points: [
      'Leaks and damaged roofing materials',
      'Flashing and vulnerable roof transitions',
      'Repairs matched to the existing roof',
    ],
    cta: 'Discuss a Repair',
    tone: 'muted',
    image: repairsImage,
    imageAlt: 'Two roofers working on the metal roof of a timber-clad home',
  },
  {
    id: 'roof-renovation',
    number: '04',
    eyebrow: 'Refresh what is already there',
    title: 'Roof Renovation',
    description: 'Improve the look and condition of an existing roof where the underlying structure can be retained. We help define what to refresh and what to replace.',
    points: [
      'Condition-led improvement planning',
      'Selected roofing and detail upgrades',
      'A finish that complements your home',
    ],
    cta: 'Plan Your Renovation',
    tone: 'white',
    image: renovationImage,
    imageAlt: 'Renovated tiled roof on a wood-sided house',
  },
  {
    id: 'commercial-roofing',
    number: '05',
    eyebrow: 'Built around your business',
    title: 'Commercial Roofing',
    description: 'Roofing support for commercial properties, with a plan shaped around the building, its use, and the people who rely on it.',
    points: [
      'Roof assessment and scope planning',
      'Repair or replacement recommendations',
      'Scheduling around property operations',
    ],
    cta: 'Discuss Your Property',
    tone: 'muted',
    image: commercialImage,
    imageAlt: 'Low-rise commercial building with a white flat roof',
  },
  {
    id: 'solar-panels',
    number: '06',
    eyebrow: 'Plan the roof and solar together',
    title: 'Solar Panels',
    description: 'Explore solar with the condition of your roof in mind. Start with a conversation about roof readiness, layout, and installation coordination.',
    points: [
      'Roof condition and suitability review',
      'Panel layout and installation planning',
      'Coordination with roofing work',
    ],
    cta: 'Discuss Solar Options',
    tone: 'white',
    image: solarImage,
    imageAlt: 'Solar panel array installed on a residential pitched roof',
  },
];

export const supportingServices = [
  {
    id: 'roof-maintenance',
    number: '07',
    title: 'Roof Maintenance',
    description: 'Keep an eye on your roof between major projects with a practical plan for routine care.',
    points: ['Periodic condition reviews', 'Small issues and upkeep priorities'],
    image: maintenanceImage,
    imageAlt: 'Roof tiles, chimney and rainwater gutter on a residential home',
  },
  {
    id: 'storm-damage-restoration',
    number: '08',
    title: 'Storm Damage Restoration',
    description: 'Make sense of the damage after severe weather and plan the work your roof needs next.',
    points: ['Post-storm roof assessment', 'Repair and restoration planning'],
    image: replacementImage,
    imageAlt: 'Roofing crew carrying out work on a tiled roof',
  },
  {
    id: 'gutters-drainage',
    number: '09',
    title: 'Gutters & Drainage',
    description: 'Help rainwater move away from your roof with gutters and drainage details that work together.',
    points: ['Gutter and downspout assessment', 'Repair or replacement options'],
    image: guttersImage,
    imageAlt: 'Roof edge and gutter beneath a tiled roof with a brick chimney',
  },
];

export const serviceNavigation = [...mainServices, ...supportingServices].map(
  ({ id, number, title }) => ({ id, number, title }),
);
