import PageHero from '../../../../components/sections/PageHero/PageHero.jsx';
import blogHeroImage from '../../assets/articles/article-02.webp';
import { heroHighlights } from './heroHighlights.js';

const BlogHero = () => (
  <PageHero
    idPrefix='blog-hero'
    breadcrumb='Blog'
    eyebrow='The Veldridge Roofing Journal'
    title={<>Roofing Insights.<br /><span>Made Simple.</span></>}
    description='Practical ideas for caring for your roof, understanding your options, and planning your next project with confidence. One helpful read at a time.'
    primaryAction={{ to: '/contact', label: 'Contact Our Team' }}
    secondaryAction={{ to: '/blog#articles', label: 'Read the Latest' }}
    note='A little knowledge. A better plan.'
    image={blogHeroImage}
    imageAlt='Roofing professionals inspecting a standing-seam metal roof'
    highlights={heroHighlights}
  />
);

export default BlogHero;
