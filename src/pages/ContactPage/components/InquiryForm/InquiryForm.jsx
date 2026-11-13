import { useEffect, useRef, useState } from 'react';
import FormField from './FormField.jsx';
import PhotoPicker from '../PhotoPicker/PhotoPicker.jsx';
import { useContent } from '../../../../content/context.js';
import { workspaceApi } from '../../../../api/workspace.js';
import { createInitialInquiry, validateInquiry } from '../../data/inquiry.js';
import './InquiryForm.sass';

const InquiryForm = ({ context }) => {
  const { services } = useContent();
  const serviceOptions = [{id:'not-sure',label:'Not sure yet'},...services.filter((service) => service.status === 'active').map((service) => ({id:service.id,label:service.title}))];
  const [pending,setPending] = useState(false);
  const [saveError,setSaveError] = useState('');
  const [values, setValues] = useState(() => createInitialInquiry(context));
  const [photos, setPhotos] = useState([]);
  const [photoError, setPhotoError] = useState('');
  const [attempted, setAttempted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef(null);
  const resultRef = useRef(null);
  const submittedRef = useRef(false);
  const errors = attempted ? validateInquiry(values,serviceOptions) : {};
  const hasErrors = Object.keys(errors).length > 0 || Boolean(photoError);

  useEffect(() => {
    if (submitted) {
      resultRef.current?.focus({ preventScroll: true });
      resultRef.current?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
    }
  }, [submitted]);

  const updateValue = (event) => {
    const { name, value } = event.currentTarget;
    setValues((current) => ({ ...current, [name]: value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (submittedRef.current) return;
    const nextErrors = validateInquiry(values,serviceOptions);
    setAttempted(true);
    if (Object.keys(nextErrors).length || photoError) {
      const first = Object.keys(nextErrors)[0];
      const control = first ? formRef.current?.elements.namedItem(first) : document.getElementById('contact-photos');
      control?.focus();
      return;
    }
    submittedRef.current = true;
    setPending(true); setSaveError('');
    try {
      const receipt = await workspaceApi.createInquiry(values,photos,context);
      console.log('[Veldridge Contact demo — saved locally, not sent]', receipt);
      setSubmitted(true);
    } catch (error) {
      submittedRef.current = false;
      setSaveError(error.message);
      window.requestAnimationFrame(() => document.getElementById('inquiry-save-error')?.focus());
    } finally { setPending(false); }
  };

  const returnToForm = () => {
    submittedRef.current = false;
    setSubmitted(false);
    setAttempted(false);
    setSaveError('');
    window.requestAnimationFrame(() => formRef.current?.elements.namedItem('name')?.focus());
  };

  return (
    <div className='inquiry-form' id='contact-form'>
      <form ref={formRef} className='inquiry-form__fields' onSubmit={submit} noValidate hidden={submitted} aria-labelledby='inquiry-form-title' aria-describedby='inquiry-requirements inquiry-demo-note'>
        <div className='inquiry-form__heading'>
          <h2 id='inquiry-form-title'>Tell us about your project.</h2>
          <p id='inquiry-requirements'>Your name and either a phone number or email are required.</p>
        </div>
        {attempted && hasErrors && <div className='inquiry-form__error-summary' role='alert'>
          <p>Please check the highlighted fields.</p>
          <span>Your details have not been saved. Correct the errors below and try again.</span>
        </div>}
        <fieldset className='inquiry-form__inputs' disabled={pending}>
        <div className='inquiry-form__row'>
          <FormField name='name' label='Name *' value={values.name} onChange={updateValue} error={errors.name} type='text' autoComplete='name' required maxLength={100} placeholder='Your full name' />
          <FormField name='zip' label='ZIP code (optional)' value={values.zip} onChange={updateValue} error={errors.zip} type='text' autoComplete='postal-code' inputMode='numeric' maxLength={10} placeholder='e.g. 19103' />
        </div>
        <div className='inquiry-form__row'>
          <FormField name='phone' label='Phone' value={values.phone} onChange={updateValue} error={errors.phone} type='tel' autoComplete='tel' maxLength={32} placeholder='(000) 000-0000' />
          <FormField name='email' label='Email' value={values.email} onChange={updateValue} error={errors.email} type='email' autoComplete='email' autoCapitalize='none' spellCheck={false} maxLength={254} placeholder='you@example.com' />
        </div>
        <FormField name='service' label='Service (optional)' value={values.service} onChange={updateValue} error={errors.service}>
          {serviceOptions.map(({ id, label }) => <option key={id} value={id}>{label}</option>)}
        </FormField>
        <FormField name='message' label='Message (optional)' value={values.message} onChange={updateValue} error={errors.message} multiline rows={3} maxLength={4000} placeholder='Tell us about your roof or the work you have in mind.' />
        <PhotoPicker disabled={pending} photos={photos} onChange={setPhotos} error={photoError} onError={setPhotoError} />
        </fieldset>
        {saveError && <div id='inquiry-save-error' className='inquiry-form__error-summary' role='alert' tabIndex={-1}>{saveError} Your entries are still here; please try again.</div>}
        <div className='inquiry-form__actions'>
          <button className='inquiry-form__button' type='submit' disabled={pending}>{pending ? 'Saving locally…' : 'Send Message'}</button>
          <p id='inquiry-demo-note'>Demo mode: details and optional photos are saved in this browser’s admin inbox. Nothing is sent to a server. Use sample information only.</p>
        </div>
      </form>
      {submitted && <section ref={resultRef} className='inquiry-form__result' tabIndex={-1} aria-labelledby='inquiry-result-title' role='status'>
        <h2 id='inquiry-result-title'>Demo complete.</h2>
        <p>Your inquiry was saved in this browser’s demo inbox. No email or photos were sent to a server.</p>
        <p className='inquiry-form__result-note'>Open /admin in this same browser to review it. Returning to the form and submitting again creates another demo inquiry.</p>
        <button className='inquiry-form__button' type='button' onClick={returnToForm}>Back to Form</button>
      </section>}
    </div>
  );
};
export default InquiryForm;
