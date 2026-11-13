import { bundledAssets } from '../data/seed.js';
export const newId = (prefix = 'item') => `${prefix}-${globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`}`;
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const urls = new Map();
export function mediaUrl(item) {
  if (!item) return '';
  if (item.assetKey) return bundledAssets[item.assetKey] || '';
  if (!item.blob) return '';
  const cached = urls.get(item.id);
  if (cached && cached.updatedAt === item.createdAt) return cached.url;
  if (cached) URL.revokeObjectURL(cached.url);
  const url = URL.createObjectURL(item.blob);
  urls.set(item.id, { url, updatedAt: item.createdAt });
  return url;
}
export function releaseMediaUrls() {
  urls.forEach(({ url }) => URL.revokeObjectURL(url));
  urls.clear();
}
export async function validateImage(file) {
  if (!(file instanceof Blob) || !file.size || file.size > MAX_IMAGE_BYTES) throw new Error('Each image must be non-empty and no larger than 10 MB.');
  if (!['image/jpeg','image/png','image/webp'].includes(file.type)) throw new Error('Choose JPG, PNG or WebP images.');
  const bytes = new Uint8Array(await file.slice(0,12).arrayBuffer());
  const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const png = [137,80,78,71,13,10,26,10].every((v,i) => bytes[i] === v);
  const webp = String.fromCharCode(...bytes.slice(0,4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8,12)) === 'WEBP';
  if (!({ 'image/jpeg': jpeg, 'image/png': png, 'image/webp': webp })[file.type]) throw new Error('The image content does not match its file type.');
  // Decode before persistence; renamed text files and broken images are rejected.
  const url = URL.createObjectURL(file);
  try {
    await new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => image.naturalWidth * image.naturalHeight <= 60000000 ? resolve() : reject(new Error('Choose an image smaller than 60 megapixels.'));
      image.onerror = () => reject(new Error('This image could not be opened. Choose a different file.'));
      image.src = url;
    });
  } finally { URL.revokeObjectURL(url); }
}
export function hydrateContent(content, media) {
  const byId = new Map(media.map((item) => [item.id, item]));
  const imageFor = (id) => mediaUrl(byId.get(id));
  const services = content.services.map((service) => ({
    ...service, image: imageFor(service.imageId), homeImage: imageFor(service.homeImageId || service.imageId),
    icon: service.iconKey ? bundledAssets[service.iconKey] : undefined,
    number: String(service.order).padStart(2,'0'),
  })).sort((a,b) => a.order - b.order || a.title.localeCompare(b.title));
  const articles = content.articles.map((article) => ({ ...article, image: imageFor(article.imageId) }))
    .sort((a,b) => b.publishedAt.localeCompare(a.publishedAt) || a.id.localeCompare(b.id));
  const projects = content.projects.map((project) => {
    const photos = project.photos.map((photo) => ({ ...photo, src: imageFor(photo.mediaId) }));
    const cover = photos.find(({ id }) => id === project.coverPhotoId) || photos[0];
    return { ...project, photos, coverPhoto:cover, image: cover?.src || '', imageAlt: cover?.alt || '', category: project.serviceId,
      categoryLabel: services.find(({ id }) => id === project.serviceId)?.title || 'Roofing project',
    };
  }).sort((a,b) => a.order - b.order);
  return { ...content, services, articles, projects,
    media: media.map(({ blob: _blob, ...item }) => ({ ...item, src: imageFor(item.id) })), // eslint-disable-line no-unused-vars
  };
}
