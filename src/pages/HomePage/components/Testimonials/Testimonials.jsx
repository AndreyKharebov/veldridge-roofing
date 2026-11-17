import { useEffect, useState } from 'react';
import { motionConfig } from '../../../../config/motion.js';
import { useTestimonialResource } from '../../../../hooks/useTestimonialResource.js';
import TestimonialCard from './TestimonialCard.jsx';

const Testimonials = () => {
  const { data, loading, error, reload } = useTestimonialResource('/api/testimonials', true);
  const items = data?.testimonials ?? [];
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 700px)').matches);
  const [reduced, setReduced] = useState(() => window.matchMedia(motionConfig.reducedMotionQuery).matches);
  useEffect(() => {
    const small = window.matchMedia('(max-width: 700px)');
    const preference = window.matchMedia(motionConfig.reducedMotionQuery);
    const onSmall = (event) => setMobile(event.matches);
    const onPreference = (event) => setReduced(event.matches);
    small.addEventListener('change', onSmall); preference.addEventListener('change', onPreference);
    return () => { small.removeEventListener('change', onSmall); preference.removeEventListener('change', onPreference); };
  }, []);
  const visibleCount = Math.min(mobile ? 1 : 2, items.length);
  const movable = items.length > visibleCount;
  const start = activeIndex % Math.max(1, items.length);
  const rotating = movable && !paused && !hovered && !reduced && !loading && !error;
  useEffect(() => {
    if (!rotating) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setActiveIndex((value) => (value + 1) % items.length);
    }, motionConfig.carousel.intervalMs);
    return () => window.clearInterval(timer);
  }, [rotating, items.length]);
  const step = (direction) => {
    setPaused(true);
    setActiveIndex((value) => (value + direction + items.length) % Math.max(1, items.length));
  };
  const visible = Array.from({ length: visibleCount }, (_, index) => items[(start + index) % items.length]);
  return <section className='testimonials' aria-labelledby='testimonials-title'><div className='container'>
    <div className='testimonials__header'><h2 className='testimonials__title' id='testimonials-title'>See What Our <span>Clients</span> Say</h2><p className='testimonials__description'>Discover what homeowners have to say about their experience with our roofing services.</p></div>
    {loading && <p className='testimonials__description' role='status'>Loading reviews…</p>}
    {error && <div className='testimonials__feedback' role='status'><p>Reviews could not be loaded.</p><button type='button' onClick={reload}>Try again</button></div>}
    {!loading && !error && !items.length && <p className='testimonials__description'>Reviews will appear here when they are published.</p>}
    {!loading && !error && items.length > 0 && <div role='region' aria-roledescription='carousel' aria-label='Customer reviews'
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onFocusCapture={(event) => { if (!event.target.closest('[data-review-rotation]')) setPaused(true); }}>
      <div className='testimonials__carousel'>
        <button className='testimonials__arrow' type='button' disabled={!movable} onClick={() => step(-1)} aria-label='Previous testimonial' aria-controls='testimonials-track'><svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'><path d='m15 18-6-6 6-6' /></svg></button>
        <div className='testimonials__viewport'><div className={`testimonials__track${visibleCount === 1 ? ' testimonials__track--single' : ''}`} id='testimonials-track' key={visible.map((item) => item.id).join(':')} aria-live={rotating ? 'off' : 'polite'} aria-atomic='true'>
          {visible.map((item) => <TestimonialCard key={item.id} testimonial={item} />)}
        </div></div>
        <button className='testimonials__arrow' type='button' disabled={!movable} onClick={() => step(1)} aria-label='Next testimonial' aria-controls='testimonials-track'><svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'><path d='m9 18 6-6-6-6' /></svg></button>
      </div>
      <div className='testimonials__controls'>
        <p className='testimonials__counter'>Showing {visibleCount} of {items.length} · Starting at {start + 1}</p>
        {movable && !reduced && <button type='button' data-review-rotation className='testimonials__pause' onClick={() => setPaused((value) => !value)}>{paused ? 'Play slideshow' : 'Pause slideshow'}</button>}
      </div>
    </div>}
  </div></section>;
};
export default Testimonials;
