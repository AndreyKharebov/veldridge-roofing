import PageCTA from '../../../../components/sections/PageCTA/PageCTA.jsx';

import aboutCtaImage from './assets/about-cta.webp';

const AboutCTA = () => (
  <PageCTA
    idPrefix='about-cta'
    eyebrow='Let’s Start A Conversation'
    title={<>Let’s Talk About<br />Your Roof.</>}
    description='A question, a repair, or a new roof — tell us what you need. We’re here to help you understand the next step.'
    action={{ label: 'Contact Us', to: '/contact' }}
    image={aboutCtaImage}
    imageAlt='A completed residential roofing project'
  />
);

export default AboutCTA;
