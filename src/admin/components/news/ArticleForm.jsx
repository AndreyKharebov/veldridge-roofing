import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { newsApi } from '../../../lib/news.js';
import { useNewsResource } from '../../../hooks/useNewsResource.js';
import { normalizeSocialUrl } from '../../../utils/socialUrl.js';
import { Button, Field, Notice, PageHeading, Panel } from '../UI.jsx';
import SaveStatus from '../SaveStatus.jsx';
import { DangerZone, SaveBar } from '../Workspace.jsx';
import ServiceImagePicker from '../services/ServiceImagePicker.jsx';
import ArticleDialog from '../../../pages/BlogPage/components/ArticleDialog/ArticleDialog.jsx';
import NewsDeleteDialog from './NewsDeleteDialog.jsx';
import { articleFingerprint, toArticleForm, validateArticleForm } from './articleForm.js';
import '../../pages/Services.sass';

export default function ArticleForm({ initial, created = false }) {
  const navigate = useNavigate();
  const [values, setValues] = useState(initial);
  const [baseline, setBaseline] = useState(() => articleFingerprint(initial));
  const [picker, setPicker] = useState(false);
  const [preview, setPreview] = useState(false);
  const [remove, setRemove] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState(created ? 'Article created successfully.' : '');
  const lock = useRef(false);
  const dirty = articleFingerprint(values) !== baseline;
  const categories = useNewsResource('/api/admin/news/categories');
  const choices = categories.data?.categories ?? [];
  const total = values.sections.reduce((sum, section) => sum + section.heading.length + section.body.length, 0);
  useEffect(() => {
    if (!dirty && !saving) return;
    const warn = (event) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty, saving]);
  const update = (name, value) => { setValues((previous) => ({ ...previous, [name]: value })); setError(''); setMessage(''); };
  const field = (name) => ({ name, value: values[name] ?? '', onChange: (event) => update(name, event.target.value) });
  const updateSection = (index, name, value) => update('sections', values.sections.map((section, at) => at === index ? { ...section, [name]: value } : section));
  const moveSection = (index, offset) => {
    const next = [...values.sections];
    const [section] = next.splice(index, 1); next.splice(index + offset, 0, section); update('sections', next);
  };
  const back = () => { if (!lock.current && (!dirty || window.confirm('Discard your unsaved article changes?'))) navigate('/admin/news'); };
  const submit = async (event) => {
    event.preventDefault();
    if (lock.current || (values.id && !dirty)) return;
    let data;
    try { data = validateArticleForm(values); }
    catch (failure) { setError(failure.message); setMessage(''); return; }
    lock.current = true; setSaving(true); setError(''); setMessage('');
    try {
      const { article } = values.id
        ? await newsApi.update(values.id, { ...data, version: values.version })
        : await newsApi.create(data);
      const next = toArticleForm(article);
      setValues(next); setBaseline(articleFingerprint(next));
      setMessage(values.id ? 'Article saved successfully.' : 'Article created successfully.');
      if (!values.id) navigate(`/admin/news/${article.id}`, { replace: true, state: { createdArticle: article } });
    } catch (failure) { setError(failure.status === 401 ? 'Your session expired. Sign in again before saving.' : failure.message); }
    finally { lock.current = false; setSaving(false); }
  };
  let safeSource = { label: '', url: '' };
  try { safeSource = { label: values.source.label, url: normalizeSocialUrl(values.source.url) }; } catch { /* Incomplete links are not previewed. */ }
  const saveDisabled = saving || (Boolean(values.id) && !dirty);
  const saveLabel = saving ? (values.id ? 'Saving…' : 'Creating…') : (values.id ? 'Save changes' : 'Create article');
  return <div className='news-admin'>
    <PageHeading onBack={back} backDisabled={saving} backLabel='News' title={values.id ? 'Edit article' : 'New article'} description='Write a draft, choose a cover and publish when the article is ready.' />
    <form className='news-admin__form' onSubmit={submit}>
      <fieldset className='admin-editor' disabled={saving}>
        <div className='admin-stack'>
          <Panel title='Article details'>
            <Field label='Title *' {...field('title')} maxLength={150} required hint={`${values.title.length}/150 characters`} />
            <Field label='Introduction / card excerpt' {...field('summary')} multiline rows={3} maxLength={300} hint={`${values.summary.length}/300 · Required for publication`} />
            <Field label='Category' {...field('categoryId')} disabled={categories.loading}>
              <option value=''>Uncategorized</option>
              {values.categoryId && !choices.some((entry) => entry.id === values.categoryId) && <option value={values.categoryId}>Current category — refresh to verify</option>}
              {choices.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}
            </Field>
            <div className='admin-actions'><Button disabled={categories.loading} onClick={categories.reload}>Refresh categories</Button>
              <a className='admin-link' href='/admin/news/categories' target='_blank' rel='noopener noreferrer'>Manage categories ↗</a></div>
            {categories.error && <Notice error>{categories.error}</Notice>}
          </Panel>
          <Panel title='Article content' description='Plain text, not HTML. Headings and paragraphs keep the existing reader layout.'>
            <p className='admin-hint'>{values.sections.length}/20 sections · {total}/16000 total characters</p>
            {values.sections.map((section, index) => <div className='news-admin__section' key={section.id || index}>
              <div className='news-admin__section-heading'><h3>Section {index + 1}</h3><div className='admin-actions'>
                <Button disabled={index === 0} aria-label={`Move section ${index + 1} up`} onClick={() => moveSection(index, -1)}>↑</Button>
                <Button disabled={index === values.sections.length - 1} aria-label={`Move section ${index + 1} down`} onClick={() => moveSection(index, 1)}>↓</Button>
                <Button onClick={() => update('sections', values.sections.filter((_, at) => at !== index))}>Remove</Button>
              </div></div>
              <Field name={`heading-${index}`} label='Section heading' value={section.heading} maxLength={200} onChange={(event) => updateSection(index, 'heading', event.target.value)} hint={`${section.heading.length}/200`} />
              <Field name={`body-${index}`} label='Paragraphs' multiline rows={7} value={section.body} maxLength={5000} onChange={(event) => updateSection(index, 'body', event.target.value)} hint={`${section.body.length}/5000 · Line breaks are preserved`} />
            </div>)}
            <Button disabled={values.sections.length >= 20} onClick={() => update('sections', [...values.sections, { id: crypto.randomUUID(), heading: '', body: '' }])}>+ Add section</Button>
          </Panel>
          <Panel title='Further reading' description='Optional. A domain without https:// is accepted.'>
            <Field name='sourceLabel' label='Source label' value={values.source.label} maxLength={150} onChange={(event) => update('source', { ...values.source, label: event.target.value })} />
            <Field name='sourceUrl' label='Source URL' value={values.source.url} maxLength={2000} onChange={(event) => update('source', { ...values.source, url: event.target.value })} placeholder='example.com/article' />
          </Panel>
        </div>
        <aside className='admin-stack'>
          <Panel title='Publication'>
            <Field label='Status' {...field('status')}><option value='draft'>Draft — admin only</option><option value='published'>Published</option><option value='archived'>Archived — hidden</option></Field>
            <Field label='Publication date' type='date' min='1900-01-01' max={values.status === 'published' ? new Date().toISOString().slice(0, 10) : undefined} {...field('publishedAt')} hint='Leave empty to use today (UTC) on publication. Future scheduling is not enabled.' />
            <p className='admin-hint'>Blog shows published articles newest first. Home shows the three latest. A draft needs only a title.</p>
            <Button disabled={!values.title.trim() || !values.media} onClick={() => setPreview(true)}>Preview article</Button>
          </Panel>
          <Panel title='Article cover' description='Choose an existing image or upload one directly.'>
            {values.media ? <><img className='news-admin__cover' src={values.media.url} alt={values.imageAlt || values.media.alt || ''} /><p className='admin-hint'>{values.media.filename}</p></> : <div className='admin-image-placeholder'>No cover selected</div>}
            <Button onClick={() => setPicker(true)}>{values.media ? 'Change cover' : 'Choose or upload cover'}</Button>
            {values.media && <Button onClick={() => { update('imageId', null); update('media', null); }}>Remove selection</Button>}
            <Field label='Alt text override' {...field('imageAlt')} multiline rows={3} maxLength={300} hint='Empty uses the library alt text. The original media record is not changed.' />
          </Panel>
        </aside>
      </fieldset>
      {values.id && <DangerZone title='Delete article' actionLabel='Delete article' disabled={saving} onAction={() => setRemove(true)}>
        <p>Permanent deletion removes the article, not its cover image.</p>
      </DangerZone>}
      <SaveBar pending={saving} disabled={saveDisabled} dirty={dirty} error={error} message={message} submitLabel={saveLabel} onCancel={back} />
    </form>
    <SaveStatus pending={saving} error={error} message={saving ? saveLabel : message} onDismiss={() => { setError(''); setMessage(''); }} />
    {picker && <ServiceImagePicker title='Choose an article cover' entity='article' selectedId={values.imageId} onClose={() => setPicker(false)} onChoose={(media) => { setValues((previous) => ({ ...previous, imageId: media.id, media })); setPicker(false); setError(''); setMessage(''); }} />}
    {preview && <ArticleDialog id='news-preview' preview article={{ ...values, image: values.media?.url, imageAlt: values.imageAlt || values.media?.alt || '', source: safeSource }} onClose={() => setPreview(false)} />}
    {remove && <NewsDeleteDialog item={values} onClose={() => setRemove(false)} onDone={() => navigate('/admin/news', { replace: true, state: { notice: 'Article deleted. The cover stays in Media Library.' } })} />}
  </div>;
}
