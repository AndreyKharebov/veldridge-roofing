export class ValidationError extends Error {
  constructor(fields) {
    super('Please check the highlighted fields. Your changes have not been saved.');
    this.name = 'ValidationError';
    this.fields = fields;
  }
}
export const safeUrl = (value) => {
  if (!value) return '';
  try {
    const url = new URL(value);
    return ['https:','http:'].includes(url.protocol) && !url.username && !url.password ? url.href : '';
  } catch { return ''; }
};
const trim = (value, max = 4000) => typeof value === 'string' ? value.trim().slice(0,max) : '';
const validDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T12:00:00Z`)) && new Date(`${value}T12:00:00Z`).toISOString().slice(0,10) === value;
export function normalizeRecord(kind, input, content, mediaIds) {
  const fields = {};
  const required = (name, value, message = 'This field is required.') => { if (!value) fields[name] = message; };
  const image = (key) => {
    const id = trim(input[key],200);
    if (id && !mediaIds.has(id)) fields[key] = 'Select an available image.';
    return id || null;
  };
  const order = Number(input.order ?? 1);
  if (['services','projects'].includes(kind) && (!Number.isInteger(order) || order < 1 || order > 9999)) fields.order = 'Enter a whole number from 1 to 9999.';
  let record;
  if (kind === 'categories') {
    const name = trim(input.name,80);
    required('name',name);
    if (content.categories.some((item) => item.id !== input.id && item.name.toLowerCase() === name.toLowerCase())) fields.name = 'A category with this name already exists.';
    record = { name, description: trim(input.description,500) };
  } else if (kind === 'services') {
    const title = trim(input.title,100);
    const summary = trim(input.summary,500);
    required('title',title); required('summary',summary);
    if (content.services.some((item) => item.id !== input.id && item.title.toLowerCase() === title.toLowerCase())) fields.title = 'A service with this name already exists.';
    const propertyTypes = [...new Set((Array.isArray(input.propertyTypes) ? input.propertyTypes : []).filter((v) => ['Residential','Commercial'].includes(v)))];
    required('propertyTypes',propertyTypes.length,'Select Residential, Commercial, or both.');
    const imageId = image('imageId');
    required('imageId', imageId, 'Choose a service image.');
    const imageAlt = trim(input.imageAlt,250);
    required('imageAlt',imageAlt,'Describe the service image.');
    record = { title, summary, description: trim(input.description), imageId, homeImageId: image('homeImageId') || imageId,
      imageAlt, iconKey: trim(input.iconKey,500) || null, propertyTypes, order, showOnHome: Boolean(input.showOnHome),
      status: input.status === 'archived' ? 'archived' : 'active', group: input.group === 'supporting' ? 'supporting' : 'main',
      points: (Array.isArray(input.points) ? input.points : []).map((v) => trim(v,300)).filter(Boolean).slice(0,20),
      eyebrow: trim(input.eyebrow,100), cta: trim(input.cta,80) || 'Discuss Your Project',
      tone: ['warm','white','muted'].includes(input.tone) ? input.tone : 'white',
    };
  } else if (kind === 'articles') {
    const title = trim(input.title,150); required('title',title);
    const status = ['draft','published','archived'].includes(input.status) ? input.status : 'draft';
    const summary = trim(input.summary,600);
    const imageId = image('imageId');
    const imageAlt = trim(input.imageAlt,250);
    const publishedAt = trim(input.publishedAt,10);
    if (publishedAt && !validDate(publishedAt)) fields.publishedAt = 'Enter a valid publication date.';
    const categoryId = trim(input.categoryId,200) || null;
    if (categoryId && !content.categories.some(({ id }) => id === categoryId)) fields.categoryId = 'Choose an available category.';
    const sections = (Array.isArray(input.sections) ? input.sections : []).slice(0,30).map((section,i) => ({
      id: trim(section.id,200) || `section-${i+1}`, heading: trim(section.heading,200), body: trim(section.body,12000),
    }));
    const source = { label: trim(input.source?.label,150), url: trim(input.source?.url,2000) };
    if (source.url && !safeUrl(source.url)) fields.sourceUrl = 'Use a valid http or https URL.';
    if (source.label && !source.url) fields.sourceUrl = 'Add a source URL or remove the source label.';
    if (source.url && !source.label) fields.sourceLabel = 'Add a label for the source link.';
    if (status === 'published') {
      required('summary',summary); required('imageId',imageId,'Choose an article cover.');
      required('imageAlt',imageAlt); required('publishedAt',publishedAt);
      required('sections', sections.length,'Add at least one section before publishing.');
      sections.forEach((section,i) => {
        required(`section-heading-${i}`,section.heading); required(`section-body-${i}`,section.body);
      });
    }
    record = { title, summary, imageId, imageAlt, publishedAt, categoryId, status, sections, source };
  } else if (kind === 'projects') {
    const title = trim(input.title,150); required('title',title);
    const status = ['draft','published','archived'].includes(input.status) ? input.status : 'draft';
    const serviceId = trim(input.serviceId,200);
    const service = content.services.find(({ id }) => id === serviceId);
    required('serviceId',service,'Choose a service category.');
    const propertyType = trim(input.propertyType,30);
    if (service && !service.propertyTypes.includes(propertyType)) fields.propertyType = 'Choose a property type supported by this service.';
    const photos = (Array.isArray(input.photos) ? input.photos : []).slice(0,20).map((photo) => ({
      id: trim(photo.id,200), mediaId: trim(photo.mediaId,200), alt: trim(photo.alt,250), caption: trim(photo.caption,250),
      ...(photo.crop && Number.isFinite(photo.crop.scale) && photo.crop.scale >= 1 && photo.crop.scale <= 4 && Number.isFinite(photo.crop.left) && Number.isFinite(photo.crop.top)
        ? { crop: { scale: photo.crop.scale, left: photo.crop.left, top: photo.crop.top } } : {}),
    }));
    if (photos.some((photo) => !photo.id || !mediaIds.has(photo.mediaId)) || new Set(photos.map(({ id }) => id)).size !== photos.length) fields.photos = 'Select valid project photos.';
    const coverPhotoId = trim(input.coverPhotoId,200);
    if (photos.length && !photos.some(({ id }) => id === coverPhotoId)) fields.photos = 'Choose one of the project photos as the cover.';
    const summary = trim(input.summary,800);
    if (status === 'published') {
      required('photos',photos.length,'Add at least one photo before publishing.');
      required('summary',summary);
      if (photos.some(({ alt }) => !alt)) fields.photos = 'Add an image description to every project photo.';
    }
    record = { title, dialogTitle: title, summary, serviceId, propertyType, status, order, photos, coverPhotoId,
      property: trim(input.property,150), duration: trim(input.duration,150), material: trim(input.material,150), finish: trim(input.finish,150),
      work: (Array.isArray(input.work) ? input.work : []).map((v) => trim(v,300)).filter(Boolean).slice(0,20), isDemo: Boolean(input.isDemo),
    };
  } else throw new Error('Unknown content collection.');
  if (Object.keys(fields).length) throw new ValidationError(fields);
  return record;
}
export function normalizeSettings(input) {
  const fields = {};
  const result = {
    company: trim(input.company,120), phone: trim(input.phone,40), email: trim(input.email,254),
    street: trim(input.street,200), city: trim(input.city,100), state: trim(input.state,100), zip: trim(input.zip,10),
    hours: trim(input.hours,200), hoursNote: trim(input.hoursNote,200), timeZone: trim(input.timeZone,80),
    serviceStates: (Array.isArray(input.serviceStates) ? input.serviceStates : []).filter((v) => ['PA','NJ','DE'].includes(v)),
    isDemo: true,
  };
  for (const key of ['company','phone','email','street','city','state','zip']) if (!result[key]) fields[key] = 'This field is required.';
  if (result.phone && result.phone.replace(/\D/g,'').length < 10) fields.phone = 'Enter a phone number with at least 10 digits.';
  if (result.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result.email)) fields.email = 'Enter a valid email address.';
  if (result.zip && !/^\d{5}(-\d{4})?$/.test(result.zip)) fields.zip = 'Enter a valid ZIP code.';
  try { new Intl.DateTimeFormat('en-US',{timeZone:result.timeZone}).format(); } catch { fields.timeZone = 'Enter a valid time zone.'; }
  result.locality = `${result.city}, ${result.state} ${result.zip}`;
  result.phoneHref = `tel:${result.phone.replace(/[^\d+]/g,'')}`;
  const names = { PA: 'Pennsylvania', NJ: 'New Jersey', DE: 'Delaware' };
  result.serviceArea = result.serviceStates.map((s) => names[s]).join(' · ');
  result.map = { latitude: trim(input.map?.latitude,30), longitude: trim(input.map?.longitude,30), label: trim(input.map?.label,150) };
  for (const [key,max] of [['latitude',90],['longitude',180]]) {
    const value = result.map[key];
    if (value && (!Number.isFinite(Number(value)) || Math.abs(Number(value)) > max)) fields[key] = `Enter a coordinate between -${max} and ${max}.`;
  }
  result.socials = {};
  for (const key of ['facebook','instagram','linkedin','youtube']) {
    const value = trim(input.socials?.[key],2000);
    if (value && !safeUrl(value)) fields[key] = 'Use a valid http or https URL, or leave blank.';
    result.socials[key] = value;
  }
  if (Object.keys(fields).length) throw new ValidationError(fields);
  return result;
}
