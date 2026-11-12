import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router';

import ServicesHero from './components/ServicesHero/ServicesHero.jsx';
import ServiceFinder from './components/ServiceFinder/ServiceFinder.jsx';
import ServiceDetail from './components/ServiceDetail/ServiceDetail.jsx';
import ServiceCare from './components/ServiceCare/ServiceCare.jsx';
import ServicesCTA from './components/ServicesCTA/ServicesCTA.jsx';
import { mainServices, supportingServices, serviceNavigation } from './servicesData.js';
import { useServicesReveal } from './motion/useServicesReveal.js';

import './ServicesPage.sass';
import './motion/ServicesMotion.sass';

const ServicesPage = () => {
  const pageRef = useServicesReveal();
  const { hash, key } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Roofing Services | Veldridge Roofing';
    return () => { document.title = previousTitle; };
  }, []);

  useEffect(() => {
    // Declarative BrowserRouter does not supply ScrollRestoration. Handle
    // in-page links, direct hash URLs and browser history on this page only.
    if (!hash) {
      if (navigationType !== 'POP') {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }
      return;
    }

    let targetId;
    try {
      targetId = decodeURIComponent(hash.slice(1));
    } catch {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      const target = document.getElementById(targetId);
      if (!target?.matches('[data-service-anchor]')) return;

      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      // Focus reveals the destination immediately, before scroll geometry is
      // measured. This also keeps the animated care-card anchors accurate.
      target.focus({ preventScroll: true });
      target.scrollIntoView({
        behavior: navigationType === 'POP' || reduceMotion ? 'instant' : 'smooth',
        block: 'start',
      });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [hash, key, navigationType]);

  return (
    <div className='services-page' ref={pageRef}>
      <ServicesHero />
      <ServiceFinder services={serviceNavigation} />
      {mainServices.map((service, index) => (
        <ServiceDetail
          key={service.id}
          service={service}
          imageRight={index % 2 === 1}
        />
      ))}
      <ServiceCare services={supportingServices} />
      <ServicesCTA />
    </div>
  );
};

export default ServicesPage;
