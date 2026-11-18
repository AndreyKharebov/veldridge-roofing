import { useEffect, useRef, useState } from 'react';
import { DangerZone, SaveBar } from '../Workspace.jsx';
import { useNavigate } from 'react-router';
import { projectsApi } from '../../../lib/projects.js';
import { Button, Checkbox, Field, PageHeading, Panel } from '../UI.jsx';
import SaveStatus from '../SaveStatus.jsx';
import ProjectDialog from '../../../pages/GalleryPage/components/ProjectDialog/ProjectDialog.jsx';
import ProjectPhotos from './ProjectPhotos.jsx';
import ProjectImagePicker from './ProjectImagePicker.jsx';
import ProjectDeleteDialog from './ProjectDeleteDialog.jsx';
import { projectPayload, projectFormError, projectFailure, previewProject, toProjectForm } from './projectForm.js';

export default function ProjectForm({ initial, catalog, services, created = false }) {
  const navigate = useNavigate();
  const [values, setValues] = useState(initial);
  const initialPosition = initial.id ? catalog.findIndex((item) => item.id === initial.id) + 1 : catalog.length + 1;
  const [position, setPosition] = useState(Math.max(1, initialPosition));
  const [baseline, setBaseline] = useState(() => JSON.stringify({ ...projectPayload(initial), position: Math.max(1, initialPosition) }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(created ? 'Project created successfully.' : '');
  const [picker, setPicker] = useState(false);
  const [preview, setPreview] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const mounted = useRef(false);
  const lock = useRef(false);
  const form = useRef(null);
  const payload = { ...projectPayload(values), position };
  const dirty = JSON.stringify(payload) !== baseline;
  const cover = values.photos.find((photo) => photo.mediaId === values.coverPhotoId);
  const maxPosition = catalog.filter((item) => item.id !== values.id).length + 1;
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => {
    if (!dirty && !saving) return;
    const warn = (event) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty, saving]);
  const update = (name, value) => {
    setValues((old) => ({ ...old, [name]: value })); setError(''); setSuccess('');
  };
  const field = (name) => ({ name, value: values[name] ?? '', onChange: (event) => update(name, event.target.value) });
  const addPhotos = (images) => {
    const existing = new Set(values.photos.map((photo) => photo.mediaId));
    const additions = images.filter((image) => !existing.has(image.id)).slice(0, 20 - values.photos.length).map((image) => ({
      id: image.id, mediaId: image.id, src: image.url, filename: image.filename, size: image.size,
      caption: '', alt: '', libraryAlt: image.alt || '', unavailable: false,
    }));
    setValues((old) => ({ ...old, photos: [...old.photos, ...additions], coverPhotoId: old.coverPhotoId || additions[0]?.mediaId || null }));
    setPicker(false); setError(''); setSuccess('');
  };
  const submit = async (event) => {
    event.preventDefault();
    if (lock.current || !dirty) return;
    const invalid = projectFormError(values);
    if (invalid) { setError(invalid); setSuccess(''); return; }
    if (!form.current.checkValidity()) { form.current.reportValidity(); return; }
    const creating = !values.id;
    lock.current = true; setSaving(true); setError(''); setSuccess('');
    try {
      const { project } = creating ? await projectsApi.create(payload) : await projectsApi.update(values.id, payload);
      if (!mounted.current) return;
      const next = toProjectForm(project);
      setValues(next); setPosition(project.order);
      setBaseline(JSON.stringify({ ...projectPayload(next), position: project.order }));
      setSuccess(creating ? 'Project created successfully.' : 'Project saved successfully.');
      if (creating) navigate(`/admin/projects/${project.id}`, { replace: true, state: { createdProjectId: project.id } });
    } catch (failure) { if (mounted.current) setError(projectFailure(failure)); }
    finally { lock.current = false; if (mounted.current) setSaving(false); }
  };
  const goBack = () => {
    if (!saving && (!dirty || window.confirm('Discard unsaved changes? Uploaded files will remain in Media Library.'))) navigate('/admin/projects');
  };
  const busy = saving || picker || preview || deleting;
  return <div className='projects-admin'>
    <PageHeading onBack={goBack} backDisabled={saving} backLabel='Projects' title={values.id ? 'Edit project' : 'New project'} description='Tell the story of your work. Save a draft, then publish when it is ready.' />
    <form ref={form} className='project-editor' onSubmit={submit} noValidate>
      <fieldset className='admin-editor' disabled={saving}>
        <div className='admin-stack'>
          <Panel title='Project information'>
            <Field label='Project title *' {...field('title')} required maxLength={150} hint={`${values.title.length}/150 characters`} />
            <div className='admin-two-columns'>
              <Field label='Service category' {...field('serviceId')} hint='Required for publication. Historical projects may retain archived services.'>
                <option value=''>Choose a service</option>{services.map((service) => <option key={service.id} value={service.id}>{service.title}{service.status !== 'active' ? ` (${service.status})` : ''}</option>)}
              </Field>
              <Field label='Property type' {...field('propertyType')} hint='Required for publication.'><option value=''>Choose a type</option><option>Residential</option><option>Commercial</option></Field>
            </div>
            <Field label='Project summary' multiline rows={4} {...field('summary')} maxLength={500} hint={`${values.summary.length}/500 characters · Required for publication.`} />
            <Field label='Property description' {...field('property')} maxLength={150} />
            <div className='admin-two-columns'><Field label='On-site duration' {...field('duration')} maxLength={100} /><Field label='Main material' {...field('material')} maxLength={150} /></div>
            <Field label='Finish / color' {...field('finish')} maxLength={100} />
          </Panel>
          <Panel title='Project photos' description={`${values.photos.length}/20 photos · Original files are stored in Media Library.`}>
            <div className='admin-actions'><Button variant='primary' disabled={busy || values.photos.length >= 20} onClick={() => setPicker(true)}>+ Choose or upload photos</Button></div>
            <ProjectPhotos photos={values.photos} coverPhotoId={values.coverPhotoId} onChange={(photos) => update('photos', photos)} onCover={(id) => update('coverPhotoId', id)} disabled={saving} />
          </Panel>
          <Panel title='What we did' description='Up to 5 concise work items, 150 characters each.'>
            {values.work.map((item, index) => <div className='project-editor__work' key={index}>
              <Field label={`Work item ${index + 1}`} name={`work-${index}`} value={item} maxLength={150}
                onChange={(event) => update('work', values.work.map((old, i) => i === index ? event.target.value : old))} />
              <Button variant='danger' aria-label={`Remove work item ${index + 1}`} onClick={() => update('work', values.work.filter((_, i) => i !== index))}>Remove</Button>
            </div>)}
            <Button disabled={values.work.length >= 5} onClick={() => update('work', [...values.work, ''])}>+ Add work item</Button>
          </Panel>
        </div>
        <aside className='admin-stack'>
          <Panel title='Publication'>
            <Field label='Status' {...field('status')}><option value='draft'>Draft — admin only</option><option value='published'>Published</option><option value='archived'>Archived — hidden</option></Field>
            <Field label='Position in gallery' name='position' value={position} onChange={(event) => { setPosition(Number(event.target.value)); setSuccess(''); }}>
              {Array.from({ length: maxPosition }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}{i + 1 === maxPosition ? ' — last' : ''}</option>)}
            </Field>
            <Checkbox label='Show on Home' checked={values.showOnHome} onChange={(event) => update('showOnHome', event.target.checked)} />
            <Checkbox label='Demonstration project' checked={values.isDemo} onChange={(event) => update('isDemo', event.target.checked)} />
            <p className='admin-hint'>Home shows the first four published projects with Show on Home enabled. Demo projects are labelled publicly; turn this off only for verified work.</p>
            <Button disabled={busy || !values.title.trim() || !values.photos.some((photo) => photo.src)} onClick={() => setPreview(true)}>Preview project</Button>
          </Panel>
          <Panel title='Gallery cover preview'>
            {cover?.src ? <img className='project-editor__cover' src={cover.src} alt={cover.alt || cover.libraryAlt || ''} /> : <div className='admin-image-placeholder'>Choose a cover photo</div>}
            <p className='admin-eyebrow'>{services.find((service) => service.id === values.serviceId)?.title || 'Service category'}</p>
            <h3>{values.title || 'Project title'}</h3>
            <p className='admin-hint'>The cover is independent of the photo order.</p>
          </Panel>
        </aside>
      </fieldset>
      {values.id && <DangerZone title='Delete project' actionLabel='Delete project' disabled={busy} onAction={() => setDeleting(true)}>
        <p>Delete the project permanently, or archive it to hide it. Images stay in Media Library.</p>
      </DangerZone>}
      <SaveBar pending={saving} disabled={busy || !dirty} dirty={dirty} error={error} message={success}
        submitLabel={saving ? (values.id ? 'Saving…' : 'Creating…') : values.id ? 'Save changes' : 'Create project'} onCancel={goBack} />
    </form>
    {!picker && !preview && !deleting && <SaveStatus pending={saving} error={error} message={saving ? (values.id ? 'Saving project…' : 'Creating project…') : success} onDismiss={() => { setError(''); setSuccess(''); }} />}
    {picker && <ProjectImagePicker existingIds={values.photos.map((photo) => photo.mediaId)} onChoose={addPhotos} onClose={() => setPicker(false)} />}
    {preview && <ProjectDialog preview id='admin-project-preview' project={previewProject(values, services)} onClose={() => setPreview(false)} />}
    {deleting && <ProjectDeleteDialog project={values} onClose={() => setDeleting(false)} onDeleted={() => navigate('/admin/projects', { replace: true })} />}
  </div>;
}
