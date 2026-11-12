import PageCTA from '../../../../components/sections/PageCTA/PageCTA.jsx';

import servicesCtaImage from './assets/services-cta.webp';

const ServicesCTA = () => (
  <PageCTA
    idPrefix='services-cta'
    eyebrow='Not Sure Which Service You Need?'
    title={<>Let’s Find The Right<br />Next Step For Your Roof.</>}
    description='Tell us what you have noticed and what you have in mind. Start with a free inspection or talk through your project with our team.'
    action={{ label: 'Contact Our Team', to: '/contact' }}
    image={servicesCtaImage}
    imageAlt='Aerial view of a completed standing-seam metal roof'
  />
);

export default ServicesCTA;
