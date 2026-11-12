import { photoRules, serviceOptions } from './contactData.js';

const text = (value, max = 240) => typeof value === 'string' ? value.trim().slice(0, max) : '';

export const getInquiryContext = (state) => {
  if (!state || typeof state !== 'object') return null;
  const projectTitle = text(state.projectTitle);
  const articleTitle = text(state.articleTitle);
  if (projectTitle) return { type: 'project', id: text(state.projectId, 120), title: projectTitle };
  if (articleTitle) return { type: 'article', id: text(state.articleId, 120), title: articleTitle };
  return null;
};

export const createInitialInquiry = (context) => ({
  name: '', zip: '', phone: '', email: '', service: 'not-sure',
  message: context?.type === 'project'
    ? `I’m interested in a project like “${context.title}”. Can you advise on the next steps for my home?`
    : context?.type === 'article'
      ? `I read “${context.title}” and would like to discuss my roof.`
      : '',
});

export const normalizeInquiry = (values) => Object.fromEntries(
  Object.entries(values).map(([key, value]) => [key, typeof value === 'string' ? value.trim() : '']),
);

// Syntax checks only: no claim that a phone number/email is reachable.
export const validateInquiry = (values) => {
  const data = normalizeInquiry(values);
  const errors = {};
  if (!data.name) errors.name = 'Enter your name.';
  else if (data.name.length > 100) errors.name = 'Use no more than 100 characters.';
  if (data.zip && !/^\d{5}(?:-\d{4})?$/.test(data.zip)) errors.zip = 'Enter a 5-digit ZIP code, or ZIP+4 (e.g. 19103-1234).';
  if (!data.phone && !data.email) {
    errors.phone = 'Add a phone number or email. You don’t need to fill in both.';
    errors.email = errors.phone;
  } else {
    const digits = data.phone.replace(/\D/g, '');
    if (data.phone && (!/^\+?[\d\s().-]+$/.test(data.phone) || digits.length < 10 || digits.length > 15)) {
      errors.phone = 'Enter a phone number with 10–15 digits, or leave it blank and use email.';
    }
    if (data.email && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || data.email.length > 254)) {
      errors.email = 'Enter a valid email address, or leave it blank and use phone.';
    }
  }
  if (!serviceOptions.some(({ id }) => id === data.service)) errors.service = 'Choose a service from the list.';
  if (data.message.length > 4000) errors.message = 'Use no more than 4,000 characters.';
  return errors;
};

export const photoKey = (file) => JSON.stringify([file.name, file.size, file.type, file.lastModified]);

export const selectPhotos = (current, incoming) => {
  const additions = [];
  const seen = new Set(current.map(photoKey));
  for (const file of Array.from(incoming)) {
    const key = photoKey(file);
    if (seen.has(key)) continue;
    if (!/\.(jpe?g|png|webp)$/i.test(file.name) || (file.type && !photoRules.mimeTypes.includes(file.type))) {
      return { files: current, error: 'Choose JPG, PNG or WebP images. No new files were added.' };
    }
    if (!file.size || file.size > photoRules.maxBytes) {
      return { files: current, error: 'Each image must be non-empty and no larger than 10 MB. No new files were added.' };
    }
    seen.add(key);
    additions.push(file);
  }
  if (current.length + additions.length > photoRules.maxCount) {
    return { files: current, error: 'Choose up to 5 images in total. No new files were added.' };
  }
  return { files: [...current, ...additions], error: '' };
};

export const formatFileSize = (bytes) => bytes >= 1024 * 1024
  ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  : `${Math.max(1, Math.round(bytes / 1024))} KB`;

export const buildDemoPayload = (values, photos, context) => ({
  mode: 'demo',
  ...normalizeInquiry(values),
  serviceLabel: serviceOptions.find(({ id }) => id === values.service)?.label ?? 'Not sure yet',
  source: context,
  // Log metadata, never image bytes, blob URLs, or a fake server response.
  photos: photos.map(({ name, size, type, lastModified }) => ({ name, size, type, lastModified })),
});
