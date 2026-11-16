// Development-only adapter. It never touches IndexedDB, localStorage or a backend
// content endpoint. All mutations log structured payloads for implementing Express.
import { createDefaultSettings } from '../data/defaultSettings.js';
import { hydrateContent, newId, validateImage } from './media.js';
import { normalizeRecord, normalizeSettings, ValidationError } from './validation.js';
import { validateInquiry, normalizeInquiry } from '../pages/ContactPage/data/inquiry.js';
import { requireAdmin } from '../auth/session.js';

const EVENT = 'veldridge-dev-content-change';
const blank = () => ({
  services: [], articles: [], projects: [], categories: [],
  settings: createDefaultSettings(),
});
let content = blank();
let media = [];
let inquiries = [];
const changed = () => window.dispatchEvent(new Event(EVENT));
const log = (name, payload) => console.log(`[Veldridge API TODO] ${name}`, payload);
export const subscribeWorkspace = (listener) => {
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
};
const contentView = () => hydrateContent(content, media);
export const workspaceApi = {
  async getContent() { return contentView(); },
  async saveRecord(kind, input) {
    requireAdmin();
    const id = input.id || newId(kind.slice(0,-1));
    const previous = content[kind]?.find((item) => item.id === id);
    const normalized = normalizeRecord(kind, input, content, new Set(media.map((item) => item.id)));
    const result = { ...normalized, id, revision: (previous?.revision || 0) + 1, updatedAt: new Date().toISOString() };
    log(`POST/PATCH ${kind}`, { ...result });
    content = {
      ...content,
      [kind]: previous
        ? content[kind].map((item) => item.id === id ? result : item)
        : [...content[kind], result],
    };
    changed();
    return result;
  },
  async deleteCategory(id) {
    requireAdmin();
    if (content.articles.some((article) => article.categoryId === id)) throw new Error('Reassign linked articles before deleting this category.');
    log('DELETE categories', { id });
    content = { ...content, categories: content.categories.filter((item) => item.id !== id) };
    changed();
  },
  async saveSettings(input) {
    requireAdmin();
    const normalized = normalizeSettings(input);
    const result = { ...normalized, revision:content.settings.revision + 1 };
    log('PATCH settings', result);
    content = { ...content, settings:result };
    changed();
    return result;
  },
  async uploadMedia(files) {
    requireAdmin();
    if (!files.length || files.length > 20) throw new Error('Choose 1 to 20 images.');
    for (const file of files) await validateImage(file);
    const rows = files.map((file) => ({
      id:newId('media'), name:file.name, alt:'', blob:file,
      createdAt:new Date().toISOString(),
    }));
    // Log metadata, never binary image data or object URLs.
    log('POST media (not uploaded)', rows.map((row) => ({
      id:row.id, name:row.name, type:row.blob.type, size:row.blob.size,
    })));
    media = [...media, ...rows];
    changed();
    return rows.map(({id}) => id);
  },
  async getInquiries() { requireAdmin(); return [...inquiries].sort((a,b) => b.createdAt.localeCompare(a.createdAt)); },
  async createInquiry(values, photos, source) {
    const options = [{ id:'not-sure', label:'Not sure yet' },
      ...content.services.filter((item) => item.status === 'active')
        .map(({id,title}) => ({id,label:title}))];
    const errors = validateInquiry(values, options);
    if (Object.keys(errors).length) throw new ValidationError(errors);
    if (photos.length > 5) throw new Error('Choose up to five photos.');
    for (const file of photos) await validateImage(file);
    const record = {
      ...normalizeInquiry(values), id:newId('INQ'),
      serviceLabel:options.find(({id}) => id === values.service)?.label || 'Not sure yet',
      source, photos:photos.map((file) => ({
        id:newId('attachment'), name:file.name, blob:file,
      })),
      status:'new', notes:[], createdAt:new Date().toISOString(), revision:1,
    };
    // Avoid printing personal details or photo bytes to browser logs unintentionally.
    // Use only fictional test data in this development-only form.
    log('POST inquiries (not delivered)', {
      ...record, photos:record.photos.map(({id,name,blob}) => ({id,name,type:blob.type,size:blob.size})),
    });
    inquiries = [record,...inquiries];
    changed();
    return { id:record.id };
  },
  async updateInquiry(id, { status, note, revision }) {
    requireAdmin();
    if (!['new','in-progress','closed','spam'].includes(status)) throw new Error('Invalid inquiry status.');
    const previous = inquiries.find((item) => item.id === id);
    if (!previous || previous.revision !== revision) throw new Error('Temporary inquiry has changed. Refresh the list.');
    const result = {
      ...previous, status, revision:revision+1,
      notes:note?.trim() ? [...previous.notes, {
        id:newId('note'), body:note.trim().slice(0,4000), createdAt:new Date().toISOString(),
      }] : previous.notes,
    };
    log('PATCH inquiries', { id, status, note, revision });
    inquiries = inquiries.map((item) => item.id === id ? result : item);
    changed();
    return result;
  },
};
