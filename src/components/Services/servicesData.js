import inspectionIcon from '../../assets/services/icons/inspection.svg';
import commercialIcon from '../../assets/services/icons/commercial.svg';
import replacementIcon from '../../assets/services/icons/replacement.svg';
import solarIcon from '../../assets/services/icons/solar.svg';
import repairsIcon from '../../assets/services/icons/repairs.svg';
import renovationIcon from '../../assets/services/icons/renovation.svg';

import inspectionImage from '../../assets/services/inspection.webp';
import commercialImage from '../../assets/services/commercial.webp';
import replacementImage from '../../assets/services/replacement.webp';
import solarImage from '../../assets/services/solar.webp';
import repairsImage from '../../assets/services/repairs.webp';
import renovationImage from '../../assets/services/renovation.webp';

export const servicesData = [
  {
    id: 'inspection',
    title: 'Free Inspection',
    description:
      'Professional roof inspections to identify potential issues before they become costly repairs.',
    image: inspectionImage,
    icon: inspectionIcon,
  },
  {
    id: 'commercial',
    title: 'Commercial Roofing',
    description:
      'Reliable roofing solutions designed to protect commercial properties.',
    image: commercialImage,
    icon: commercialIcon,
  },
  {
    id: 'replacement',
    title: 'Roof Replacement',
    description:
      'High-quality roofing materials and expert installation for lasting protection.',
    image: replacementImage,
    icon: replacementIcon,
  },
  {
    id: 'solar',
    title: 'Solar Panels',
    description: 'Explore energy-efficient solar solutions for your property.',
    image: solarImage,
    icon: solarIcon,
  },
  {
    id: 'repairs',
    title: 'Damage Repairs',
    description: 'Restore damaged roofing and help prevent further problems.',
    image: repairsImage,
    icon: repairsIcon,
  },
  {
    id: 'renovation',
    title: 'Roof Renovation',
    description:
      'Refresh and improve your roof with professional renovation services.',
    image: renovationImage,
    icon: renovationIcon,
  },
];
