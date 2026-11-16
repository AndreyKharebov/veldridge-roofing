import { apiRequest } from './http.js';

export const authApi = {
  login(username, password) {
    return apiRequest('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username.trim(),
        password,
      }),
    });
  },

  me() {
    return apiRequest('/api/auth/me');
  },

  logout() {
    return apiRequest('/api/auth/logout', {
      method: 'POST',
    });
  },
};
