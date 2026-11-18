import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { testimonialsApi } from '../../../lib/testimonials.js';
import { Button, Checkbox, Field, PageHeading, Panel } from '../UI.jsx';
import SaveStatus from '../SaveStatus.jsx';
import { DangerZone, SaveBar } from '../Workspace.jsx';
import ServiceImagePicker from '../services/ServiceImagePicker.jsx';
import TestimonialCard from '../../../pages/HomePage/components/Testimonials/TestimonialCard.jsx';
import TestimonialDeleteDialog from './TestimonialDeleteDialog.jsx';
import { testimonialFingerprint, toTestimonialForm, validateTestimonialForm } from './testimonialForm.js';
import '../../pages/Services.sass';

export default function TestimonialForm({ initial, created = false }) {
  const navigate = useNavigate();
  const lock = useRef(false);
  const mounted = useRef(false);
  const [values, setValues] = useState(initial);
  const [baseline, setBaseline] = useState(() => testimonialFingerprint(initial));
  const [saving, setSaving] = useState(false);
  const [picker, setPicker] = useState(false);
  const [remove, setRemove] = useState(false);
  const [error, setError] = useState('');
  const [conflict, setConflict] = useState(false);
  const [message, setMessage] = useState(created ? 'Review created successfully.' : '');
  const dirty = testimonialFingerprint(values) !== baseline;
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => {
    if (!dirty && !saving) return;
    const warn = (event) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty, saving]);
  const update = (name, value) => {
    setValues((previous) => ({ ...previous, [name]: value })); setError(''); setMessage('');
  };
  const field = (name) => ({ name, value: values[name], onChange: (event) => update(name, event.target.value) });
  const back = () => {
    if (!lock.current && (!dirty || window.confirm('Discard your unsaved review changes?'))) navigate('/admin/testimonials');
  };
  const reload = async () => {
    if (lock.current || (dirty && !window.confirm('Discard local changes and load the latest saved review?'))) return;
    lock.current = true; setSaving(true);
    try {
      const { testimonial } = await testimonialsApi.get(values.id);
      if (!mounted.current) return;
      const next = toTestimonialForm(testimonial);
      setValues(next); setBaseline(testimonialFingerprint(next)); setConflict(false); setError(''); setMessage('Latest saved review loaded.');
    } catch (failure) { if (mounted.current) setError(failure.message); }
    finally { lock.current = false; if (mounted.current) setSaving(false); }
  };
  const submit = async (event) => {
    event.preventDefault();
    if (lock.current || conflict || (values.id && !dirty)) return;
    let data;
    try { data = validateTestimonialForm(values); }
    catch (failure) { setError(failure.message); setMessage(''); return; }
    lock.current = true; setSaving(true); setError(''); setMessage('');
    try {
      const { testimonial } = values.id
        ? await testimonialsApi.update(values.id, { ...data, version: values.version })
        : await testimonialsApi.create(data);
      if (!mounted.current) return;
      const next = toTestimonialForm(testimonial);
      setValues(next); setBaseline(testimonialFingerprint(next));
      setMessage(values.id ? 'Review saved successfully.' : 'Review created successfully.');
      if (!values.id) navigate(`/admin/testimonials/${testimonial.id}`, { replace: true, state: { createdTestimonial: testimonial } });
    } catch (failure) {
      if (mounted.current) { setConflict(failure.status === 409 && /review changed/i.test(failure.message)); setError(failure.status === 401 ? 'Your session expired. Sign in again before saving.' : failure.message); }
    } finally { lock.current = false; if (mounted.current) setSaving(false); }
  };
  const label = saving ? (values.id ? 'Saving…' : 'Creating…') : values.id ? 'Save changes' : 'Create review';
  const disabled = saving || conflict || (Boolean(values.id) && !dirty);
  return <div className='testimonials-admin'>
    <PageHeading onBack={back} backDisabled={saving} backLabel='Testimonials' title={values.id ? 'Edit review' : 'New review'} description='Manage the testimonials displayed on the homepage.' />
    <form className='testimonials-admin__form' onSubmit={submit}>
      <fieldset className='admin-editor' disabled={saving}>
        <div className='admin-stack'>
          <Panel title='Review details'>
            <Field label='Author name *' {...field('name')} required maxLength={100} hint={`${values.name.length}/100 characters`} />
            <Field label='Location / description' {...field('location')} maxLength={100} placeholder='For example: Philadelphia, PA' hint={`${values.location.length}/100 · Optional`} />
            <Field label='Rating' {...field('rating')}>
              {[1, 2, 3, 4, 5].map((rating) => <option key={rating} value={rating}>{rating} {rating === 1 ? 'star' : 'stars'}</option>)}
            </Field>
            <Field label='Review text' {...field('review')} multiline rows={7} maxLength={600} hint={`${values.review.length}/600 · Required for publication. Plain text, not HTML.`} />
          </Panel>
          <Panel title='Card preview' description='Preview only — changes are not saved until you submit the form.'>
            <div className='testimonials-admin__preview'>
              <TestimonialCard testimonial={{ ...values, rating: Number(values.rating), avatar: values.media?.url || '', name: values.name || 'Author name', review: values.review || 'Review text will appear here.' }} />
            </div>
          </Panel>
        </div>
        <aside className='admin-stack'>
          <Panel title='Publication'>
            <Field label='Status' {...field('status')}><option value='draft'>Draft — admin only</option><option value='published'>Published</option><option value='archived'>Archived — hidden</option></Field>
            <Checkbox label='Demonstration review' checked={values.isDemo} onChange={(event) => update('isDemo', event.target.checked)} />
            <p className='admin-hint'>Demo reviews are labelled on the website. Turn this off only for an authentic review you have permission to publish. Do not enter private contact details.</p>
            <p className='admin-hint'>Published reviews appear newest first by first publication date. A draft needs only an author name.</p>
            {values.id && <Button onClick={reload}>Reload saved review</Button>}
          </Panel>
          <Panel title='Author photo' description='Optional. Without a photo, the card uses the author’s initials.'>
            {values.media ? <><img className='testimonials-admin__avatar' src={values.media.url} alt='' /><p className='admin-hint'>{values.media.filename}</p></> : <p className='admin-hint'>No photo selected</p>}
            <Button onClick={() => setPicker(true)}>{values.media ? 'Change photo' : 'Choose or upload photo'}</Button>
            {values.media && <Button onClick={() => { update('avatarId', null); update('media', null); }}>Remove selection</Button>}
            <p className='admin-hint'>The photo is public when the review is published. Removing this selection does not delete the library file.</p>
          </Panel>
        </aside>
      </fieldset>
      {values.id && <DangerZone title='Delete review' actionLabel='Delete review' disabled={saving} onAction={() => setRemove(true)}>
        <p>The review is permanently deleted. Its photo remains in Media Library.</p>
      </DangerZone>}
      <SaveBar pending={saving} disabled={disabled} dirty={dirty} error={error} message={message} submitLabel={label} onCancel={back} />
    </form>
    <SaveStatus pending={saving} error={error} message={saving ? label : message} onDismiss={() => { setError(''); setMessage(''); }} />
    {picker && <ServiceImagePicker title='Choose an author photo' entity='review' selectedId={values.avatarId} onClose={() => setPicker(false)} onChoose={(media) => { update('avatarId', media.id); update('media', media); setPicker(false); }} />}
    {remove && <TestimonialDeleteDialog item={values} onClose={() => setRemove(false)} onDone={() => navigate('/admin/testimonials', { replace: true, state: { notice: 'Review deleted. Its photo stays in Media Library.' } })} />}
  </div>;
}
