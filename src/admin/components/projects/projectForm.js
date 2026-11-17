export const newProject = () => ({ title: '', summary: '', serviceId: null, propertyType: '',
  property: '', duration: '', material: '', finish: '', work: [], photos: [], coverPhotoId: null,
  status: 'draft', showOnHome: true, isDemo: true });
export const toProjectForm = (project) => ({ ...newProject(), ...project,
  photos: project.photos.map((photo) => ({ ...photo, mediaId: photo.mediaId || photo.id, alt: photo.altText ?? '' })),
});
export const projectPayload = (values) => ({
  ...Object.fromEntries(['title', 'summary', 'property', 'duration', 'material', 'finish'].map((key) => [key, values[key].trim()])),
  serviceId: values.serviceId || null, propertyType: values.propertyType, status: values.status,
  showOnHome: values.showOnHome, isDemo: values.isDemo,
  work: values.work.map((item) => item.trim()).filter(Boolean),
  coverPhotoId: values.coverPhotoId || null,
  photos: values.photos.map((photo) => ({ mediaId: photo.mediaId, caption: photo.caption.trim(), alt: photo.alt.trim() })),
  ...(values.id ? { version: values.version } : {}),
});
export const projectFailure = (error) => error.status === 401
  ? 'Your session expired. Sign in again before saving.' : error.message;
export function projectFormError(values) {
  if (!values.title.trim()) return 'Project title is required.';
  if (values.title.trim().length > 150 || values.summary.trim().length > 500) return 'Check the title and summary limits.';
  if (values.photos.length > 20 || values.work.length > 5) return 'Use up to 20 photos and 5 work items.';
  if (values.photos.some((photo) => photo.unavailable)) return 'Remove unavailable images or choose replacements before saving.';
  if (values.coverPhotoId && !values.photos.some((photo) => photo.mediaId === values.coverPhotoId)) return 'Choose a cover from the project photos.';
  if (values.status === 'published' && (!values.summary.trim() || !values.serviceId || !values.propertyType || !values.coverPhotoId || !values.photos.length)) {
    return 'To publish, add a summary, service category, property type, photos and a cover.';
  }
  return '';
}
export const previewProject = (values, services) => {
  const photos = values.photos.filter((photo) => photo.src).map((photo) => ({ ...photo, alt: photo.alt || photo.libraryAlt || '' }));
  return { ...values, photos, categoryLabel: services.find((service) => service.id === values.serviceId)?.title || 'Service category',
    coverPhoto: photos.find((photo) => photo.mediaId === values.coverPhotoId) || photos[0] };
};

export function moveProjectItem(items, id, to) {
  const from = items.findIndex((item) => item.id === id);
  if (from < 0 || to < 0 || to >= items.length || from === to) return items;
  const next = [...items]; const [item] = next.splice(from, 1); next.splice(to, 0, item); return next;
}
