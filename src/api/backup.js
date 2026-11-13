import { bundledAssets } from '../data/seed.js';
import { readStore, replaceWorkspace } from './database.js';
import { normalizeRecord, normalizeSettings } from './validation.js';
import { validateImage } from './media.js';
import { notifyWorkspaceChanged } from './workspace.js';
import { requireAdmin } from './auth.js';

const asDataUrl = (blob) => new Promise((resolve,reject) => {
  const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(reader.error); reader.readAsDataURL(blob);
});
export async function exportBackup() {
  requireAdmin();
  const [content,images] = await Promise.all([readStore('content','workspace'),readStore('media')]);
  const media = await Promise.all(images.map(async ({ blob, ...row }) => ({ ...row, ...(blob ? { dataUrl:await asDataUrl(blob) } : {}) })));
  return new Blob([JSON.stringify({ format:'veldridge-content', version:1, exportedAt:new Date().toISOString(), content, media })],{ type:'application/json' });
}
export function downloadBackup(blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a'); link.href = url; link.download = `veldridge-content-${new Date().toISOString().slice(0,10)}.json`;
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url),1000);
}
const assert = (condition,message) => { if (!condition) throw new Error(message); };
export async function parseBackup(file) {
  requireAdmin();
  assert(file.size > 0 && file.size <= 100 * 1024 * 1024,'Choose a non-empty JSON backup no larger than 100 MB.');
  let data;
  try { data = JSON.parse(await file.text()); } catch { throw new Error('The file is not a valid JSON backup.'); }
  assert(data?.format === 'veldridge-content' && data.version === 1,'Unsupported backup format or version.');
  const media = [];
  const mediaIds = new Set();
  assert(Array.isArray(data.media) && data.media.length <= 500,'Invalid media collection.');
  for (const row of data.media) {
    assert(typeof row.id === 'string' && row.id.length < 200 && !mediaIds.has(row.id),'Media IDs must be unique.');
    mediaIds.add(row.id);
    const item = { id:row.id, name:String(row.name || 'image').slice(0,200), alt:String(row.alt || '').slice(0,250), createdAt:new Date().toISOString() };
    if (row.assetKey) {
      assert(Boolean(bundledAssets[row.assetKey]),'This backup refers to a bundled image not available in this website version.');
      item.assetKey = row.assetKey;
    } else {
      const match = typeof row.dataUrl === 'string' && row.dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
      assert(match && match[2].length <= 14 * 1024 * 1024,'An image in this backup is invalid or too large.');
      const bytes = Uint8Array.from(atob(match[2]),(char) => char.charCodeAt(0));
      item.blob = new Blob([bytes],{type:match[1]});
      await validateImage(item.blob);
    }
    media.push(item);
  }
  assert(data.content && typeof data.content === 'object','Backup has no content.');
  const content = { services:[], categories:[], articles:[], projects:[], settings:{} };
  const revision = Date.now();
  for (const kind of ['categories','services','articles','projects']) {
    const rows = data.content[kind];
    assert(Array.isArray(rows) && rows.length <= 1000,`Invalid ${kind} collection.`);
    const ids = new Set();
    for (const row of rows) {
      assert(typeof row.id === 'string' && row.id.length < 200 && !ids.has(row.id),`Invalid or duplicate ${kind} ID.`);
      ids.add(row.id);
      const normalized = normalizeRecord(kind,row,content,mediaIds);
      if (kind === 'services' && normalized.iconKey) assert(Boolean(bundledAssets[normalized.iconKey]),'Unknown service icon.');
      content[kind].push({ ...normalized, id:row.id, revision, updatedAt:new Date().toISOString() });
    }
  }
  content.settings = { ...normalizeSettings(data.content.settings), revision };
  return { content, media };
}
export async function importBackup(validated) {
  requireAdmin();
  // Content backups deliberately exclude customer messages and attachments.
  // Import leaves the local inbox intact, including snapshots of service names.
  await replaceWorkspace(validated.content,validated.media);
  notifyWorkspaceChanged();
}
