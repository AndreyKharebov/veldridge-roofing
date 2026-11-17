import { normalizeSocialUrl } from '../../../utils/socialUrl.js';

export const articleLimits = { title: 150, summary: 300, imageAlt: 300, sections: 20, heading: 200, body: 5000, content: 16000 };
export const freshArticle = () => ({ title: '', summary: '', imageId: null, media: null, imageAlt: '',
  categoryId: '', status: 'draft', publishedAt: '', sections: [{ id: 'section-initial', heading: '', body: '' }], source: { label: '', url: '' } });
export const toArticleForm = (article) => ({ ...freshArticle(), ...article,
  imageAlt: article.imageAltText ?? '', categoryId: article.categoryId ?? '',
  sections: (article.sections ?? []).map(({ id, heading, body }, index) => ({ id: id || `section-${index + 1}`, heading, body })),
  source: { label: article.source?.label ?? '', url: article.source?.url ?? '' },
});
export function articlePayload(values) {
  return {
    title: values.title.trim(), summary: values.summary.trim(), imageAlt: values.imageAlt.trim(),
    imageId: values.imageId || null, categoryId: values.categoryId || null,
    status: values.status, publishedAt: values.publishedAt,
    sections: values.sections.map(({ heading, body }) => ({ heading: heading.trim(), body: body.trim() })),
    source: { label: values.source.label.trim(), url: normalizeSocialUrl(values.source.url) },
  };
}
export function articleFingerprint(values) {
  // Keep invalid/incomplete source input editable; validation happens on Save.
  try { return JSON.stringify(articlePayload(values)); }
  catch { return JSON.stringify({ ...values, media: undefined, version: undefined }); }
}
export function validateArticleForm(values) {
  const data = articlePayload(values);
  if (!data.title) throw new Error('Article title is required.');
  for (const key of ['title', 'summary', 'imageAlt']) {
    if (data[key].length > articleLimits[key]) throw new Error(`${key} exceeds ${articleLimits[key]} characters.`);
  }
  if (data.sections.length > articleLimits.sections) throw new Error('Use no more than 20 sections.');
  if (data.sections.some((section) => section.heading.length > 200 || section.body.length > 5000)) {
    throw new Error('Each section allows 200 heading characters and 5000 body characters.');
  }
  const total = data.sections.reduce((sum, section) => sum + section.heading.length + section.body.length, 0);
  if (total > articleLimits.content) throw new Error('All sections together must not exceed 16000 characters.');
  if (data.source.label && !data.source.url) throw new Error('Add a source URL or clear its label.');
  if (data.status === 'published') {
    if (!data.summary || !data.imageId) throw new Error('Publishing requires an introduction and a cover image.');
    if (!data.sections.length || data.sections.some((section) => !section.heading || !section.body)) {
      throw new Error('Publishing requires at least one complete section. Fill or remove empty sections.');
    }
    if (data.publishedAt > new Date().toISOString().slice(0, 10)) throw new Error('Future publication is not scheduled. Keep this article as a draft.');
  }
  return data;
}
