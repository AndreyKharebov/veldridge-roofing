import { createSeed } from '../data/seed.js';
import { readStore, updateStore, replaceWorkspace, addMediaBatch, prepareInquiryForStorage } from './database.js';
import { hydrateContent, newId, validateImage, releaseMediaUrls } from './media.js';
import { normalizeRecord, normalizeSettings, ValidationError } from './validation.js';
import { requireAdmin } from './auth.js';
import { validateInquiry, normalizeInquiry } from '../pages/ContactPage/data/inquiry.js';

export const mockConfig = { latencyMs: 180, failNextWrite: false };
const eventName = 'veldridge-workspace-change';
const channel = typeof BroadcastChannel === 'function' ? new BroadcastChannel(eventName) : null;
channel?.addEventListener('message', () => window.dispatchEvent(new Event(eventName)));
function changed() { window.dispatchEvent(new Event(eventName)); channel?.postMessage('changed'); }
export function subscribeWorkspace(listener) {
  window.addEventListener(eventName,listener);
  return () => window.removeEventListener(eventName,listener);
}
async function latency(write = false) {
  await new Promise((resolve) => setTimeout(resolve,mockConfig.latencyMs));
  if (write && mockConfig.failNextWrite) { mockConfig.failNextWrite = false; throw new Error('Simulated save failure. Your edits are still here; please retry.'); }
}
const conflict = () => { throw new Error('This record changed in another tab. Copy your edits and reload before saving again.'); };
export const workspaceApi = {
  async getContent() {
    await latency();
    const [content,media] = await Promise.all([readStore('content','workspace'),readStore('media')]);
    return hydrateContent(content,media);
  },
  async saveRecord(kind,input) {
    requireAdmin(); await latency(true);
    const media = await readStore('media');
    const id = input.id || newId(kind.slice(0,-1));
    const updated = await updateStore('content','workspace',(content) => {
      const previous = content[kind]?.find((item) => item.id === id);
      if (previous && previous.revision !== input.revision) conflict();
      if (input.id && !previous) conflict();
      const record = normalizeRecord(kind,input,content,new Set(media.map((item) => item.id)));
      const next = { ...record, id, revision: (previous?.revision || 0)+1, updatedAt: new Date().toISOString() };
      return { ...content, [kind]: previous ? content[kind].map((item) => item.id === id ? next : item) : [...content[kind],next] };
    });
    changed();
    return updated[kind].find((item) => item.id === id);
  },
  async deleteCategory(id,revision) {
    requireAdmin(); await latency(true);
    await updateStore('content','workspace',(content) => {
      if (content.articles.some((article) => article.categoryId === id)) throw new Error('This category is linked to articles. Reassign them before deleting it.');
      if (content.categories.find((item) => item.id === id)?.revision !== revision) conflict();
      return { ...content, categories: content.categories.filter((item) => item.id !== id) };
    });
    changed();
  },
  async saveSettings(input) {
    requireAdmin(); await latency(true);
    const settings = normalizeSettings(input);
    const result = await updateStore('content','workspace',(content) => {
      if (input.revision !== content.settings.revision) conflict();
      return { ...content, settings: { ...settings, revision:content.settings.revision+1 } };
    });
    changed(); return result.settings;
  },
  async uploadMedia(files) {
    requireAdmin(); await latency(true);
    if (!files.length || files.length > 20) throw new Error('Choose between 1 and 20 images at a time.');
    // Validate the entire batch before adding anything.
    for (const file of files) await validateImage(file);
    const rows = files.map((file) => ({ id: newId('media'), name:file.name || 'image', alt:'', blob:file, createdAt:new Date().toISOString() }));
    // Commit the whole batch atomically, including quota-error rollback.
    await addMediaBatch(rows);
    changed(); return rows.map(({ id }) => id);
  },
  async getInquiries() {
    requireAdmin(); await latency();
    return (await readStore('inquiries')).sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  },
  async createInquiry(values,photos,source) {
    await latency(true);
    const content = await readStore('content','workspace');
    const options = [{id:'not-sure',label:'Not sure yet'},...content.services.filter((s) => s.status === 'active').map((s) => ({id:s.id,label:s.title}))];
    const errors = validateInquiry(values,options);
    if (Object.keys(errors).length) throw new ValidationError(errors);
    if (photos.length > 5) throw new Error('Choose up to five photos.');
    for (const file of photos) await validateImage(file);
    const record = { ...normalizeInquiry(values), id:newId('INQ'), serviceLabel:options.find((s) => s.id === values.service).label,
      source, photos: photos.map((file) => ({ id:newId('attachment'), name:file.name, blob:file })),
      status:'new', notes:[], createdAt:new Date().toISOString(), revision:1, isDemo:true };
    const storedRecord = await prepareInquiryForStorage(record);
    await updateStore('inquiries',record.id,() => storedRecord);
    changed(); return { id:record.id };
  },
  async updateInquiry(id,{ status, note, revision }) {
    requireAdmin(); await latency(true);
    if (!['new','in-progress','closed','spam'].includes(status)) throw new Error('Choose a valid inquiry status.');
    const result = await updateStore('inquiries',id,(previous) => {
      if (!previous || previous.revision !== revision) conflict();
      return { ...previous, status, revision:previous.revision+1, notes:note?.trim() ? [...previous.notes, { id:newId('note'), body:note.trim().slice(0,4000), createdAt:new Date().toISOString() }] : previous.notes };
    });
    changed(); return result;
  },
  async reset() {
    requireAdmin(); await latency(true);
    const seed = createSeed();
    // Bump revisions so stale open editors cannot overwrite freshly reset content.
    const revision = Date.now();
    for (const list of ['services','articles','projects','categories']) seed.content[list].forEach((row) => { row.revision = revision; });
    seed.content.settings.revision = revision;
    seed.inquiries.forEach((row) => { row.revision = revision; });
    await replaceWorkspace(seed.content,seed.media,seed.inquiries);
    releaseMediaUrls(); changed();
  },
};
export function notifyWorkspaceChanged() { releaseMediaUrls(); changed(); }
