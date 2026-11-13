import { useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useContent } from '../../content/context.js';
import { workspaceApi, mockConfig } from '../../api/workspace.js';
import { downloadBackup, exportBackup, parseBackup, importBackup } from '../../api/backup.js';
import { useEditor } from '../hooks/useEditor.js';
import EditorFeedback from '../components/EditorFeedback.jsx';
import { Button, Checkbox, Field, Notice, PageHeading, Panel } from '../components/UI.jsx';
import { ConfirmDialog } from '../components/Dialog.jsx';

function DemoData({ onReplaced }) {
  const [confirmation,setConfirmation] = useState(null);
  const [message,setMessage] = useState('');
  const [error,setError] = useState('');
  const fileRef = useRef(null);
  const client = useQueryClient();
  const backup = useMutation({mutationFn:exportBackup,onSuccess:(blob) => {downloadBackup(blob);setMessage('Content backup exported. Inquiries and their attachments are not included.');}});
  const parse = useMutation({mutationFn:parseBackup,onSuccess:(data) => setConfirmation({kind:'import',data})});
  const change = useMutation({mutationFn:async () => confirmation.kind === 'reset' ? workspaceApi.reset() : importBackup(confirmation.data),onSuccess:async () => {
    setMessage(confirmation.kind === 'reset' ? 'Demo data reset locally.' : 'Content imported. Your inquiry inbox was not changed.');
    setConfirmation(null);await client.invalidateQueries({queryKey:['workspace']});onReplaced();
  }});
  return <Panel title='Demo data' description='Back up content and public images before replacing them. Inquiries and customer attachments are deliberately excluded from content backups.'>
    <div className='admin-actions'>
      <Button disabled={backup.isPending} onClick={() => backup.mutate()}>{backup.isPending ? 'Exporting…' : 'Export content backup'}</Button>
      <input ref={fileRef} type='file' accept='.json,application/json' hidden aria-label='Import content backup' onChange={(event) => {const file = event.target.files?.[0];event.target.value = '';if (file) parse.mutate(file);}} />
      <Button disabled={parse.isPending} onClick={() => fileRef.current.click()}>{parse.isPending ? 'Validating backup…' : 'Import content backup'}</Button>
      <Button variant='danger' onClick={() => setConfirmation({kind:'reset'})}>Reset demo data</Button>
    </div>
    {message && <Notice>{message}</Notice>}{[backup,parse].filter((mutation) => mutation.isError).map((mutation,i) => <Notice key={i} error>{mutation.error.message}</Notice>)}
    <p className='admin-hint'>JSON backup up to 100 MB. Uploaded public images are embedded; bundled images use stable references. Import replaces content but keeps your inbox. Reset replaces everything, including inquiries.</p>
    <details className='admin-demo-tools'><summary>Demo testing</summary><Button onClick={() => {mockConfig.failNextWrite = true;setError('The next save or form submission will simulate a failure. No existing data will be lost.');}}>Simulate next save error</Button>{error && <p role='status'>{error}</p>}</details>
    {confirmation && <ConfirmDialog title={confirmation.kind === 'reset' ? 'Reset all demo data?' : 'Replace local content?'} action={confirmation.kind === 'reset' ? 'Reset demo data' : 'Import content'} danger pending={change.isPending} onClose={() => {setConfirmation(null);change.reset();}} onConfirm={() => change.mutate()}>
      <p>{confirmation.kind === 'reset' ? 'This removes local edits, uploaded images and inquiries and restores the original demo content. This action cannot be undone without a backup.' : 'This replaces services, articles, projects, contact settings and public images. Your inquiry inbox and its attachments stay intact.'}</p>
      {change.isError && <Notice error>{change.error.message}</Notice>}
    </ConfirmDialog>}
  </Panel>;
}
export default function Settings() {
  const { settings } = useContent();
  const [generation,setGeneration] = useState(0);
  return <SettingsForm key={generation} initial={settings} onReplaced={() => setGeneration((value) => value+1)} />;
}
function SettingsForm({ initial, onReplaced }) {
  const [formRef,editor] = useEditor(initial,workspaceApi.saveSettings);
  const { values,field,update } = editor;
  const nested = (group,name) => ({name,value:values[group]?.[name] || '',onChange:(event) => update(group,{...values[group],[name]:event.target.value}),error:editor.mutation.error?.fields?.[name]});
  return <>
    <PageHeading title='Contact settings' description='Keep company details consistent across Contact and the website Footer.' />
    <form ref={formRef} onSubmit={editor.submit} noValidate>
      <EditorFeedback editor={editor} />
      <fieldset disabled={editor.mutation.isPending} className='admin-editor-grid'>
        <div className='admin-stack'>
          <Panel title='Company & contact' description='Demonstration values. Replace these with confirmed details before launch.'>
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
            <div className='admin-field-row'><Field label='Latitude (sample)' {...nested('map','latitude')} inputMode='decimal' /><Field label='Longitude (sample)' {...nested('map','longitude')} inputMode='decimal' /></div>
            <Field label='Marker label' {...nested('map','label')} maxLength={150} />
            <p className='admin-hint'>Sample pin only. A live map is not connected in this demo.</p>
          </Panel>
          <Panel title='Social links' description='Leave a field empty to keep that link inactive.'>{[['facebook','Facebook'],['instagram','Instagram'],['linkedin','LinkedIn'],['youtube','YouTube']].map(([key,label]) => <Field key={key} label={label} {...nested('socials',key)} type='url' maxLength={2000} placeholder='https://…' />)}</Panel>
        </div>
        <aside className='admin-stack'><Panel title='Save settings'><Button variant='primary' type='submit'>{editor.mutation.isPending ? 'Saving…' : 'Save changes'}</Button><Button to='/admin'>Cancel</Button><p className='admin-hint'>Shared by Contact and Footer. Hero content is not editable here.</p></Panel>
          <Panel title='Contact preview'><h3>{values.company}</h3><p className='admin-prose'>{values.phone}<br />{values.email}<br />{values.street}<br />{values.city}, {values.state} {values.zip}</p><p className='admin-hint'>{values.hours}<br />{values.hoursNote}</p><p>{values.serviceStates.join(' · ')}</p></Panel>
          <Panel title='Demo data reminder'><p>Use sample customer information only. A real backend is required for shared access, secure login and incoming inquiries from other visitors.</p></Panel>
        </aside>
      </fieldset>
    </form>
    <DemoData onReplaced={onReplaced} />
  </>;
}
