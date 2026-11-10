import Hero from '../components/Hero/Hero';
import About from '../components/About/About';
import Services from '../components/Services/Services';
import WhyChooseUs from '../components/WhyChooseUs/WhyChooseUs';
import CTA from '../components/CTA/CTA';
import Gallery from '../components/Gallery/Gallery';
import Testimonials from '../components/Testimonials/Tesitmonials';
import LatestNews from '../components/LatestNews/LatestNews';
import FAQ from '../components/FAQ/FAQ';

const HomePage = () => {
  return (
    <>
      <Hero />
      <About />
      <Services />
      <WhyChooseUs />
      <CTA />
      <Gallery />
      <Testimonials />
      <LatestNews />
      <FAQ />
    </>
  );
};

export default HomePage;
