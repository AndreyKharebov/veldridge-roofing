import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { useContent } from '../../content/context.js';
import { workspaceApi } from '../../api/workspace.js';
import { useEditor } from '../hooks/useEditor.js';
import { Badge, Button, Checkbox, Empty, Field, PageHeading, Panel } from '../components/UI.jsx';
import EditorFeedback from '../components/EditorFeedback.jsx';
import ImageField from '../components/ImageField.jsx';
import StringList from '../components/StringList.jsx';
import { ConfirmDialog } from '../components/Dialog.jsx';

export function ServicesList() {
  const { services } = useContent();
  return <><PageHeading title='Services' description='Manage your service categories and the property types they support.'>
    <Button variant='primary' to='/admin/services/new'>+ Add service</Button></PageHeading>
    <div className='admin-table-wrap'><table className='admin-table'><thead><tr><th>Service</th><th>Property types</th><th>Visibility</th><th>Order</th><th>Action</th></tr></thead>
      <tbody>{services.map((s) => <tr key={s.id}><td data-label='Service'><strong>{s.title}</strong><small>{s.summary}</small></td>
        <td data-label='Property types'>{s.propertyTypes.join(' · ')}</td><td data-label='Visibility'><Badge status={s.status} /></td>
        <td data-label='Order'>{s.order}</td><td data-label='Action'><Link to={`/admin/services/${s.id}`}>Edit service →</Link></td></tr>)}</tbody></table></div>
    {!services.length && <Empty><Button to='/admin/services/new'>Create your first service</Button></Empty>}
    <p className='admin-hint'>Residential and Commercial are independent choices. Hero images and text remain static.</p>
  </>;
}
export function ServiceEditor() {
  const { id } = useParams(); const { services } = useContent();
  const initial = id ? services.find((s) => s.id === id) : {
    title:'',summary:'',description:'',propertyTypes:[],points:[''],imageId:null,homeImageId:null,imageAlt:'',
    showOnHome:false,group:'main',status:'active',order:services.length+1,revision:0,eyebrow:'',cta:'Discuss Your Project',tone:'white',
  };
  if (!initial) return <Empty title='Service not found.'><Button to='/admin/services'>Back to services</Button></Empty>;
  return <ServiceForm key={id || 'new'} initial={initial} />;
}
function ServiceForm({ initial }) {
  const [formRef,editor] = useEditor(initial,(values) => workspaceApi.saveRecord('services',values));
  const [archive,setArchive] = useState(false);
  const { values,field,update,mutation } = editor;
  return <><PageHeading title={values.id ? 'Edit service' : 'New service'} description={values.id ? `${values.title} / Service category` : 'Create a service for your website, projects and contact form.'} />
    <form ref={formRef} onSubmit={editor.submit} noValidate><EditorFeedback editor={editor} />
      <fieldset disabled={mutation.isPending} className='admin-editor'><div className='admin-stack'>
        <Panel title='Service details'><Field label='Service name *' {...field('title')} maxLength={100} />
          <Field label='Short description *' multiline rows={3} {...field('summary')} maxLength={500} />
          <Field label='Full description' multiline rows={4} {...field('description')} maxLength={4000} />
          <fieldset className='admin-choice-group'><legend>Property types *</legend><div className='admin-actions'>
            {['Residential','Commercial'].map((type) => <Checkbox key={type} name='propertyTypes' label={type} checked={values.propertyTypes.includes(type)}
              onChange={(event) => update('propertyTypes',event.target.checked ? [...values.propertyTypes,type] : values.propertyTypes.filter((t) => t !== type))} />)}
          </div>{mutation.error?.fields?.propertyTypes && <p className='admin__field-error'>{mutation.error.fields.propertyTypes}</p>}</fieldset>
          <p className='admin-hint'>Select one or both. These describe the properties this service supports.</p>
        </Panel>
        <Panel title='What is included' description='These points appear in the service detail section.'><StringList label='Point' items={values.points} onChange={(items) => update('points',items)} /></Panel>
        <Panel title='Detail section labels'><Field label='Eyebrow' {...field('eyebrow')} maxLength={100} /><Field label='Contact button label' {...field('cta')} maxLength={80} /></Panel>
      </div><div className='admin-stack'>
        <Panel title='Visibility & order'><Field label='Visibility' {...field('status')}><option value='active'>Active</option><option value='archived'>Archived</option></Field>
          <Field label='Display order' type='number' min='1' max='9999' {...field('order')} />
          <Field label='Services page placement' {...field('group')}><option value='main'>Detailed service section</option><option value='supporting'>Additional care card</option></Field>
          <Checkbox label='Show on Home' checked={values.showOnHome} onChange={(event) => update('showOnHome',event.target.checked)} />
          <Button type='submit' variant='primary'>{mutation.isPending ? 'Saving…' : 'Save changes'}</Button><Button to='/admin/services'>Cancel</Button>
          <p className='admin-hint'>Shown on Services and in the Contact service selector. Archived services keep their project history.</p>
        </Panel><ImageField editor={editor} title='Service image' />
        {values.id && values.status !== 'archived' && <Panel title='Archive service'><p className='admin-hint'>Hide this service without deleting linked project history.</p><Button variant='danger' onClick={() => setArchive(true)}>Archive service</Button></Panel>}
      </div></fieldset>
    </form>
    {archive && <ConfirmDialog title='Archive this service?' action='Archive service' danger pending={mutation.isPending} onClose={() => setArchive(false)} onConfirm={() => {
      mutation.mutate({...values,status:'archived'},{onSuccess:() => setArchive(false)});
    }}><p>The service will be hidden from Services, Home and new inquiries. Existing projects and inquiries are retained.</p>{mutation.isError && <p role='alert'>{mutation.error.message}</p>}</ConfirmDialog>}
  </>;
}
