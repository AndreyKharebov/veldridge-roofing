import PageCTA from '../../../../components/sections/PageCTA/PageCTA.jsx';
import blogCtaImage from '../../assets/articles/article-04.webp';

const BlogCTA = () => (
  <PageCTA
    idPrefix='blog-cta'
    eyebrow='Have a question about your roof?'
    title={<>Good Advice.<br />A Clear Next Step.</>}
    description='Every roof is different. Tell us what you have noticed, and we’ll help you talk through the right next step for your home.'
    action={{ to: '/contact', label: 'Contact Our Team' }}
    image={blogCtaImage}
    imageAlt='A finished charcoal metal roof on a timber-clad home'
  />
);

export default BlogCTA;
