import { useEffect } from 'react';
import { useNavigationType } from 'react-router';

import AboutHero from './components/AboutHero/AboutHero.jsx';
import OurApproach from './components/OurApproach/OurApproach.jsx';
import OurValues from './components/OurValues/OurValues.jsx';
import HowWeWork from './components/HowWeWork/HowWeWork.jsx';
import ServiceAreas from './components/ServiceAreas/ServiceAreas.jsx';
import AboutCTA from './components/AboutCTA/AboutCTA.jsx';

import './AboutPage.sass';

const AboutPage = () => {
  const navigationType = useNavigationType();

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'About Us | Veldridge Roofing';

    // Start at the top after in-app navigation, but preserve browser Back/Forward.
    if (navigationType !== 'POP') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }

    return () => {
      document.title = previousTitle;
    };
  }, [navigationType]);

  return (
    <div className='about-page'>
      <AboutHero />
      <OurApproach />
      <OurValues />
      <HowWeWork />
      <ServiceAreas />
      <AboutCTA />
    </div>
  );
};

export default AboutPage;
