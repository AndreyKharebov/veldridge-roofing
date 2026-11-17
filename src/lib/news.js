import { apiRequest } from './http.js';

export const NEWS_UPDATED = 'veldridge:news-updated';
export const NEWS_CHANNEL = 'veldridge-news';
const base = '/api/admin/news';
function notifyNews() {
  window.dispatchEvent(new Event(NEWS_UPDATED));
  try {
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel(NEWS_CHANNEL);
      channel.postMessage('updated');
      channel.close();
    }
  } catch { /* Focus/visibility refresh remains available. */ }
}
async function mutate(path, method, data) {
  const result = await apiRequest(path, {
    method,
    ...(data === undefined ? {} : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
  });
  notifyNews();
  return result;
}
export const newsApi = {
  create: (data) => mutate(base, 'POST', data),
  update: (id, data) => mutate(`${base}/${encodeURIComponent(id)}`, 'PATCH', data),
  remove: (id) => mutate(`${base}/${encodeURIComponent(id)}`, 'DELETE'),
  createCategory: (data) => mutate(`${base}/categories`, 'POST', data),
  updateCategory: (id, data) => mutate(`${base}/categories/${encodeURIComponent(id)}`, 'PATCH', data),
  removeCategory: (id) => mutate(`${base}/categories/${encodeURIComponent(id)}`, 'DELETE'),
};
