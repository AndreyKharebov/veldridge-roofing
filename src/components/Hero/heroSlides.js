import heroImage from '../../assets/hero.webp';
import client1 from '../../assets/clients/client-1.webp';
import client2 from '../../assets/clients/client-2.webp';
import client3 from '../../assets/clients/client-3.webp';
import client4 from '../../assets/clients/client-4.webp';

export const heroSlides = [
  {
    id: 'residential-roofing',
    image: heroImage,
    imageAlt: 'Residential home with a newly installed roof',
    topRight: {
      text: 'Quality Roofing. Lasting Protection.',
      // text: 'Professional and quality roofing services.',
      // text: 'Quality Craftsmanship. Stronger Roofs.',
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
  },
];
