import { apiRequest } from './http.js';

export const mediaApi = {
  getAll(page = 1) {
    return apiRequest(`/api/media?page=${page}`);
  },

  upload(file, alt = '') {
    const formData = new FormData();

    formData.append('file', file);
    formData.append('alt', alt);

    return apiRequest('/api/media', {
      method: 'POST',
      body: formData,
    });
  },

  update(id, alt) {
    return apiRequest(`/api/media/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ alt }),
    });
  },

  remove(id) {
    return apiRequest(`/api/media/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },
};
