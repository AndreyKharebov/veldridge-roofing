import { apiRequest } from './http.js';

export const SETTINGS_UPDATED = 'veldridge:settings-updated';
export const SETTINGS_CHANNEL = 'veldridge-public-settings';

export const settingsApi = {
  get(options = {}) {
    return apiRequest('/api/settings', { ...options, cache: 'no-store' });
  },

  async update(data) {
    const response = await apiRequest('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    // Notify mounted public views. Other tabs re-fetch authoritative API data;
    // no records, credentials or customer details are sent through the channel.
    window.dispatchEvent(new Event(SETTINGS_UPDATED));
    try {
      if ('BroadcastChannel' in window) {
        const channel = new BroadcastChannel(SETTINGS_CHANNEL);
        channel.postMessage('updated');
        channel.close();
      }
    } catch {
      // Browsers that restrict channels still refresh on window focus.
    }
    return response;
  },
};
