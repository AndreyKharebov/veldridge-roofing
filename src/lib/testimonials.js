import { apiRequest } from './http.js';

export const TESTIMONIALS_UPDATED = 'veldridge:testimonials-updated';
export const TESTIMONIALS_CHANNEL = 'veldridge-testimonials';
const base = '/api/admin/testimonials';
async function mutate(path, method, data) {
  const response = await apiRequest(path, {
    method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
  });
  window.dispatchEvent(new Event(TESTIMONIALS_UPDATED));
  try {
    const channel = new BroadcastChannel(TESTIMONIALS_CHANNEL);
    channel.postMessage('updated'); channel.close();
  } catch { /* Public content also refreshes when the window regains focus. */ }
  return response;
}
export const testimonialsApi = {
  get(id, options = {}) { return apiRequest(`${base}/${encodeURIComponent(id)}`, options); },
  create(data) { return mutate(base, 'POST', data); },
  update(id, data) { return mutate(`${base}/${encodeURIComponent(id)}`, 'PATCH', data); },
  remove(id, version) { return mutate(`${base}/${encodeURIComponent(id)}`, 'DELETE', { version }); },
};
