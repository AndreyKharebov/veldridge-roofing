import { apiRequest } from './http.js';
const base = '/api/admin/inquiries';
export const INQUIRIES_UPDATED = 'veldridge:inquiries-updated';
export const INQUIRIES_CHANNEL = 'veldridge-inquiries';
function notify() {
  window.dispatchEvent(new Event(INQUIRIES_UPDATED));
  try {
    const channel = new BroadcastChannel(INQUIRIES_CHANNEL);
    // Never broadcast customer details, notes or attachment URLs.
    channel.postMessage('updated'); channel.close();
  } catch { /* Explicit refresh remains available. */ }
}
const mutate = async (path, method, body) => {
  const response = await apiRequest(path, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  notify(); return response;
};
export const inquiriesApi = {
  async submit(values, photos, context, submissionId) {
    const payload = {
      name: values.name, email: values.email, phone: values.phone, zip: values.zip, message: values.message,
      serviceId: values.service === 'not-sure' ? null : values.service,
      source: context && /^[a-f\d]{24}$/i.test(context.id) && ['service', 'project', 'article'].includes(context.type)
        ? { type: context.type, id: context.id } : null,
      website: values.website ?? '',
    };
    const body = new FormData();
    body.append('payload', JSON.stringify(payload));
    photos.forEach((photo) => body.append('photos', photo));
    const result = await apiRequest('/api/inquiries', { method: 'POST', headers: { 'Idempotency-Key': submissionId }, body });
    notify(); return result;
  },
  list({ page = 1, status = 'all', search = '' } = {}, options = {}) {
    return apiRequest(`${base}?${new URLSearchParams({ page: String(page), status, search })}`, options);
  },
  get(id, options = {}) { return apiRequest(`${base}/${encodeURIComponent(id)}`, options); },
  update(id, changes) { return mutate(`${base}/${encodeURIComponent(id)}`, 'PATCH', changes); },
  remove(id, version) { return mutate(`${base}/${encodeURIComponent(id)}`, 'DELETE', { version }); },
  async attachment(id, fileId, options = {}) {
    const apiUrl = (import.meta.env.VITE_API_URL ?? '').trim().replace(/\/+$/, '');
    if (!apiUrl) throw new Error('VITE_API_URL is not configured');
    const response = await fetch(`${apiUrl}${base}/${encodeURIComponent(id)}/attachments/${encodeURIComponent(fileId)}`, {
      ...options, credentials: 'include', cache: 'no-store',
    });
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw Object.assign(new Error(data?.message || 'Could not load the private photo'), { status: response.status });
    }
    const blob = await response.blob();
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(blob.type)) throw new Error('Unexpected attachment format');
    return blob;
  },
};
