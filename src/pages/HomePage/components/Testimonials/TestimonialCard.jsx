import { useState } from 'react';
import './Testimonials.sass';
import './TestimonialsContent.sass';

export default function TestimonialCard({ testimonial }) {
  const [failedUrl, setFailedUrl] = useState('');
  const { name, location, review, avatar, isDemo } = testimonial;
  const rating = Math.max(1, Math.min(5, Number(testimonial.rating) || 1));
  const initials = name.trim().split(/\s+/).slice(0, 2).map((word) => Array.from(word)[0] || '').join('').toUpperCase();
  return <article className='testimonials__card'>
    <div className='testimonials__card-header'>
      {avatar && failedUrl !== avatar
        ? <img className='testimonials__avatar' src={avatar} alt='' loading='lazy' width='52' height='52' onError={() => setFailedUrl(avatar)} />
        : <span className='testimonials__avatar testimonials__initials' aria-hidden='true'>{initials || '?'}</span>}
      <div className='testimonials__author'><h3 className='testimonials__author-name'>{name}</h3>{location && <p className='testimonials__author-location'>{location}</p>}</div>
      <div className='testimonials__rating' role='img' aria-label={`${rating} out of 5 stars`}>
        {Array.from({ length: 5 }, (_, index) => <span aria-hidden='true' key={index} className={index < rating ? '' : 'testimonials__empty-star'}>{index < rating ? '★' : '☆'}</span>)}
      </div>
    </div>
    {isDemo && <p className='testimonials__demo'>Demo review · Illustrative content</p>}
    <p className='testimonials__review'>{review}</p>
  </article>;
}
