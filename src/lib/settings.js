import { apiRequest } from './http.js';

export const settingsApi = {
  get() {
    return apiRequest('/api/settings');
  },

  update(data) {
    return apiRequest('/api/settings', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  },
};
