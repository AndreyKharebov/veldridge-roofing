import { apiRequest } from './http.js';

export const mediaApi = {
  getAll(page = 1, options = {}) {
    return apiRequest(`/api/media?page=${page}`, options);
  },

  upload(file, alt = '') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('alt', alt);
    return apiRequest('/api/media', { method: 'POST', body: formData });
  },

  update(id, changes) {
    // Keep the original alt-only call compatible with existing consumers.
    const data = typeof changes === 'string' ? { alt: changes } : changes;
    return apiRequest(`/api/media/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  },

  remove(id) {
    return apiRequest(`/api/media/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },
};
