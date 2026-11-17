import { useEffect, useRef, useState } from 'react';
import FormField from './FormField.jsx';
import PhotoPicker from '../PhotoPicker/PhotoPicker.jsx';
import { useContent } from '../../../../content/context.js';
import { inquiriesApi } from '../../../../lib/inquiries.js';
import { createInitialInquiry, validateInquiry } from '../../data/inquiry.js';
import './InquiryForm.sass';
import './InquirySubmission.sass';

export default function InquiryForm({ context }) {
  const { services, servicesStatus, reloadServices } = useContent();
  const serviceOptions = [{ id: 'not-sure', label: 'Not sure yet' }, ...services.filter((service) => service.status === 'active').map((service) => ({ id: service.id, label: service.title }))];
  const [values, setValues] = useState(() => ({ ...createInitialInquiry(context), website: '' }));
  const [photos, setPhotos] = useState([]);
  const [photoError, setPhotoError] = useState('');
  const [attempted, setAttempted] = useState(false);
  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState('');
  const [receipt, setReceipt] = useState(null);
  const formRef = useRef(null);
  const resultRef = useRef(null);
  const lock = useRef(false);
  const submission = useRef(null);
  const mounted = useRef(false);
  const errors = attempted ? validateInquiry(values, serviceOptions) : {};
  const missingService = values.service !== 'not-sure' && !serviceOptions.some((item) => item.id === values.service);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => {
    if (!sending) return;
    const warn = (event) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [sending]);
  useEffect(() => {
    if (!receipt) return;
    resultRef.current?.focus({ preventScroll: true });
    resultRef.current?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
  }, [receipt]);
  const updateValue = (event) => {
    const { name, value } = event.currentTarget;
    setValues((previous) => ({ ...previous, [name]: value })); setFailure('');
  };
  const submit = async (event) => {
    event.preventDefault();
    if (lock.current || receipt) return;
    const nextErrors = validateInquiry(values, serviceOptions);
    setAttempted(true); setFailure('');
    if (Object.keys(nextErrors).length || photoError) {
      const first = Object.keys(nextErrors)[0];
      (first ? formRef.current?.elements.namedItem(first) : document.getElementById('contact-photos'))?.focus();
      return;
    }
    const signature = JSON.stringify({ values, context });
    if (!submission.current || submission.current.signature !== signature ||
      submission.current.photos.length !== photos.length || photos.some((file, index) => file !== submission.current.photos[index])) {
      submission.current = { id: crypto.randomUUID(), signature, photos: [...photos] };
    }
    lock.current = true; setSending(true);
    try {
      const result = await inquiriesApi.submit(values, photos, context, submission.current.id);
      if (!mounted.current) return;
      setReceipt(result); setPhotos([]); setValues({ ...createInitialInquiry(null), website: '' });
    } catch (error) {
      if (mounted.current) setFailure(error.message || 'Could not send your inquiry. Your details are still in this form. Please try again.');
    } finally { lock.current = false; if (mounted.current) setSending(false); }
  };
  const startAnother = () => {
    submission.current = null; setReceipt(null); setAttempted(false); setFailure(''); setPhotoError('');
    window.requestAnimationFrame(() => formRef.current?.elements.namedItem('name')?.focus());
  };
  return <div className='inquiry-form' id='contact-form'>
    <form ref={formRef} className='inquiry-form__fields' onSubmit={submit} noValidate hidden={Boolean(receipt)} aria-busy={sending} aria-labelledby='inquiry-form-title' aria-describedby='inquiry-requirements inquiry-storage-note'>
      <div className='inquiry-form__heading'><h2 id='inquiry-form-title'>Tell us about your project.</h2><p id='inquiry-requirements'>Your name and either a phone number or email are required.</p></div>
      {attempted && (Object.keys(errors).length > 0 || photoError) && <div className='inquiry-form__error-summary' role='alert'><p>Please check the highlighted fields.</p></div>}
      <fieldset className='inquiry-form__inputs' disabled={sending}>
        <div className='inquiry-form__trap' aria-hidden='true'><label htmlFor='inquiry-website'>Leave this field empty</label><input id='inquiry-website' name='website' tabIndex={-1} autoComplete='off' value={values.website} onChange={updateValue} /></div>
        <div className='inquiry-form__row'>
          <FormField name='name' label='Name *' value={values.name} onChange={updateValue} error={errors.name} autoComplete='name' required maxLength={100} placeholder='Your full name' />
          <FormField name='zip' label='ZIP code (optional)' value={values.zip} onChange={updateValue} error={errors.zip} autoComplete='postal-code' inputMode='numeric' maxLength={10} placeholder='e.g. 19103' />
        </div>
        <div className='inquiry-form__row'>
          <FormField name='phone' label='Phone' value={values.phone} onChange={updateValue} error={errors.phone} type='tel' autoComplete='tel' maxLength={32} placeholder='(000) 000-0000' />
          <FormField name='email' label='Email' value={values.email} onChange={updateValue} error={errors.email} type='email' autoComplete='email' autoCapitalize='none' spellCheck={false} maxLength={254} placeholder='you@example.com' />
        </div>
        <FormField name='service' label='Service (optional)' value={values.service} onChange={updateValue} error={errors.service}>
          {missingService && <option value={values.service}>{servicesStatus === 'loading' ? 'Loading selected service…' : 'Selected service is unavailable — choose another'}</option>}
          {serviceOptions.map(({ id, label }) => <option key={id} value={id}>{label}</option>)}
        </FormField>
        {servicesStatus === 'error' && <p className='inquiry-form__service-help'>Services could not be loaded. You can select Not sure yet or <button type='button' onClick={reloadServices}>try again</button>.</p>}
        <FormField name='message' label='Message (optional)' value={values.message} onChange={updateValue} error={errors.message} multiline rows={4} maxLength={4000} placeholder='Tell us about your roof or the work you have in mind.' />
        <PhotoPicker photos={photos} onChange={(files) => { setPhotos(files); setFailure(''); }} error={photoError} onError={setPhotoError} disabled={sending} />
      </fieldset>
      <div className='inquiry-form__actions'>
        {failure && <div className='inquiry-form__error-summary' role='alert'><p>{failure}</p><span>Your details and photos have been kept. Retry without changing them to avoid a duplicate submission.</span></div>}
        <button className='inquiry-form__button' type='submit' disabled={sending}>{sending ? 'Sending inquiry…' : 'Send Message'}</button>
        {sending && <p role='status'>Sending your details and private photos. Keep this page open.</p>}
        <p id='inquiry-storage-note'>{import.meta.env.VITE_DEMO_MODE !== 'false' ? 'Demo website: submissions are saved for testing. Use test details only. ' : ''}Your message and photos are sent to the administrator, not published in the gallery. Do not include sensitive documents.</p>
      </div>
    </form>
    {receipt && <section ref={resultRef} className='inquiry-form__result' tabIndex={-1} aria-labelledby='inquiry-result-title' role='status'>
      <h2 id='inquiry-result-title'>Your inquiry has been received.</h2><p>Your message and any attached photos have been saved successfully.</p>
      <p className='inquiry-form__receipt'>Reference: <strong>{receipt.reference}</strong></p>
      <p className='inquiry-form__result-note'>No automatic email confirmation is sent.</p><button className='inquiry-form__button' type='button' onClick={startAnother}>Send another inquiry</button>
    </section>}
  </div>;
}
