import { Link } from 'react-router';
import './ContactIntro.sass';

const ContactIntro = () => (
  <section className='contact-intro' aria-labelledby='contact-title'>
    <div className='container contact-intro__inner'>
      <nav className='contact-intro__breadcrumbs' aria-label='Breadcrumb'>
        <ol><li><Link to='/'>Home</Link></li><li aria-hidden='true'>/</li><li><span aria-current='page'>Contact</span></li></ol>
      </nav>
      <div className='contact-intro__heading'>
        <p className='contact-intro__eyebrow'>Let’s start a conversation</p>
        <h1 className='contact-intro__title' id='contact-title'>Let’s Talk About <span>Your Roof.</span></h1>
        <p className='contact-intro__description'>Tell us what you have in mind. We’ll help you find a clear next step.</p>
      </div>
    </div>
  </section>
);
export default ContactIntro;
