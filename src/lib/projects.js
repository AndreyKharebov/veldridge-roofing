import { apiRequest } from './http.js';

export const PROJECTS_UPDATED = 'veldridge:projects-updated';
export const PROJECTS_CHANNEL = 'veldridge-projects';
const base = '/api/admin/projects';
async function mutate(path, method, data) {
  const response = await apiRequest(path, {
    method,
    ...(data === undefined ? {} : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  });
  window.dispatchEvent(new Event(PROJECTS_UPDATED));
  try {
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel(PROJECTS_CHANNEL);
      channel.postMessage('updated');
      channel.close();
    }
  } catch { /* Focus refresh is available without BroadcastChannel. */ }
  return response;
}
export const projectsApi = {
  getPublic(options = {}) { return apiRequest('/api/projects', options); },
  getPublished(id, options = {}) { return apiRequest(`/api/projects/${encodeURIComponent(id)}`, options); },
  getAll(page = 1, status = 'all', options = {}) {
    return apiRequest(`${base}?${new URLSearchParams({ page: String(page), status })}`, options);
  },
  get(id, options = {}) { return apiRequest(`${base}/${encodeURIComponent(id)}`, options); },
  getOrder(options = {}) { return apiRequest(`${base}/order`, options); },
  create(data) { return mutate(base, 'POST', data); },
  update(id, data) { return mutate(`${base}/${encodeURIComponent(id)}`, 'PATCH', data); },
  reorder(data) { return mutate(`${base}/order`, 'PATCH', data); },
  remove(id) { return mutate(`${base}/${encodeURIComponent(id)}`, 'DELETE'); },
};
