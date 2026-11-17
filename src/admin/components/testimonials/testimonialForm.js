export const freshTestimonial = () => ({
  name: '', location: '', review: '', rating: 5, status: 'draft', isDemo: true,
  avatarId: null, media: null,
});
export const toTestimonialForm = (record) => ({ ...freshTestimonial(), ...record });
export const testimonialPayload = (values) => ({
  name: values.name.trim(), location: values.location.trim(), review: values.review.trim(),
  rating: Number(values.rating), status: values.status, isDemo: values.isDemo, avatarId: values.avatarId || null,
});
export const testimonialFingerprint = (values) => JSON.stringify(testimonialPayload(values));
export function validateTestimonialForm(values) {
  const data = testimonialPayload(values);
  if (!data.name) throw new Error('Author name is required.');
  if (data.name.length > 100 || data.location.length > 100 || data.review.length > 600) throw new Error('Review fields exceed the displayed character limits.');
  if (!Number.isInteger(data.rating) || data.rating < 1 || data.rating > 5) throw new Error('Choose a rating from 1 to 5.');
  if (data.status === 'published' && !data.review) throw new Error('Add review text before publishing.');
  return data;
}
