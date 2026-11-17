import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import NotFound from '../../components/feedback/NotFound/NotFound.jsx';
import { servicesApi } from '../../lib/services.js';
import { Badge, Button, Checkbox, Empty, Field, Notice, PageHeading, Panel } from '../components/UI.jsx';
import { ConfirmDialog } from '../components/Dialog.jsx';
import StringList from '../components/StringList.jsx';
import ServiceImagePicker from '../components/services/ServiceImagePicker.jsx';
import './Services.sass';

const statusOptions = [['all', 'All services'], ['draft', 'Draft'], ['active', 'Published / Active'], ['archived', 'Archived']];
const freshService = () => ({
  title: '', summary: '', description: '', propertyTypes: [], points: [],
  imageId: null, imageAlt: '', media: null, showOnHome: false,
  group: 'main', status: 'draft', order: 1, eyebrow: '', cta: 'Discuss Your Project', tone: 'white',
});
const toForm = (service) => ({ ...freshService(), ...service,
  description: service.descriptionText ?? service.description ?? '',
  imageAlt: service.imageAltText ?? service.imageAlt ?? '',
  cta: service.ctaText ?? service.cta ?? '',
});
const failureMessage = (error) => error.status === 401
  ? 'Your session expired. Sign in again before saving.' : error.message;

export function ServicesList() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('all');
  const [retry, setRetry] = useState(0);
  const [result, setResult] = useState({ services: [], pagination: null, status: 'loading', error: '' });
  const [selected, setSelected] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const running = useRef(false);
  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      setResult((previous) => ({ ...previous, status: 'loading', error: '' }));
      try {
        const response = await servicesApi.getAll(page, status, { signal: controller.signal });
        if (controller.signal.aborted) return;
        const last = Math.max(1, response.pagination.totalPages);
        if (page > last) { setPage(last); return; }
        setResult({ services: response.services, pagination: response.pagination, status: 'ready', error: '' });
      } catch (error) {
        if (!controller.signal.aborted) setResult({ services: [], pagination: null, status: 'error', error: failureMessage(error) });
      }
    };
    void load();
    return () => controller.abort();
  }, [page, status, retry]);
  const closeDelete = () => { if (!running.current) setSelected(null); };
  const remove = async () => {
    if (!selected || running.current) return;
    running.current = true;
    setDeleting(true);
    setDeleteError('');
    try {
      await servicesApi.remove(selected.id);
      setSelected(null);
      setRetry((value) => value + 1);
    } catch (error) {
      if (error.status === 404) { setSelected(null); setRetry((value) => value + 1); }
      else setDeleteError(failureMessage(error));
    } finally { running.current = false; setDeleting(false); }
  };
  return <div className='services-admin'>
    <PageHeading title='Services' description='Manage the services shown on Home, Services and Contact.'>
      <Button variant='primary' to='/admin/services/new'>+ Add service</Button>
    </PageHeading>
    <div className='admin-actions'>{statusOptions.map(([value, label]) => <Button key={value}
      disabled={deleting} aria-pressed={status === value} onClick={() => { setStatus(value); setPage(1); }}>{label}</Button>)}</div>
    {result.status === 'loading' && <Panel><p role='status'>Loading services…</p></Panel>}
    {result.error && <Notice error><p>{result.error}</p><Button onClick={() => setRetry((value) => value + 1)}>Retry</Button></Notice>}
    {result.status === 'ready' && (result.services.length ? <div className='admin-table-wrap'>
      <table className='admin-table services-admin__table'>
        <thead><tr><th>Service</th><th>Property types</th><th>Visibility</th><th>Order</th><th>Actions</th></tr></thead>
        <tbody>{result.services.map((service) => <tr key={service.id}>
          <td data-label='Service'><strong>{service.title}</strong><small>{service.summary || 'No short description'}</small></td>
          <td data-label='Property types'>{service.propertyTypes.join(' · ') || 'Not selected'}</td>
          <td data-label='Visibility'><Badge status={service.status} /><small>{service.showOnHome ? 'Home enabled' : 'Services page only'}</small></td>
          <td data-label='Order'>{service.order}</td>
          <td data-label='Actions'><div className='services-admin__actions'>
            <Link className='admin-button' to={`/admin/services/${service.id}`}>Edit</Link>
            <Button variant='danger' onClick={() => { setDeleteError(''); setSelected(service); }}>Delete</Button>
          </div></td>
        </tr>)}</tbody>
      </table>
    </div> : <Empty title={status === 'all' ? 'No services yet.' : 'No services with this status.'}>
      <p>Create a draft, choose an image and publish when it is ready.</p><Button to='/admin/services/new'>Add service</Button>
    </Empty>)}
    {result.pagination && result.status === 'ready' && <div className='admin-actions'>
      <p className='admin-hint'>{result.pagination.total} services · Page {page} of {Math.max(1, result.pagination.totalPages)}</p><span className='admin-spacer' />
      <Button disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</Button>
      <Button disabled={page >= result.pagination.totalPages} onClick={() => setPage((value) => value + 1)}>Next</Button>
    </div>}
    <p className='admin-hint'>Active means published. Drafts and archived services are not shown publicly. Hero stays static.</p>
    {selected && <ConfirmDialog title='Delete service?' action='Delete service' danger pending={deleting} onClose={closeDelete} onConfirm={remove}>
      <p>Permanently delete <strong>{selected.title}</strong>? Its library image will not be deleted.</p>
      <p className='admin-hint'>To hide a service without deleting it, edit it and choose Archived.</p>
      {deleteError && <Notice error>{deleteError}</Notice>}
    </ConfirmDialog>}
  </div>;
}

export function ServiceEditor() {
  const { id } = useParams();
  return id ? <ExistingService key={id} id={id} /> : <ServiceForm key='new' initial={freshService()} />;
}
function ExistingService({ id }) {
  const [result, setResult] = useState({ service: null, error: '', status: 'loading' });
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    servicesApi.get(id, { signal: controller.signal }).then(({ service }) => {
      if (!controller.signal.aborted) setResult({ service, status: 'ready', error: '' });
    }).catch((error) => {
      if (!controller.signal.aborted) setResult({ service: null, status: error.status === 404 ? 'missing' : 'error', error: failureMessage(error) });
    });
    return () => controller.abort();
  }, [id, retry]);
  if (result.status === 'loading') return <Panel><p role='status'>Loading service…</p></Panel>;
  if (result.status === 'missing') return <NotFound variant='admin' title='Service not found.' returnTo='/admin/services' returnLabel='Back to services' />;
  if (result.error) return <Notice error><p>{result.error}</p><Button onClick={() => {
    setResult({ service: null, status: 'loading', error: '' }); setRetry((value) => value + 1);
  }}>Retry</Button></Notice>;
  return <ServiceForm initial={toForm(result.service)} />;
}

function ServiceForm({ initial }) {
  const navigate = useNavigate();
  const [values, setValues] = useState(initial);
  const [picker, setPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const running = useRef(false);
  const update = (name, value) => {
    setValues((previous) => ({ ...previous, [name]: value }));
    setError(''); setSuccess('');
  };
  const field = (name) => ({ name, value: values[name] ?? '', onChange: (event) => update(name, event.target.value) });
  const choose = (image) => {
    setValues((previous) => ({ ...previous, imageId: image.id, media: image }));
    setPicker(false); setError(''); setSuccess('');
  };
  const submit = async (event) => {
    event.preventDefault();
    if (running.current) return;
    const order = Number(values.order);
    if (!values.title.trim()) { setError('Service name is required.'); return; }
    if (!Number.isInteger(order) || order < 1 || order > 9999) { setError('Use a display order between 1 and 9999.'); return; }
    if (values.status === 'active' && (!values.summary.trim() || !values.imageId || !values.propertyTypes.length)) {
      setError('To publish, add a short description, choose an image and select at least one property type.'); return;
    }
    const data = {
      title: values.title, summary: values.summary, description: values.description,
      propertyTypes: values.propertyTypes, points: values.points, imageId: values.imageId,
      imageAlt: values.imageAlt, showOnHome: values.showOnHome, group: values.group,
      status: values.status, order, eyebrow: values.eyebrow, cta: values.cta, tone: values.tone,
      ...(values.id ? { version: values.version } : {}),
    };
    running.current = true; setSaving(true); setError(''); setSuccess('');
    try {
      const response = values.id ? await servicesApi.update(values.id, data) : await servicesApi.create(data);
      setValues(toForm(response.service));
      setSuccess('Service saved. Only active services appear on the public website.');
      if (!values.id) navigate(`/admin/services/${response.service.id}`, { replace: true });
    } catch (failure) { setError(failureMessage(failure)); }
    finally { running.current = false; setSaving(false); }
  };
  return <div className='services-admin'>
    <PageHeading title={values.id ? 'Edit service' : 'New service'} description='Save a draft or publish a service using an image from your Media Library.' />
    <form className='services-admin__form' onSubmit={submit}>
      {error && <Notice error>{error}</Notice>}{success && <Notice>{success}</Notice>}
      <fieldset className='admin-editor' disabled={saving}>
        <div className='admin-stack'>
          <Panel title='Service details'>
            <Field label='Service name *' {...field('title')} required maxLength={100} />
            <Field label='Short description' multiline rows={3} {...field('summary')} maxLength={500} hint='Required when publishing. Shown on Home and in service summaries.' />
            <Field label='Full description' multiline rows={5} {...field('description')} maxLength={4000} hint='Leave empty to use the short description.' />
            <fieldset className='admin-choice-group'><legend>Property types</legend><div className='admin-actions'>
              {['Residential', 'Commercial'].map((type) => <Checkbox key={type} name='propertyTypes' label={type}
                checked={values.propertyTypes.includes(type)} onChange={(event) => {
                  const checked = event.target.checked;
                  setValues((previous) => ({ ...previous, propertyTypes: checked
                    ? [...new Set([...previous.propertyTypes, type])] : previous.propertyTypes.filter((value) => value !== type) }));
                  setSuccess(''); setError('');
                }} />)}
            </div></fieldset>
            <p className='admin-hint'>Residential and Commercial are independent. Select either or both.</p>
          </Panel>
          <Panel title='What is included' description='Up to 20 work items. Empty items are removed on save.'>
            <StringList label='Point' items={values.points} onChange={(items) => update('points', items)} />
          </Panel>
          <Panel title='Detail section labels'>
            <Field label='Eyebrow' {...field('eyebrow')} maxLength={100} />
            <Field label='Contact button label' {...field('cta')} maxLength={80} />
          </Panel>
        </div>
        <aside className='admin-stack'>
          <Panel title='Visibility & order'>
            <Field label='Status' {...field('status')}>
              <option value='draft'>Draft — admin only</option><option value='active'>Published / Active</option><option value='archived'>Archived — hidden</option>
            </Field>
            <Field label='Display order' type='number' min='1' max='9999' step='1' required {...field('order')} />
            <Field label='Services page placement' {...field('group')}><option value='main'>Detailed service section</option><option value='supporting'>Additional care card</option></Field>
            <Field label='Section background' {...field('tone')}><option value='white'>White</option><option value='warm'>Warm</option></Field>
            <Checkbox label='Show on Home' checked={values.showOnHome} onChange={(event) => update('showOnHome', event.target.checked)} />
            <Button type='submit' variant='primary' disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button>
            <Button disabled={saving} onClick={() => navigate('/admin/services')}>Back to services</Button>
            <p className='admin-hint'>Draft and archived services stay hidden even when Show on Home is checked. Saving does not modify Hero.</p>
          </Panel>
          <Panel title='Service image' description='Select an existing R2 image. The file remains in Media Library.'>
            {values.media ? <><img className='services-admin__preview' src={values.media.url} alt={values.imageAlt || values.media.alt || ''} /><p className='admin-hint'>{values.media.filename}</p></>
              : <div className='admin-image-placeholder'>No image selected</div>}
            <div className='admin-actions'>
              <Button onClick={() => setPicker(true)}>{values.media ? 'Change image' : 'Choose from library'}</Button>
              {values.media && <Button onClick={() => { setValues((previous) => ({ ...previous, imageId: null, media: null })); setSuccess(''); }}>Remove selection</Button>}
            </div>
            <Field label='Alt text override' multiline rows={3} {...field('imageAlt')} maxLength={300} hint='Leave empty to use the library alt text. This does not edit the original media record.' />
          </Panel>
        </aside>
      </fieldset>
    </form>
    {picker && <ServiceImagePicker selectedId={values.imageId} onChoose={choose} onClose={() => setPicker(false)} />}
  </div>;
}
