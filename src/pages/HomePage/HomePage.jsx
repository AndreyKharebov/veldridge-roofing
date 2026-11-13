import { useMotionReveal } from '../../hooks/useMotionReveal.js';
import { homeMotion } from './motion/homeMotion.js';

import Hero from './components/Hero/Hero.jsx';
import About from './components/About/About.jsx';
import Services from './components/Services/Services.jsx';
import WhyChooseUs from './components/WhyChooseUs/WhyChooseUs.jsx';
import CTA from './components/CTA/CTA.jsx';
import Gallery from './components/Gallery/Gallery.jsx';
import Testimonials from './components/Testimonials/Testimonials.jsx';
import LatestNews from './components/LatestNews/LatestNews.jsx';
import FAQ from './components/FAQ/FAQ.jsx';

const HomePage = () => {
  const pageRef = useMotionReveal(homeMotion);
  return (
    <div className='home-page motion-root' ref={pageRef}>
      <Hero />
      <About />
      <Services />
      <WhyChooseUs />
      <CTA />
      <Gallery />
      <Testimonials />
      <LatestNews />
      <FAQ />
    </div>
  );
};

export default HomePage;
