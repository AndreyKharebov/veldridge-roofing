import { useContent } from '../../content/context.js';
import { useEditor } from '../hooks/useEditor.js';
import EditorFeedback from '../components/EditorFeedback.jsx';
import { Button, Checkbox, Field, PageHeading, Panel } from '../components/UI.jsx';

export default function Settings() {
  const { settings } = useContent();
  const [formRef, editor] = useEditor(settings, 'Contact settings');
  const { values, field, update } = editor;
  const nested = (group, name) => ({ name, value: values[group]?.[name] || '', onChange: (event) => update(group, { ...values[group], [name]: event.target.value }) });
  return <>
    <PageHeading title='Contact settings' description='Static settings form. Submitting only logs the entered values.' />
    <form ref={formRef} onSubmit={editor.submit} noValidate>
      <EditorFeedback editor={editor} />
      <fieldset className='admin-editor-grid'>
        <div className='admin-stack'>
          <Panel title='Company & contact' description='Contact fields are empty until the settings API is connected.'>
            <Field label='Company name *' {...field('company')} required maxLength={120} />
            <div className='admin-field-row'><Field label='Phone *' {...field('phone')} type='tel' required maxLength={40} /><Field label='Email *' {...field('email')} type='email' required maxLength={254} /></div>
            <Field label='Street address *' {...field('street')} required maxLength={200} />
            <div className='admin-field-row'><Field label='City *' {...field('city')} required maxLength={100} /><Field label='State *' {...field('state')} required maxLength={100} /></div>
            <Field label='ZIP code *' {...field('zip')} required inputMode='numeric' maxLength={10} />
          </Panel>
          <Panel title='Hours & service area'>
            <Field label='Business hours' {...field('hours')} maxLength={200} />
            <Field label='Additional hours note' {...field('hoursNote')} maxLength={200} />
            <Field label='Time zone' {...field('timeZone')} maxLength={80} hint='For example: America/New_York' />
            <fieldset className='admin-check-group'><legend>Service area</legend><div className='admin-actions'>{[['PA', 'Pennsylvania'], ['NJ', 'New Jersey'], ['DE', 'Delaware']].map(([value, label]) => <Checkbox key={value} label={label} checked={values.serviceStates.includes(value)} onChange={(event) => update('serviceStates', event.target.checked ? [...values.serviceStates, value] : values.serviceStates.filter((state) => state !== value))} />)}</div></fieldset>
          </Panel>
          <Panel title='Office map' description='Coordinate fields only. No map service is connected.'>
            <div className='admin-field-row'><Field label='Latitude' {...nested('map', 'latitude')} inputMode='decimal' /><Field label='Longitude' {...nested('map', 'longitude')} inputMode='decimal' /></div>
            <Field label='Marker label' {...nested('map', 'label')} maxLength={150} />
          </Panel>
          <Panel title='Social links' description='Leave a field empty to keep that link inactive.'>{[['facebook', 'Facebook'], ['instagram', 'Instagram'], ['linkedin', 'LinkedIn'], ['youtube', 'YouTube']].map(([key, label]) => <Field key={key} label={label} {...nested('socials', key)} type='url' maxLength={2000} placeholder='https://…' />)}</Panel>
        </div>
        <aside className='admin-stack'><Panel title='Save settings'><Button variant='primary' type='submit'>Save changes</Button><Button to='/admin'>Cancel</Button><p className='admin-hint'>Console only. Contact and Footer are not updated. Hero remains static.</p></Panel>
          <Panel title='Contact preview'><h3>{values.company}</h3><p className='admin-prose'>{values.phone || 'Phone not provided'}<br />{values.email || 'Email not provided'}<br />{values.street || 'Address not provided'}<br />{[values.city, [values.state, values.zip].filter(Boolean).join(' ')].filter(Boolean).join(', ')}</p><p className='admin-hint'>{values.hours}<br />{values.hoursNote}</p><p>{values.serviceStates.join(' · ')}</p></Panel>
          <Panel title='Static preview'><p>Only the open form holds your input. Nothing is sent, persisted or added to another page.</p></Panel>
        </aside>
      </fieldset>
    </form>
  </>;
}
