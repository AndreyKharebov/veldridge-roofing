import { useEffect, useRef, useState } from 'react';
import FormField from './FormField.jsx';
import PhotoPicker from '../PhotoPicker/PhotoPicker.jsx';
import { useContent } from '../../../../content/context.js';
import { logForm } from '../../../../utils/logForm.js';
import { createInitialInquiry, validateInquiry } from '../../data/inquiry.js';
import './InquiryForm.sass';

const InquiryForm = ({ context }) => {
  const { services } = useContent();
  const serviceOptions = [{id:'not-sure',label:'Not sure yet'},...services.filter((service) => service.status === 'active').map((service) => ({id:service.id,label:service.title}))];
  const [values, setValues] = useState(() => createInitialInquiry(context));
  const [photos, setPhotos] = useState([]);
  const [photoError, setPhotoError] = useState('');
  const [attempted, setAttempted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef(null);
  const resultRef = useRef(null);
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
  const submit = (event) => {
    event.preventDefault();
    const nextErrors = validateInquiry(values,serviceOptions);
    setAttempted(true);
    if (Object.keys(nextErrors).length || photoError) {
      const first = Object.keys(nextErrors)[0];
      const control = first ? formRef.current?.elements.namedItem(first) : document.getElementById('contact-photos');
      control?.focus();
      return;
    }
    logForm('Contact inquiry', { ...values, photos, source: context });
    setSubmitted(true);
  };
  const returnToForm = () => {
    setSubmitted(false);
    setAttempted(false);
    window.requestAnimationFrame(() => formRef.current?.elements.namedItem('name')?.focus());
  };
  return <div className='inquiry-form' id='contact-form'>
    <form ref={formRef} className='inquiry-form__fields' onSubmit={submit} noValidate hidden={submitted} aria-labelledby='inquiry-form-title' aria-describedby='inquiry-requirements inquiry-layout-note'>
      <div className='inquiry-form__heading'><h2 id='inquiry-form-title'>Tell us about your project.</h2><p id='inquiry-requirements'>Your name and either a phone number or email are required.</p></div>
      {attempted && hasErrors && <div className='inquiry-form__error-summary' role='alert'><p>Please check the highlighted fields.</p><span>Please correct the errors before submitting this form.</span></div>}
      <fieldset className='inquiry-form__inputs'>
        <div className='inquiry-form__row'>
          <FormField name='name' label='Name *' value={values.name} onChange={updateValue} error={errors.name} type='text' autoComplete='name' required maxLength={100} placeholder='Your full name' />
          <FormField name='zip' label='ZIP code (optional)' value={values.zip} onChange={updateValue} error={errors.zip} type='text' autoComplete='postal-code' inputMode='numeric' maxLength={10} placeholder='e.g. 19103' />
        </div>
        <div className='inquiry-form__row'>
          <FormField name='phone' label='Phone' value={values.phone} onChange={updateValue} error={errors.phone} type='tel' autoComplete='tel' maxLength={32} placeholder='(000) 000-0000' />
          <FormField name='email' label='Email' value={values.email} onChange={updateValue} error={errors.email} type='email' autoComplete='email' autoCapitalize='none' spellCheck={false} maxLength={254} placeholder='you@example.com' />
        </div>
        <FormField name='service' label='Service (optional)' value={values.service} onChange={updateValue} error={errors.service}>{serviceOptions.map(({ id, label }) => <option key={id} value={id}>{label}</option>)}</FormField>
        <FormField name='message' label='Message (optional)' value={values.message} onChange={updateValue} error={errors.message} multiline rows={3} maxLength={4000} placeholder='Tell us about your roof or the work you have in mind.' />
        <PhotoPicker photos={photos} onChange={setPhotos} error={photoError} onError={setPhotoError} />
      </fieldset>
      <div className='inquiry-form__actions'><button className='inquiry-form__button' type='submit'>Send Message</button><p id='inquiry-layout-note'>Static layout: form data only logs to the browser console. Nothing is sent or saved. Do not enter real customer details.</p></div>
    </form>
    {submitted && <section ref={resultRef} className='inquiry-form__result' tabIndex={-1} aria-labelledby='inquiry-result-title' role='status'><h2 id='inquiry-result-title'>Form data logged.</h2><p>The fields and file metadata were logged to your browser console. No message, upload or database write occurred.</p><p className='inquiry-form__result-note'>No inquiry was added to the admin layout.</p><button className='inquiry-form__button' type='button' onClick={returnToForm}>Back to Form</button></section>}
  </div>;
};
export default InquiryForm;
