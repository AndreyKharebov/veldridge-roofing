import { mainServices, supportingServices } from '../pages/ServicesPage/servicesData.js';
import { servicesData as homeServices } from '../pages/HomePage/components/Services/servicesData.js';
import { blogArticles } from '../pages/BlogPage/data/blogArticles.js';
import { galleryProjects } from '../pages/GalleryPage/data/galleryProjects.js';
import { contactData } from '../pages/ContactPage/data/contactData.js';

// Stable source keys are persisted, never build-specific Vite asset URLs.
export const bundledAssets = import.meta.glob('../pages/**/assets/**/*.{webp,png,jpg,jpeg,svg}', {
  eager: true, query: '?url', import: 'default',
});
const media = [];
const byUrl = new Map();
function asset(url, alt = '') {
  if (!url) return null;
  if (byUrl.has(url)) return byUrl.get(url);
  const assetKey = Object.keys(bundledAssets).find((key) => bundledAssets[key] === url);
  if (!assetKey) throw new Error('Seed image is not in the bundled asset registry.');
  const id = `seed-media-${media.length + 1}`;
  media.push({ id, assetKey, name: assetKey.split('/').pop(), alt, createdAt: '2026-11-10T12:00:00.000Z' });
  byUrl.set(url, id);
  return id;
}
const categories = ['Roof Care', 'Repairs', 'Roof Replacement', 'Materials', 'Solar'].map((name) => ({
  id: name.toLowerCase().replaceAll(' ', '-'), name, description: '', revision: 1,
}));
const categoryMapping = { replacement: 'roof-replacement', repairs: 'damage-repairs', renovation: 'roof-renovation', commercial: 'commercial-roofing', solar: 'solar-panels' };
const services = [...mainServices, ...supportingServices].map((service, index) => {
  const home = homeServices.find(({ title }) => title === service.title);
  const { image, ...details } = service;
  return {
    ...details, summary: home?.description || service.description,
    imageId: asset(image, service.imageAlt),
    homeImageId: asset(home?.image || image, service.imageAlt),
    iconKey: home?.icon ? Object.keys(bundledAssets).find((key) => bundledAssets[key] === home.icon) : null,
    propertyTypes: service.id === 'commercial-roofing' ? ['Commercial'] : ['Residential', 'Commercial'],
    group: index < mainServices.length ? 'main' : 'supporting',
    showOnHome: Boolean(home), order: index + 1, status: 'active', revision: 1,
  };
});
const articles = blogArticles.map(({ image, ...article }, index) => ({
  ...article, imageId: asset(image, article.imageAlt), status: 'published', revision: 1,
  categoryId: ['roof-care','roof-care','roof-replacement','materials','roof-care','repairs','roof-replacement','materials','solar','roof-care'][index],
  sections: article.sections.map((section, i) => ({ ...section, id: `${article.id}-section-${i + 1}` })),
}));
const projects = galleryProjects.map(({ image: _image, category: _category, categoryLabel: _label, photos, ...project }, index) => ({ // eslint-disable-line no-unused-vars
  ...project, serviceId: categoryMapping[_category], propertyType: _category === 'commercial' ? 'Commercial' : 'Residential',
  status: 'published', order: index + 1, revision: 1,
  photos: photos.map(({ src, ...photo }) => ({ ...photo, mediaId: asset(src, photo.alt) })),
  coverPhotoId: photos[0].id,
}));
const settings = {
  ...contactData, city: 'Philadelphia', state: 'PA', zip: '19103',
  timeZone: 'America/New_York', serviceStates: ['PA','NJ','DE'],
  map: { latitude: '39.9526', longitude: '-75.1652', label: 'Veldridge Roofing' },
  socials: { facebook: '', instagram: '', linkedin: '', youtube: '' }, revision: 1,
};
const names = ['Morgan Taylor','Jordan Ellis','Avery Parker','Alex Rivera','Casey Morgan','Jamie Lee','Sam Cooper','Demo spam'];
const inquiries = names.map((name, i) => ({
  id: `INQ-${String(12 - i).padStart(4,'0')}`, name, email: `${name.split(' ')[0].toLowerCase()}@example.com`,
  phone: i === 0 ? '+1 (215) 555-0104' : '', zip: '19103',
  service: ['roof-replacement','damage-repairs','free-inspection','solar-panels','roof-maintenance','roof-renovation','gutters-drainage','not-sure'][i],
  serviceLabel: ['Roof Replacement','Damage Repairs','Free Inspection','Solar Panels','Roof Maintenance','Roof Renovation','Gutters & Drainage','Not sure yet'][i],
  message: i === 0 ? 'We are considering replacing our shingles with a standing-seam roof. I liked the Standing-Seam Roof Upgrade project in your gallery. Could you advise on the materials and arrange an inspection?' : 'This is a sample inquiry for testing the local admin workspace.',
  source: i === 0 ? { type: 'project', id: projects[0].id, title: projects[0].title } : null,
  status: i < 3 ? 'new' : i < 5 ? 'in-progress' : i < 7 ? 'closed' : 'spam',
  createdAt: new Date(Date.UTC(2026,10,12,15,24) - i * 3600000).toISOString(),
  photos: [], notes: [], revision: 1, isDemo: true,
}));
export function createSeed() {
  return structuredClone({ content: { services, articles, projects, categories, settings }, media, inquiries });
}
