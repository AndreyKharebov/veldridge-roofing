// This fallback is valid even before the first service is created.
// Live service choices come from the shared content API.
export const serviceOptions = [{ id: 'not-sure', label: 'Not sure yet' }];

export const photoRules = {
  maxCount: 5,
  maxBytes: 10 * 1024 * 1024,
  accept: '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp',
  mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
};
