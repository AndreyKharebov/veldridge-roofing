import { useEffect, useState } from 'react';

import { useContent } from '../../content/context.js';
import { settingsApi } from '../../lib/settings.js';

import {
  Button,
  Checkbox,
  Field,
  Notice,
  PageHeading,
  Panel,
} from '../components/UI.jsx';

const socialFields = [
  ['facebook', 'Facebook'],
  ['instagram', 'Instagram'],
  ['linkedin', 'LinkedIn'],
  ['youtube', 'YouTube'],
];

const emptyMap = {
  latitude: '',
  longitude: '',
  label: '',
};

export default function Settings() {
  const { settings: defaults } = useContent();

  const [values, setValues] = useState(() => structuredClone(defaults));

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let active = true;

    settingsApi
      .get()
      .then(({ settings }) => {
        if (!active) return;

        setValues((previous) => ({
          ...previous,

          company: settings.company ?? '',
          phone: settings.phone ?? '',
          email: settings.email ?? '',
          street: settings.street ?? '',
          city: settings.city ?? '',
          state: settings.state ?? '',
          zip: settings.zip ?? '',
          hours: settings.hours ?? '',
          hoursNote: settings.hoursNote ?? '',
          timeZone: settings.timeZone ?? '',

          serviceStates: Array.isArray(settings.serviceStates)
            ? settings.serviceStates
            : [],

          socials: {
            ...previous.socials,
            ...(settings.socials ?? {}),
          },

          map: {
            ...emptyMap,
            ...(settings.map ?? {}),
          },
        }));
      })
      .catch((failure) => {
        if (active) {
          setLoadError(failure.message);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const update = (name, value) => {
    setValues((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError('');
    setSuccess('');
  };

  const field = (name) => ({
    name,
    value: values[name] ?? '',
    onChange: (event) => {
      update(name, event.target.value);
    },
  });

  const socialField = (name) => ({
    name,
    value: values.socials?.[name] ?? '',
    onChange: (event) => {
      update('socials', {
        ...values.socials,
        [name]: event.target.value,
      });
    },
  });

  const mapField = (name) => ({
    name,
    value: values.map?.[name] ?? '',
    onChange: (event) => {
      update('map', {
        ...values.map,
        [name]: event.target.value,
      });
    },
  });

  const submit = async (event) => {
    event.preventDefault();

    if (saving || loading || loadError) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await settingsApi.update({
        company: values.company,
        phone: values.phone,
        email: values.email,
        street: values.street,
        city: values.city,
        state: values.state,
        zip: values.zip,
        hours: values.hours,
        hoursNote: values.hoursNote,
        timeZone: values.timeZone,
        serviceStates: values.serviceStates,
        socials: values.socials,

        map: {
          latitude: values.map.latitude,
          longitude: values.map.longitude,
          label: values.map.label,
        },
      });

      setValues((previous) => ({
        ...previous,
        ...response.settings,

        socials: {
          ...previous.socials,
          ...(response.settings.socials ?? {}),
        },

        map: {
          ...emptyMap,
          ...(response.settings.map ?? {}),
        },
      }));

      setSuccess('Settings saved successfully.');
    } catch (failure) {
      setError(failure.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <main className='content-status'>Loading company settings…</main>;
  }

  if (loadError) {
    return (
      <main className='content-status'>
        <h1>Cannot load company settings.</h1>
        <p>{loadError}</p>

        <Button onClick={() => window.location.reload()}>Retry</Button>
      </main>
    );
  }

  return (
    <>
      <PageHeading
        title='Contact settings'
        description='Manage company information, service area, social links and office location.'
      />

      <form onSubmit={submit}>
        {error && <Notice error>{error}</Notice>}
        {success && <Notice>{success}</Notice>}

        <fieldset className='admin-editor-grid' disabled={saving}>
          <div className='admin-stack'>
            <Panel
              title='Company & contact'
              description='Company contacts and address are stored in MongoDB.'
            >
              <Field
                label='Company name *'
                {...field('company')}
                required
                maxLength={120}
              />

              <div className='admin-field-row'>
                <Field
                  label='Phone *'
                  {...field('phone')}
                  type='tel'
                  required
                  maxLength={40}
                />

                <Field
                  label='Email *'
                  {...field('email')}
                  type='email'
                  required
                  maxLength={254}
                />
              </div>

              <Field
                label='Street address'
                {...field('street')}
                maxLength={200}
              />

              <div className='admin-field-row'>
                <Field label='City' {...field('city')} maxLength={100} />

                <Field label='State' {...field('state')} maxLength={100} />
              </div>

              <Field
                label='ZIP code'
                {...field('zip')}
                inputMode='numeric'
                maxLength={10}
              />
            </Panel>

            <Panel
              title='Hours & service area'
              description='Business hours and service states are saved to MongoDB.'
            >
              <Field
                label='Business hours'
                {...field('hours')}
                maxLength={200}
              />

              <Field
                label='Additional hours note'
                {...field('hoursNote')}
                maxLength={200}
              />

              <Field
                label='Time zone'
                {...field('timeZone')}
                maxLength={80}
                hint='For example: America/New_York'
              />

              <fieldset className='admin-check-group'>
                <legend>Service area</legend>

                <div className='admin-actions'>
                  {[
                    ['PA', 'Pennsylvania'],
                    ['NJ', 'New Jersey'],
                    ['DE', 'Delaware'],
                  ].map(([value, label]) => (
                    <Checkbox
                      key={value}
                      label={label}
                      checked={values.serviceStates.includes(value)}
                      onChange={(event) => {
                        const checked = event.target.checked;

                        update(
                          'serviceStates',
                          checked
                            ? [...values.serviceStates, value]
                            : values.serviceStates.filter(
                                (state) => state !== value,
                              ),
                        );
                      }}
                    />
                  ))}
                </div>
              </fieldset>
            </Panel>

            <Panel
              title='Office map'
              description='Enter both coordinates in decimal degrees, or leave both empty.'
            >
              <div className='admin-field-row'>
                <Field
                  label='Latitude'
                  {...mapField('latitude')}
                  inputMode='decimal'
                  maxLength={32}
                  placeholder='39.9526'
                  hint='Between -90 and 90'
                />

                <Field
                  label='Longitude'
                  {...mapField('longitude')}
                  inputMode='decimal'
                  maxLength={32}
                  placeholder='-75.1636'
                  hint='Between -180 and 180'
                />
              </div>

              <Field
                label='Marker label'
                {...mapField('label')}
                maxLength={150}
                placeholder='Office name'
              />

              <p className='admin-hint'>
                Coordinates are stored for future real-map integration. The
                current public map is illustrative.
              </p>
            </Panel>

            <Panel
              title='Social links'
              description='Enter a full URL. Leave blank to hide a social link.'
            >
              {socialFields.map(([key, label]) => (
                <Field
                  key={key}
                  label={label}
                  {...socialField(key)}
                  type='url'
                  maxLength={2000}
                  placeholder='https://…'
                />
              ))}
            </Panel>
          </div>

          <aside className='admin-stack'>
            <Panel title='Save settings'>
              <Button variant='primary' type='submit' disabled={saving}>
                {saving ? 'Saving…' : 'Save changes'}
              </Button>

              <Button to='/admin'>Cancel</Button>

              <p className='admin-hint'>
                All contact settings, office coordinates and social links are
                saved to MongoDB.
              </p>
            </Panel>

            <Panel title='Contact preview'>
              <h3>{values.company}</h3>

              <p className='admin-prose'>
                {values.phone || 'Phone not provided'}
                <br />
                {values.email || 'Email not provided'}
                <br />
                {values.street || 'Address not provided'}
                <br />
                {[
                  values.city,
                  [values.state, values.zip].filter(Boolean).join(' '),
                ]
                  .filter(Boolean)
                  .join(', ')}
              </p>

              <p className='admin-hint'>
                {values.hours}
                <br />
                {values.hoursNote}
              </p>

              <p>{values.serviceStates.join(' · ')}</p>
            </Panel>

            <Panel title='Office location preview'>
              <p className='admin-hint'>
                <strong>Latitude:</strong>{' '}
                {values.map.latitude || 'Not provided'}
              </p>

              <p className='admin-hint'>
                <strong>Longitude:</strong>{' '}
                {values.map.longitude || 'Not provided'}
              </p>

              <p className='admin-hint'>
                <strong>Marker:</strong> {values.map.label || 'Not provided'}
              </p>
            </Panel>

            <Panel title='Social links preview'>
              {socialFields.map(([key, label]) => (
                <p key={key} className='admin-hint'>
                  <strong>{label}:</strong>{' '}
                  {values.socials?.[key] || 'Not provided'}
                </p>
              ))}
            </Panel>
          </aside>
        </fieldset>
      </form>
    </>
  );
}
