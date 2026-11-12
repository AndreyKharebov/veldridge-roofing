import { useEffect, useRef, useState } from 'react';
import FormField from './FormField.jsx';
import PhotoPicker from '../PhotoPicker/PhotoPicker.jsx';
import { serviceOptions } from '../../data/contactData.js';
import { buildDemoPayload, createInitialInquiry, validateInquiry } from '../../data/inquiry.js';
import './InquiryForm.sass';

const InquiryForm = ({ context }) => {
  const [values, setValues] = useState(() => createInitialInquiry(context));
  const [photos, setPhotos] = useState([]);
  const [photoError, setPhotoError] = useState('');
  const [attempted, setAttempted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef(null);
  const resultRef = useRef(null);
  const submittedRef = useRef(false);
  const errors = attempted ? validateInquiry(values) : {};
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
    if (submittedRef.current) return;
    const nextErrors = validateInquiry(values);
    setAttempted(true);
    if (Object.keys(nextErrors).length || photoError) {
      const first = Object.keys(nextErrors)[0];
      const control = first ? formRef.current?.elements.namedItem(first) : document.getElementById('contact-photos');
      control?.focus();
      return;
    }
    submittedRef.current = true;
    // Intentional demo behavior. No fetch, email, storage or file upload.
    console.log('[Veldridge Contact demo — not sent]', buildDemoPayload(values, photos, context));
    setSubmitted(true);
  };

  const returnToForm = () => {
    submittedRef.current = false;
    setSubmitted(false);
    setAttempted(false);
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
          <span>Your details have not been logged. Correct the errors below and try again.</span>
        </div>}
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
        <PhotoPicker photos={photos} onChange={setPhotos} error={photoError} onError={setPhotoError} />
        <div className='inquiry-form__actions'>
          <button className='inquiry-form__button' type='submit'>Send Message</button>
          <p id='inquiry-demo-note'>Demo mode: details are logged to the console. Nothing is sent.</p>
        </div>
      </form>
      {submitted && <section ref={resultRef} className='inquiry-form__result' tabIndex={-1} aria-labelledby='inquiry-result-title' role='status'>
        <h2 id='inquiry-result-title'>Demo complete.</h2>
        <p>Your details were logged in this browser’s console. No message or photos were sent.</p>
        <p className='inquiry-form__result-note'>This is a local test only. You can return to the form to review or edit your details.</p>
        <button className='inquiry-form__button' type='button' onClick={returnToForm}>Back to Form</button>
      </section>}
    </div>
  );
};
export default InquiryForm;
