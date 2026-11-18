import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import NotFound from '../../components/feedback/NotFound/NotFound.jsx';
import { servicesApi } from '../../lib/services.js';
import { Badge, Button, Checkbox, Empty, Field, Notice, PageHeading, Panel } from '../components/UI.jsx';
import SaveStatus from '../components/SaveStatus.jsx';
import ServiceImagePicker from '../components/services/ServiceImagePicker.jsx';
import ServiceOrderDialog from '../components/services/ServiceOrderDialog.jsx';
import ServiceDeleteDialog from '../components/services/ServiceDeleteDialog.jsx';
import { DangerZone, ListToolbar, Pagination, SaveBar, StatusFilters } from '../components/Workspace.jsx';
import './Services.sass';

const statuses = [['all', 'All services'], ['active', 'Published'], ['draft', 'Draft'], ['archived', 'Archived']];
const limits = { title: 100, summary: 160, description: 300, eyebrow: 100, cta: 80, imageAlt: 300 };
const groups = { main: 'Detailed service sections', supporting: 'Additional care cards' };
const freshService = () => ({ title: '', summary: '', description: '', points: [], imageId: null, media: null,
  imageAlt: '', showOnHome: false, group: 'main', status: 'draft', position: null, eyebrow: '', cta: 'Discuss Your Project' });
const toForm = (service) => ({ ...freshService(), ...service, position: null,
  description: service.descriptionText ?? service.description ?? '', imageAlt: service.imageAltText ?? service.imageAlt ?? '',
  cta: service.ctaText ?? service.cta ?? '' });
const serviceSignature = (values) => JSON.stringify({
  ...Object.fromEntries(Object.keys(limits).map((key) => [key, (values[key] ?? '').trim()])),
  points: values.points.map((point) => point.trim()).filter(Boolean), imageId: values.imageId,
  showOnHome: values.showOnHome, group: values.group, status: values.status,
  position: values.position ?? values.order ?? null,
});
const messageFor = (error) => error.status === 401 ? 'Your session expired. Sign in again before saving.' : error.message;

export function ServicesList() {
  const [query, setQuery] = useState({ page: 1, status: 'all', revision: 0 });
  const [result, setResult] = useState({ services: [], pagination: null, loading: true, error: '' });
  const [selected, setSelected] = useState(null);
  const [arranging, setArranging] = useState(false);
  const [notice, setNotice] = useState('');
  const reload = () => { setResult((value) => ({ ...value, loading: true })); setQuery((value) => ({ ...value, revision: value.revision + 1 })); };
  useEffect(() => {
    const controller = new AbortController();
    servicesApi.getAll(query.page, query.status, { signal: controller.signal }).then((data) => {
      if (controller.signal.aborted) return;
      const last = Math.max(1, data.pagination.totalPages);
      if (query.page > last) { setQuery((value) => ({ ...value, page: last })); return; }
      setResult({ ...data, loading: false, error: '' });
    }).catch((failure) => {
      if (!controller.signal.aborted) setResult({ services: [], pagination: null, loading: false, error: messageFor(failure) });
    });
    return () => controller.abort();
  }, [query]);
  return <div className='services-admin'>
    <PageHeading title='Services' description='Manage the services shown on Home, Services and Contact.'>
      <div className='admin-actions'><Button disabled={result.loading} onClick={reload}>Refresh</Button><Button disabled={result.loading} onClick={() => setArranging(true)}>Arrange services</Button><Button variant='primary' to='/admin/services/new'>+ Add service</Button></div>
    </PageHeading>
    <ListToolbar><StatusFilters options={statuses} value={query.status} disabled={result.loading} onChange={(value) => {
      setResult((previous) => ({ ...previous, loading: true })); setQuery((previous) => ({ ...previous, page: 1, status: value }));
    }} /></ListToolbar>
    {notice && <Notice>{notice}</Notice>}
    {result.loading ? <Panel><p role='status'>Loading services…</p></Panel> : result.error ? <Notice error><p>{result.error}</p><Button onClick={reload}>Retry</Button></Notice>
      : result.services.length ? <div className='admin-table-wrap'><table className='admin-table services-admin__table'>
        <thead><tr><th>Service</th><th>Placement</th><th>Visibility</th><th>Position</th><th>Actions</th></tr></thead>
        <tbody>{result.services.map((service) => <tr key={service.id}>
          <td data-label='Service'><strong>{service.title}</strong><small>{service.summary || 'No short description'}</small></td>
          <td data-label='Placement'>{groups[service.group]}</td>
          <td data-label='Visibility'><Badge status={service.status} /><small>{service.showOnHome ? 'Home enabled' : 'Services page only'}</small></td>
          <td data-label='Position'>{service.order}</td>
          <td data-label='Actions'><div className='services-admin__actions'><Link className='admin-button' to={`/admin/services/${service.id}`}>Edit</Link><Button variant='danger' onClick={() => setSelected(service)}>Delete</Button></div></td>
        </tr>)}</tbody>
      </table></div> : <Empty title={query.status === 'all' ? 'No services yet.' : 'No services with this status.'}><Button to='/admin/services/new'>Add service</Button></Empty>}
    {!result.loading && !result.error && <Pagination pagination={result.pagination} page={query.page} noun='services' onPageChange={(page) => {
      setResult((value) => ({ ...value, loading: true })); setQuery((value) => ({ ...value, page }));
    }} />}
    <p className='admin-hint'>Positions are managed within each placement group. Drafts and archived services stay hidden on the public website.</p>
    {selected && <ServiceDeleteDialog service={selected} onClose={() => setSelected(null)} onDeleted={() => { setSelected(null); setNotice('Service deleted. Its library image was retained.'); reload(); }} />}
    {arranging && <ServiceOrderDialog onClose={() => setArranging(false)} onChanged={reload} />}
  </div>;
}

export function ServiceEditor() {
  const { id } = useParams();
  return id ? <ExistingService key={id} id={id} /> : <ServiceForm key='new' initial={freshService()} />;
}
function ExistingService({ id }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [seed] = useState(() => location.state?.createdService?.id === id ? location.state.createdService : null);
  const [result, setResult] = useState(() => ({ service: seed, error: '', status: seed ? 'ready' : 'loading' }));
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    // Keep the creation response and success notice across the first redirect.
    // Consume the history payload so F5 does not resurrect stale editor data.
    if (location.state?.createdService) navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);
  useEffect(() => {
    if (seed && retry === 0) return;
    const controller = new AbortController();
    servicesApi.get(id, { signal: controller.signal }).then(({ service }) => {
      if (!controller.signal.aborted) setResult({ service, status: 'ready', error: '' });
    }).catch((failure) => {
      if (!controller.signal.aborted) setResult({ service: null, status: failure.status === 404 ? 'missing' : 'error', error: messageFor(failure) });
    });
    return () => controller.abort();
  }, [id, seed, retry]);
  if (result.status === 'loading') return <Panel><p role='status'>Loading service…</p></Panel>;
  if (result.status === 'missing') return <NotFound variant='admin' title='Service not found.' returnTo='/admin/services' returnLabel='Back to services' />;
  if (result.error) return <Notice error><p>{result.error}</p><Button onClick={() => { setResult({ service: null, status: 'loading', error: '' }); setRetry((value) => value + 1); }}>Retry</Button></Notice>;
  return <ServiceForm initial={toForm(result.service)} created={Boolean(seed)} />;
}

function ServiceForm({ initial, created = false }) {
  const navigate = useNavigate();
  const [values, setValues] = useState(initial);
  const [baseline, setBaseline] = useState(() => serviceSignature(initial));
  const dirty = serviceSignature(values) !== baseline;
  const [picker, setPicker] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(created ? 'Service created successfully.' : '');
  const [order, setOrder] = useState(null);
  const [orderLoading, setOrderLoading] = useState(true);
  const [orderError, setOrderError] = useState('');
  const [orderRetry, setOrderRetry] = useState(0);
  const running = useRef(false);
  const mounted = useRef(false);
  useEffect(() => {
    if (!dirty && !saving) return;
    const warn = (event) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty, saving]);
  const back = () => {
    if (!running.current && (!dirty || window.confirm('Discard your unsaved service changes?'))) navigate('/admin/services');
  };
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => {
    const controller = new AbortController();
    servicesApi.getOrder({ signal: controller.signal }).then((data) => {
      if (!controller.signal.aborted) { setOrder(data); setOrderLoading(false); setOrderError(''); }
    }).catch((failure) => { if (!controller.signal.aborted) { setOrderError(messageFor(failure)); setOrderLoading(false); } });
    return () => controller.abort();
  }, [orderRetry]);
  const reloadOrder = () => { setOrderLoading(true); setOrderError(''); setOrderRetry((value) => value + 1); };
  const members = (order?.groups?.[values.group] ?? []).filter((item) => item.id !== values.id);
  const savedPosition = order?.groups?.[values.group]?.findIndex((item) => item.id === values.id) ?? -1;
  const position = values.position ?? (savedPosition >= 0 ? savedPosition + 1 : members.length + 1);
  const update = (name, value) => {
    setValues((previous) => ({ ...previous, [name]: value, ...(name === 'group' ? { position: null } : {}) }));
    setError(''); setErrors({}); setSuccess('');
  };
  const field = (name) => ({ name, value: values[name] ?? '', onChange: (event) => update(name, event.target.value), error: errors[name] });
  const choose = (image) => { setValues((previous) => ({ ...previous, imageId: image.id, media: image })); setPicker(false); setError(''); setErrors({}); setSuccess(''); };
  const submit = async (event) => {
    event.preventDefault();
    if (running.current || orderLoading || orderError || !order || (values.id && !dirty)) return;
    const problems = {};
    for (const [name, maximum] of Object.entries(limits)) {
      if (values[name].trim().length > maximum) problems[name] = `Use no more than ${maximum} characters. Existing text has not been shortened automatically.`;
    }
    if (!values.title.trim()) problems.title = 'Service name is required.';
    if (values.points.length > 5 || values.points.some((text) => text.trim().length > 100)) problems.points = 'Use up to 5 items, with at most 100 characters in each.';
    if (values.status === 'active' && !values.summary.trim()) problems.summary = 'Add a short description before publishing.';
    if (values.status === 'active' && !values.imageId) problems.imageId = 'Choose or upload an image before publishing.';
    if (position < 1 || position > members.length + 1) problems.position = 'Reload the available positions.';
    if (Object.keys(problems).length) { setErrors(problems); setSuccess(''); setError(Object.values(problems)[0]); return; }
    const data = {
      ...Object.fromEntries(Object.keys(limits).map((key) => [key, values[key]])),
      points: values.points, imageId: values.imageId, showOnHome: values.showOnHome,
      group: values.group, status: values.status, position,
      ...(values.id ? { version: values.version } : {}),
    };
    const isNew = !values.id;
    running.current = true; setSaving(true); setError(''); setErrors({}); setSuccess('');
    try {
      const { service } = isNew ? await servicesApi.create(data) : await servicesApi.update(values.id, data);
      if (!mounted.current) return;
      if (isNew) {
        navigate(`/admin/services/${service.id}`, { replace: true, state: { createdService: service } });
      } else {
        const next = toForm(service); setValues(next); setBaseline(serviceSignature(next)); setSuccess('Service saved successfully.'); reloadOrder();
      }
    } catch (failure) { if (mounted.current) setError(messageFor(failure)); }
    finally { running.current = false; if (mounted.current) setSaving(false); }
  };
  const disabled = saving || orderLoading || Boolean(orderError) || !order || (Boolean(values.id) && !dirty);
  const saveLabel = saving ? (values.id ? 'Saving…' : 'Creating…') : values.id ? 'Save changes' : 'Create service';
  return <div className='services-admin'>
    <SaveStatus pending={saving} message={saving ? saveLabel : success} error={error} onDismiss={() => { setError(''); setSuccess(''); }} />
    <PageHeading onBack={back} backDisabled={saving} backLabel='Services' title={values.id ? 'Edit service' : 'New service'} description='Create a draft or publish a service. Images can be selected or uploaded here.' />
    <form className='services-admin__form' onSubmit={submit} noValidate>
      <fieldset className='admin-editor' disabled={saving}>
        <div className='admin-stack'>
          <Panel title='Service details'>
            <Field label='Service name *' {...field('title')} required maxLength={100} />
            <Field label='Short description' multiline rows={3} {...field('summary')} maxLength={160} hint={`${values.summary.length}/160 · Shown on Home. Required for publication.`} />
            <Field label='Full description' multiline rows={4} {...field('description')} maxLength={300} hint={`${values.description.length}/300 · Keep one concise paragraph. Empty uses the short description.`} />
          </Panel>
          <Panel title='What is included' description='Up to 5 concise work items, 100 characters each. Existing text is never removed automatically.'>
            {errors.points && <Notice error>{errors.points}</Notice>}
            <div className='services-admin__points'>{values.points.map((point, index) => <div className='services-admin__point' key={index}>
              <Field label={`Point ${index + 1}`} name={`point-${index}`} value={point} maxLength={100} hint={`${point.length}/100`} onChange={(event) => update('points', values.points.map((text, i) => i === index ? event.target.value : text))} />
              <Button variant='danger' aria-label={`Remove point ${index + 1}`} onClick={() => update('points', values.points.filter((_, i) => i !== index))}>Remove</Button>
            </div>)}</div>
            <div className='admin-actions'><Button disabled={values.points.length >= 5} onClick={() => update('points', [...values.points, ''])}>+ Add point</Button><span className='admin-hint'>{values.points.length}/5 items</span></div>
          </Panel>
          <Panel title='Detail section labels'><Field label='Eyebrow' {...field('eyebrow')} maxLength={100} /><Field label='Contact button label' {...field('cta')} maxLength={80} /></Panel>
        </div>
        <aside className='admin-stack'>
          <Panel title='Publication'>
            <Field label='Status' {...field('status')}><option value='draft'>Draft — admin only</option><option value='active'>Published</option><option value='archived'>Archived — hidden</option></Field>
            <Field label='Services page placement' {...field('group')}><option value='main'>Detailed service section</option><option value='supporting'>Additional care card</option></Field>
            <Field label='Position in this group' name='position' value={position} disabled={orderLoading || Boolean(orderError)} error={errors.position} onChange={(event) => update('position', Number(event.target.value))}>
              {Array.from({ length: members.length + 1 }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}{index === 0 ? ' — First' : index === members.length ? ' — Last' : ''}</option>)}
            </Field>
            {orderLoading && <p role='status' className='admin-hint'>Loading available positions…</p>}
            {orderError && <Notice error><p>{orderError}</p><Button onClick={reloadOrder}>Retry</Button></Notice>}
            <p className='admin-hint'>Other services shift automatically. Use Arrange services in the list to drag items into order. Detailed backgrounds alternate automatically.</p>
            <Checkbox label='Show on Home' checked={values.showOnHome} onChange={(event) => update('showOnHome', event.target.checked)} />
          </Panel>
          <Panel title='Service image' description='Choose an existing image or upload a new one without leaving the editor.'>
            {values.media ? <><img className='services-admin__preview' src={values.media.url} alt={values.imageAlt || values.media.alt || ''} /><p className='admin-hint'>{values.media.filename}</p></> : <div className='admin-image-placeholder'>No image selected</div>}
            {errors.imageId && <Notice error>{errors.imageId}</Notice>}
            <div className='admin-actions'><Button onClick={() => setPicker(true)}>{values.media ? 'Change image' : 'Choose or upload image'}</Button>
              {values.media && <Button onClick={() => { setValues((previous) => ({ ...previous, imageId: null, media: null })); setError(''); setSuccess(''); }}>Remove selection</Button>}
            </div>
            <Field label='Alt text override' multiline rows={3} {...field('imageAlt')} maxLength={300} hint='Leave empty to use the library description.' />
          </Panel>
        </aside>
      </fieldset>
      {values.id && <DangerZone title='Delete service' actionLabel='Delete service' disabled={saving} onAction={() => setDeleting(true)}>
        <p>Permanently remove this service. Its image stays in Media Library.</p>
      </DangerZone>}
      <SaveBar pending={saving} disabled={disabled} dirty={dirty} error={error} message={success} submitLabel={saveLabel} onCancel={back} />
    </form>
    {picker && <ServiceImagePicker selectedId={values.imageId} onChoose={choose} onClose={() => setPicker(false)} />}
    {deleting && <ServiceDeleteDialog service={values} onClose={() => setDeleting(false)} onDeleted={() => navigate('/admin/services', { replace: true })} />}
  </div>;
}
