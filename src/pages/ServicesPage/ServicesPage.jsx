import { motionConfig } from '../../config/motion.js';
import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router';
import ServicesHero from './components/ServicesHero/ServicesHero.jsx';
import ServiceFinder from './components/ServiceFinder/ServiceFinder.jsx';
import ServiceDetail from './components/ServiceDetail/ServiceDetail.jsx';
import ServiceCare from './components/ServiceCare/ServiceCare.jsx';
import ServicesCTA from './components/ServicesCTA/ServicesCTA.jsx';
import { useContent } from '../../content/context.js';
import { useMotionReveal } from '../../hooks/useMotionReveal.js';
import { servicesMotion, servicesMotionOptions } from './motion/servicesMotion.js';
import './ServicesPage.sass';

const ServicesPage = () => {
  const { services, servicesStatus, servicesError, reloadServices } = useContent();
  const activeServices = services.filter((service) => service.status === 'active');
  const visibleServices = [
    ...activeServices.filter((service) => service.group === 'main'),
    ...activeServices.filter((service) => service.group === 'supporting'),
  ].map((service, index) => ({ ...service, number: String(index + 1).padStart(2, '0') }));
  const mainServices = visibleServices.filter((service) => service.group === 'main');
  const supportingServices = visibleServices.filter((service) => service.group === 'supporting');
  const serviceNavigation = visibleServices.map(({ id, title, number }) => ({ id, title, number }));
  const pageRef = useMotionReveal(servicesMotion, servicesMotionOptions);
  const { hash, key } = useLocation();
  const navigationType = useNavigationType();
  const scrolled = useRef('');
  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Roofing Services | Veldridge Roofing';
    return () => { document.title = previousTitle; };
  }, []);
  useEffect(() => {
    if (!hash && navigationType !== 'POP') window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [hash, key, navigationType]);
  useEffect(() => {
    if (!hash) { scrolled.current = ''; return; }
    const token = `${key}:${hash}`;
    if (scrolled.current === token || servicesStatus !== 'ready') return;
    let targetId;
    try { targetId = decodeURIComponent(hash.slice(1)); } catch { return; }
    let secondFrame = 0;
    const firstFrame = window.requestAnimationFrame(() => {
      const target = document.getElementById(targetId);
      if (!target?.matches('[data-service-anchor]')) return;
      // Reveal/focus first, then measure scroll geometry after the next paint.
      target.focus({ preventScroll: true });
      secondFrame = window.requestAnimationFrame(() => {
        if (!target.isConnected) return;
        scrolled.current = token;
        const reduced = window.matchMedia(motionConfig.reducedMotionQuery).matches;
        target.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' });
      });
    });
    return () => { window.cancelAnimationFrame(firstFrame); window.cancelAnimationFrame(secondFrame); };
  }, [hash, key, servicesStatus, services]);
  return <div className='services-page motion-root' ref={pageRef}>
    <ServicesHero />
    <ServiceFinder services={serviceNavigation} />
    {servicesStatus === 'loading' && <div className='container'><p role='status' className='services-page__text'>Loading services…</p></div>}
    {servicesError && <div className='container' role='status'><p className='services-page__text'>{servicesError}</p><button type='button' className='services-page__button' onClick={reloadServices}>Try again</button></div>}
    {servicesStatus === 'ready' && !visibleServices.length && <div className='container'><p className='services-page__text'>Services will be available soon. Contact our team with your questions.</p></div>}
    {mainServices.map((service, index) => <ServiceDetail key={service.id} service={{ ...service, tone: index % 2 === 0 ? 'white' : 'warm' }} imageRight={index % 2 === 1} />)}
    {supportingServices.length > 0 && <ServiceCare services={supportingServices} />}
    <ServicesCTA />
  </div>;
};
export default ServicesPage;
