export const statusOptions = [['new', 'New'], ['in-progress', 'In progress'], ['closed', 'Closed'], ['spam', 'Spam']];
export const formatInquiryDate = (value) => new Date(value).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
export const inquiryFailure = (error) => error.status === 401
  ? 'Your session expired. Sign in again. Unsaved changes have not been submitted.' : error.message;
