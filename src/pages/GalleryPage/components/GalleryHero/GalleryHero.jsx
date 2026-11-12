import PageHero from '../../../../components/sections/PageHero/PageHero.jsx';
import heroImage from '../../assets/projects/project-05.webp';
import { heroHighlights } from './heroHighlights.js';

const GalleryHero = () => (
  <PageHero
    idPrefix='gallery-hero'
    breadcrumb='Gallery'
    eyebrow='The Veldridge Project Gallery'
    title={<>Craft You Can See.<br /><span>Care You Can Trust.</span></>}
    description='Explore roofing projects for homes and businesses. Take a closer look at the work, materials, and details behind every finished roof.'
    primaryAction={{ to: '/contact', label: 'Discuss Your Project' }}
    secondaryAction={{ to: '#projects', label: 'Explore Projects' }}
    note='Details matter. Results show.'
    image={heroImage}
    imageAlt='A tiled residential roof with a brick chimney under a blue sky'
    highlights={heroHighlights}
  />
);

export default GalleryHero;
