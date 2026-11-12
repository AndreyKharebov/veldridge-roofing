import PageCTA from '../../../../components/sections/PageCTA/PageCTA.jsx';
import ctaImage from '../../assets/projects/project-01.webp';

const GalleryCTA = () => (
  <PageCTA
    idPrefix='gallery-cta'
    eyebrow='Inspired By What You See?'
    title={<>Your Project Could<br />Be Next.</>}
    description='Tell us about your roof and what you have in mind. We’ll help you explore the options and plan your next step.'
    action={{ to: '/contact', label: 'Discuss Your Project' }}
    image={ctaImage}
    imageAlt='A charcoal standing-seam roof on a timber-clad home'
  />
);

export default GalleryCTA;
