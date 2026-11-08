import heroImage from '../../assets/hero.png';
import client1 from '../../assets/clients/client-1.png';
import client2 from '../../assets/clients/client-2.png';
import client3 from '../../assets/clients/client-3.png';
import client4 from '../../assets/clients/client-4.png';

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
