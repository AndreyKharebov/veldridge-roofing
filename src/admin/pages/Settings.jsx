import { useEffect, useRef, useState } from 'react';
import { useContent } from '../../content/context.js';
import { settingsApi } from '../../lib/settings.js';
import { getOfficeLocation } from '../../utils/officeLocation.js';
import { commonTimeZones, otherTimeZones, readSettings, settingsPayload, settingsSignature, socialFields } from '../../utils/settingsForm.js';
import { Button, Checkbox, Field, Notice, PageHeading, Panel } from '../components/UI.jsx';
import SaveStatus from '../components/SaveStatus.jsx';

const isDemo = import.meta.env.VITE_DEMO_MODE !== 'false';
export default function Settings() {
  const { settings: defaults } = useContent();
  const [values, setValues] = useState(() => readSettings(defaults));
  const [baseline, setBaseline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const running = useRef(false);
  const office = getOfficeLocation(values);
  const changed = baseline !== null && settingsSignature(values) !== baseline;
  const knownZone = !values.timeZone || commonTimeZones.some(([zone]) => zone === values.timeZone) || otherTimeZones.includes(values.timeZone);

  useEffect(() => {
    const controller = new AbortController();
    settingsApi.get({ signal: controller.signal }).then(({ settings }) => {
      if (controller.signal.aborted) return;
      const loaded = readSettings(settings);
      setValues(loaded);
      setBaseline(settingsSignature(loaded));
    }).catch((failure) => {
      if (!controller.signal.aborted) setLoadError(failure.message);
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  const update = (name, value) => {
    setValues((previous) => ({ ...previous, [name]: value }));
    setError(''); setSuccess('');
  };
  const field = (name) => ({ name, value: values[name] ?? '', onChange: (event) => update(name, event.target.value) });
  const socialField = (name) => ({
    name, value: values.socials[name],
    onChange: (event) => {
      const value = event.target.value;
      setValues((previous) => ({ ...previous, socials: { ...previous.socials, [name]: value } }));
      setError(''); setSuccess('');
    },
  });
  const submit = async (event) => {
    event.preventDefault();
    if (running.current || loading || loadError || !changed) return;
    let payload;
    try { payload = settingsPayload(values); }
    catch (failure) { setError(failure.message); return; }
    running.current = true; setSaving(true); setError(''); setSuccess('');
    try {
      const response = await settingsApi.update(payload);
      const saved = readSettings(response.settings);
      setValues(saved); setBaseline(settingsSignature(saved));
      setSuccess('Settings saved. Public contact details have been updated.');
    } catch (failure) {
      setError(failure.status === 401 ? 'Your session expired. Sign in again before saving.' : failure.message);
    } finally { running.current = false; setSaving(false); }
  };

  if (loading) return <div className='content-status'>Loading company settings…</div>;
  if (loadError) return <div className='content-status'><h1>Cannot load company settings.</h1><p>{loadError}</p><Button onClick={() => window.location.reload()}>Retry</Button></div>;
  return <>
    <PageHeading title='Contact settings' description='Manage company information, service area, social links and office address.' />
    <SaveStatus pending={saving} error={error} message={saving ? 'Saving settings…' : success} onDismiss={() => { setError(''); setSuccess(''); }} />
    <form onSubmit={submit}>
      <fieldset className='admin-editor-grid' disabled={saving}>
        <div className='admin-stack'>
          <Panel title='Company & contact' description='The saved address is used for Google Maps and directions.'>
            <Field label='Company name *' {...field('company')} required maxLength={120} />
            <div className='admin-field-row'><Field label='Phone *' {...field('phone')} type='tel' required maxLength={40} /><Field label='Email *' {...field('email')} type='email' required maxLength={254} /></div>
            <Field label='Street address' {...field('street')} maxLength={200} />
            <div className='admin-field-row'><Field label='City' {...field('city')} maxLength={100} /><Field label='State' {...field('state')} maxLength={100} /></div>
            <Field label='ZIP code' {...field('zip')} inputMode='numeric' maxLength={10} />
          </Panel>
          <Panel title='Hours & service area'>
            <Field label='Business hours' {...field('hours')} maxLength={200} />
            <Field label='Additional hours note' {...field('hoursNote')} maxLength={200} />
            <Field label='Time zone' {...field('timeZone')} hint='Choose a region. Daylight-saving rules are handled by its time zone.'>
              <option value=''>Not specified — choose a time zone</option>
              {!knownZone && <option value={values.timeZone}>Current: {values.timeZone}</option>}
              <optgroup label='US & UTC'>{commonTimeZones.map(([zone, label]) => <option key={zone} value={zone}>{label}</option>)}</optgroup>
              {otherTimeZones.length > 0 && <optgroup label='Other regions'>{otherTimeZones.map((zone) => <option key={zone} value={zone}>{zone.replaceAll('_', ' ')}</option>)}</optgroup>}
            </Field>
            <fieldset className='admin-check-group'><legend>Service area</legend><div className='admin-actions'>
              {[['PA', 'Pennsylvania'], ['NJ', 'New Jersey'], ['DE', 'Delaware']].map(([value, label]) => <Checkbox key={value} label={label} checked={values.serviceStates.includes(value)} onChange={(event) => {
                const checked = event.target.checked;
                update('serviceStates', checked ? [...values.serviceStates, value] : values.serviceStates.filter((state) => state !== value));
              }} />)}
            </div></fieldset>
          </Panel>
          <Panel title='Social links' description='Paste a link with or without https://. Leave blank to hide the icon completely.'>
            {socialFields.map(([key, label]) => <Field key={key} label={label} {...socialField(key)} type='text' inputMode='url' autoCapitalize='none' spellCheck={false} maxLength={2000} placeholder={`${key}.com/your-page`} />)}
          </Panel>
        </div>
        <aside className='admin-stack'>
          <Panel title='Save settings'>
            <Button variant='primary' type='submit' disabled={saving || !changed}>{saving ? 'Saving…' : 'Save changes'}</Button>
            <Button to='/admin'>Cancel</Button>
            <p className='admin-hint'>{changed ? 'You have unsaved changes.' : 'All changes saved.'}</p>
            {error && <Notice error>{error}</Notice>}{success && <Notice>{success}</Notice>}
          </Panel>
          <Panel title='Contact preview'><h3>{values.company}</h3><p className='admin-prose'>{values.phone || 'Phone not provided'}<br />{values.email || 'Email not provided'}<br />{values.street || 'Address not provided'}<br />{office.locality}</p><p className='admin-hint'>{values.hours}<br />{values.hoursNote}</p><p>{values.serviceStates.join(' · ')}</p></Panel>
          <Panel title='Google Maps' description='Your saved address determines the map location.'>
            {office.hasAddress ? <><p className='admin-prose'>{office.address}</p><a className='admin-link' href={office.searchUrl} target='_blank' rel='noopener noreferrer'>Preview this address in Google Maps ↗</a><p className='admin-hint'>Save to publish the current input.</p></> : <p className='admin-hint'>Enter a street, city and state. ZIP helps Google find the right address.</p>}
            {isDemo && <p className='admin-hint'>Demo mode: this is an example location, not a company office.</p>}
          </Panel>
          <Panel title='Social links preview'>{socialFields.map(([key, label]) => <p key={key} className='admin-hint'><strong>{label}:</strong> {values.socials[key] || 'Hidden'}</p>)}</Panel>
        </aside>
      </fieldset>
    </form>
  </>;
}
