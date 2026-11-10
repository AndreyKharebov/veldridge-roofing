import heroImage1 from './assets/hero-1.webp';
import heroImage2 from './assets/hero-2.webp';
import heroImage3 from './assets/hero-3.webp';
import heroImage4 from './assets/hero-4.webp';

import client1 from './assets/clients/client-1.webp';
import client2 from './assets/clients/client-2.webp';
import client3 from './assets/clients/client-3.webp';
import client4 from './assets/clients/client-4.webp';

export const heroImages = [
  {
    id: 1,
    src: heroImage1,
    alt: 'Residential home with a newly installed roof',
  },
  {
    id: 2,
    src: heroImage2,
    alt: 'Professional residential roofing project',
  },
  {
    id: 3,
    src: heroImage3,
    alt: 'Residential roofing installation',
  },
  {
    id: 4,
    src: heroImage4,
    alt: 'Expert roof renovation',
  },
];

export const heroContent = {
  topRight: {
    text: 'Quality Roofing. Lasting Protection.',
  },
  topLeft: {
    title: 'Proudly Serving',
    description: 'PA · NJ · DE',
    states: ['PA', 'NJ', 'DE'],
  },
  bottom: {
    text: '1550+ Satisfied Clients',
    avatars: [client1, client2, client3, client4],
  },
};
