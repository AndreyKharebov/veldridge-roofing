import { useEffect, useState } from 'react';

import { testimonials } from './testimonials';

import './Testimonials.sass';

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (testimonials.length <= 1) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const intervalId = window.setInterval(() => {
      if (!document.hidden) {
        setActiveIndex((current) => (current + 1) % testimonials.length);
      }
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, []);

  const showPrevious = () => {
    setActiveIndex(
      (current) => (current - 1 + testimonials.length) % testimonials.length,
    );
  };

  const showNext = () => {
    setActiveIndex((current) => (current + 1) % testimonials.length);
  };

  const orderedTestimonials = testimonials.map(
    (_, index) => testimonials[(activeIndex + index) % testimonials.length],
  );

  return (
    <section className='testimonials'>
      <div className='container'>
        <div className='testimonials__header'>
          <h2 className='testimonials__title'>
            See What Our <span>Clients</span> Say
          </h2>

          <p className='testimonials__description'>
            Discover what homeowners have to say about their experience with our
            roofing services.
          </p>
        </div>

        <div className='testimonials__carousel'>
          <button
            className='testimonials__arrow'
            type='button'
            onClick={showPrevious}
            aria-label='Previous testimonial'
            aria-controls='testimonials-track'
          >
            <svg
              width='20'
              height='20'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              aria-hidden='true'
            >
              <path d='m15 18-6-6 6-6' />
            </svg>
          </button>

          <div className='testimonials__viewport'>
            <div
              className='testimonials__track'
              id='testimonials-track'
              key={activeIndex}
              aria-live='off'
            >
              {orderedTestimonials.map((testimonial) => (
                <article className='testimonials__card' key={testimonial.id}>
                  <div className='testimonials__card-header'>
                    <img
                      className='testimonials__avatar'
                      src={testimonial.avatar}
                      alt=''
                      loading='lazy'
                    />

                    <div className='testimonials__author'>
                      <h3 className='testimonials__author-name'>
                        {testimonial.name}
                      </h3>

                      <p className='testimonials__author-location'>
                        {testimonial.location}
                      </p>
                    </div>

                    <div
                      className='testimonials__rating'
                      aria-label={`${testimonial.rating} out of 5 stars`}
                    >
                      {Array.from(
                        { length: testimonial.rating },
                        (_, index) => (
                          <span aria-hidden='true' key={index}>
                            ★
                          </span>
                        ),
                      )}
                    </div>
                  </div>

                  <p className='testimonials__review'>{testimonial.review}</p>
                </article>
              ))}
            </div>
          </div>

          <button
            className='testimonials__arrow'
            type='button'
            onClick={showNext}
            aria-label='Next testimonial'
            aria-controls='testimonials-track'
          >
            <svg
              width='20'
              height='20'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              aria-hidden='true'
            >
              <path d='m9 18 6-6-6-6' />
            </svg>
          </button>
        </div>

        <p className='testimonials__counter' aria-hidden='true'>
          {activeIndex + 1} / {testimonials.length}
        </p>
      </div>
    </section>
  );
};

export default Testimonials;
