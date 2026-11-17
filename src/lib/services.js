import { apiRequest } from './http.js';

export const SERVICES_UPDATED = 'veldridge:services-updated';
export const SERVICES_CHANNEL = 'veldridge-services';
const base = '/api/admin/services';
function notifyServices() {
  window.dispatchEvent(new Event(SERVICES_UPDATED));
  try {
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel(SERVICES_CHANNEL);
      channel.postMessage('updated');
      channel.close();
    }
  } catch { /* Focus refresh is the fallback. */ }
}
async function mutate(path, method, data) {
  const response = await apiRequest(path, {
    method,
    ...(data === undefined ? {} : {
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    }),
  });
  notifyServices();
  return response;
}
export const servicesApi = {
  getPublic(options = {}) { return apiRequest('/api/services', options); },
  getAll(page = 1, status = 'all', options = {}) {
    return apiRequest(`${base}?${new URLSearchParams({ page: String(page), status })}`, options);
  },
  get(id, options = {}) { return apiRequest(`${base}/${encodeURIComponent(id)}`, options); },
  create(data) { return mutate(base, 'POST', data); },
  update(id, data) { return mutate(`${base}/${encodeURIComponent(id)}`, 'PATCH', data); },
  remove(id) { return mutate(`${base}/${encodeURIComponent(id)}`, 'DELETE'); },
};
