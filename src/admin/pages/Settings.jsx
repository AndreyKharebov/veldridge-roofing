import { useContent } from '../../content/context.js';
import { workspaceApi } from '../../dev/workspace.js';
import { useEditor } from '../hooks/useEditor.js';
import EditorFeedback from '../components/EditorFeedback.jsx';
import { Button, Checkbox, Field, PageHeading, Panel } from '../components/UI.jsx';

export default function Settings() {
  const { settings } = useContent();
  return <SettingsForm initial={settings} />;
}
function SettingsForm({ initial }) {
  const [formRef,editor] = useEditor(initial,workspaceApi.saveSettings);
  const { values,field,update } = editor;
  const nested = (group,name) => ({name,value:values[group]?.[name] || '',onChange:(event) => update(group,{...values[group],[name]:event.target.value}),error:editor.mutation.error?.fields?.[name]});
  return <>
    <PageHeading title='Contact settings' description='Prepare the Settings payload. Submitting logs it to the browser console; no database writes occur.' />
    <form ref={formRef} onSubmit={editor.submit} noValidate>
      <EditorFeedback editor={editor} />
      <fieldset disabled={editor.mutation.isPending} className='admin-editor-grid'>
        <div className='admin-stack'>
          <Panel title='Company & contact' description='Add your company contact details. Required fields are checked when you save.'>
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
            <fieldset className='admin-check-group'><legend>Service area</legend><div className='admin-actions'>{[['PA','Pennsylvania'],['NJ','New Jersey'],['DE','Delaware']].map(([value,label]) => <Checkbox key={value} label={label} checked={values.serviceStates.includes(value)} onChange={(event) => update('serviceStates',event.target.checked ? [...values.serviceStates,value] : values.serviceStates.filter((s) => s !== value))} />)}</div></fieldset>
          </Panel>
          <Panel title='Office map' description='The current website uses an illustrative map. Coordinates are saved for a future live-map connection, not used as directions.'>
            <div className='admin-field-row'><Field label='Latitude' {...nested('map','latitude')} inputMode='decimal' /><Field label='Longitude' {...nested('map','longitude')} inputMode='decimal' /></div>
            <Field label='Marker label' {...nested('map','label')} maxLength={150} />
            <p className='admin-hint'>A live map is not connected. No office marker is shown until an address is provided.</p>
          </Panel>
          <Panel title='Social links' description='Leave a field empty to keep that link inactive.'>{[['facebook','Facebook'],['instagram','Instagram'],['linkedin','LinkedIn'],['youtube','YouTube']].map(([key,label]) => <Field key={key} label={label} {...nested('socials',key)} type='url' maxLength={2000} placeholder='https://…' />)}</Panel>
        </div>
        <aside className='admin-stack'><Panel title='Save settings'><Button variant='primary' type='submit'>{editor.mutation.isPending ? 'Saving…' : 'Save changes'}</Button><Button to='/admin'>Cancel</Button><p className='admin-hint'>Preview only until the settings endpoint exists. Hero is static.</p></Panel>
          <Panel title='Contact preview'><h3>{values.company}</h3><p className='admin-prose'>{values.phone || 'Phone not provided'}<br />{values.email || 'Email not provided'}<br />{values.street || 'Address not provided'}<br />{[values.city, [values.state,values.zip].filter(Boolean).join(' ')].filter(Boolean).join(', ')}</p><p className='admin-hint'>{values.hours}<br />{values.hoursNote}</p><p>{values.serviceStates.join(' · ')}</p></Panel>
          <Panel title='Local content workspace'><p>Content, images and inquiries are currently stored in this browser only. Express authentication is connected; content endpoints will replace local storage in the next backend stages.</p></Panel>
        </aside>
      </fieldset>
    </form>
  </>;
}
