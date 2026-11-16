import { useEffect, useState } from 'react';
import { useContent } from '../../content/context.js';
import { settingsApi } from '../../lib/settings.js';
import { getOfficeLocation } from '../../utils/officeLocation.js';
import { Button, Checkbox, Field, Notice, PageHeading, Panel } from '../components/UI.jsx';

const socialFields = [
  ['facebook', 'Facebook'], ['instagram', 'Instagram'],
  ['linkedin', 'LinkedIn'], ['youtube', 'YouTube'],
];
const textFields = ['company', 'phone', 'email', 'street', 'city', 'state', 'zip', 'hours', 'hoursNote', 'timeZone'];
const isDemo = import.meta.env.VITE_DEMO_MODE !== 'false';

const readSettings = (settings = {}) => ({
  ...Object.fromEntries(textFields.map((key) => [key, settings[key] ?? ''])),
  serviceStates: Array.isArray(settings.serviceStates) ? settings.serviceStates : [],
  socials: Object.fromEntries(socialFields.map(([key]) => [key, settings.socials?.[key] ?? ''])),
});

export default function Settings() {
  const { settings: defaults } = useContent();
  const [values, setValues] = useState(() => readSettings(defaults));
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const office = getOfficeLocation(values);

  useEffect(() => {
    const controller = new AbortController();
    settingsApi.get({ signal: controller.signal })
      .then(({ settings }) => {
        if (!controller.signal.aborted) setValues(readSettings(settings));
      })
      .catch((failure) => {
        if (!controller.signal.aborted) setLoadError(failure.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  const update = (name, value) => {
    setValues((previous) => ({ ...previous, [name]: value }));
    setError('');
    setSuccess('');
  };
  const field = (name) => ({
    name, value: values[name] ?? '',
    onChange: (event) => update(name, event.target.value),
  });
  const socialField = (name) => ({
    name, value: values.socials[name],
    onChange: (event) => update('socials', { ...values.socials, [name]: event.target.value }),
  });
  const submit = async (event) => {
    event.preventDefault();
    if (saving || loading || loadError) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      // Only the current API contract is sent; no derived values or legacy map.
      const response = await settingsApi.update(readSettings(values));
      setValues(readSettings(response.settings));
      setSuccess('Settings saved successfully. Public contact details have been updated.');
    } catch (failure) {
      setError(failure.status === 401
        ? 'Your session has expired. Sign in again before saving.'
        : failure.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className='content-status'>Loading company settings…</div>;
  if (loadError) return <div className='content-status'>
    <h1>Cannot load company settings.</h1><p>{loadError}</p>
    <Button onClick={() => window.location.reload()}>Retry</Button>
  </div>;

  return <>
    <PageHeading title='Contact settings' description='Manage company information, service area, social links and office address.' />
    <form onSubmit={submit}>
      {error && <Notice error>{error}</Notice>}
      {success && <Notice>{success}</Notice>}
      <fieldset className='admin-editor-grid' disabled={saving}>
        <div className='admin-stack'>
          <Panel title='Company & contact' description='The saved street, city, state and ZIP are used for the public Google map and directions.'>
            <Field label='Company name *' {...field('company')} required maxLength={120} />
            <div className='admin-field-row'>
              <Field label='Phone *' {...field('phone')} type='tel' required maxLength={40} />
              <Field label='Email *' {...field('email')} type='email' required maxLength={254} />
            </div>
            <Field label='Street address' {...field('street')} maxLength={200} />
            <div className='admin-field-row'>
              <Field label='City' {...field('city')} maxLength={100} />
              <Field label='State' {...field('state')} maxLength={100} />
            </div>
            <Field label='ZIP code' {...field('zip')} inputMode='numeric' maxLength={10} />
          </Panel>
          <Panel title='Hours & service area' description='Business hours and service states are saved to MongoDB.'>
            <Field label='Business hours' {...field('hours')} maxLength={200} />
            <Field label='Additional hours note' {...field('hoursNote')} maxLength={200} />
            <Field label='Time zone' {...field('timeZone')} maxLength={80} hint='For example: America/New_York' />
            <fieldset className='admin-check-group'>
              <legend>Service area</legend>
              <div className='admin-actions'>
                {[['PA', 'Pennsylvania'], ['NJ', 'New Jersey'], ['DE', 'Delaware']].map(([value, label]) => (
                  <Checkbox key={value} label={label} checked={values.serviceStates.includes(value)} onChange={(event) => {
                    update('serviceStates', event.target.checked
                      ? [...values.serviceStates, value]
                      : values.serviceStates.filter((state) => state !== value));
                  }} />
                ))}
              </div>
            </fieldset>
          </Panel>
          <Panel title='Social links' description='Enter a full URL. Leave blank to keep that social icon inactive.'>
            {socialFields.map(([key, label]) => (
              <Field key={key} label={label} {...socialField(key)} type='url' maxLength={2000} placeholder='https://…' />
            ))}
          </Panel>
        </div>
        <aside className='admin-stack'>
          <Panel title='Save settings'>
            <Button variant='primary' type='submit' disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button>
            <Button to='/admin'>Cancel</Button>
            <p className='admin-hint'>Save to update public contacts and the Google Maps destination. Hero stays static.</p>
          </Panel>
          <Panel title='Contact preview'>
            <h3>{values.company}</h3>
            <p className='admin-prose'>{values.phone || 'Phone not provided'}<br />{values.email || 'Email not provided'}<br />{values.street || 'Address not provided'}<br />{office.locality}</p>
            <p className='admin-hint'>{values.hours}<br />{values.hoursNote}</p>
            <p>{values.serviceStates.join(' · ')}</p>
          </Panel>
          <Panel title='Google Maps' description='The address above is the only location setting. No coordinates or marker label are needed.'>
            {office.hasAddress ? <>
              <p className='admin-prose'>{office.address}</p>
              <a className='admin-link' href={office.searchUrl} target='_blank' rel='noopener noreferrer'>Preview this address in Google Maps ↗</a>
              <p className='admin-hint'>Preview uses your current input. Save changes to publish it on Contact.</p>
            </> : <p className='admin-hint'>Enter a street, city and state to enable the map. ZIP helps Google find the right address.</p>}
            {isDemo && <p className='admin-hint'>Demo mode: the public map is labelled as an example location, not a company office.</p>}
          </Panel>
          <Panel title='Social links preview'>
            {socialFields.map(([key, label]) => <p key={key} className='admin-hint'><strong>{label}:</strong> {values.socials[key] || 'Not provided'}</p>)}
          </Panel>
        </aside>
      </fieldset>
    </form>
  </>;
}
