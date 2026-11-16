// Static form options and file-selection limits, not content records.
export const serviceOptions = [{ id:'not-sure', label:'Not sure yet' }];
export const photoRules = {
  maxCount: 5,
  maxBytes: 10 * 1024 * 1024,
  accept: '.jpg,.jpeg,.png,.webp',
  mimeTypes: ['image/jpeg','image/png','image/webp'],
};
