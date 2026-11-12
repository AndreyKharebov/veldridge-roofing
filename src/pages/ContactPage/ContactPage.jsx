import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router';
import ContactIntro from './components/ContactIntro/ContactIntro.jsx';
import ContactDetails from './components/ContactDetails/ContactDetails.jsx';
import InquiryForm from './components/InquiryForm/InquiryForm.jsx';
import ContactMap from './components/ContactMap/ContactMap.jsx';
import { getInquiryContext } from './data/inquiry.js';
import './ContactPage.sass';

const ContactPage = () => {
  const { state, hash, key } = useLocation();
  const navigationType = useNavigationType();
  const context = getInquiryContext(state);
  const formKey = context ? `${context.type}:${context.id}:${context.title}` : 'direct';

  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Contact Us | Veldridge Roofing';
    return () => { document.title = previousTitle; };
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (hash === '#contact-form') {
        document.getElementById('contact-form')?.scrollIntoView({ block: 'start', behavior: 'instant' });
        document.getElementById('contact-name')?.focus({ preventScroll: true });
      } else if (navigationType !== 'POP') {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [hash, key, navigationType]);

  return (
    <div className='contact-page'>
      <ContactIntro />
      <section className='contact-page__main' aria-label='Contact information and inquiry form'>
        <div className='container contact-page__columns'>
          <ContactDetails />
          <InquiryForm key={formKey} context={context} />
        </div>
      </section>
      <ContactMap />
    </div>
  );
};

export default ContactPage;
