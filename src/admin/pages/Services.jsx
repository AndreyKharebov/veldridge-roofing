import { Link, useParams } from 'react-router';
import NotFound from '../../components/feedback/NotFound/NotFound.jsx';
import { useContent } from '../../content/context.js';
import { useEditor } from '../hooks/useEditor.js';
import { Badge, Button, Checkbox, Empty, Field, PageHeading, Panel } from '../components/UI.jsx';
import EditorFeedback from '../components/EditorFeedback.jsx';
import ImageField from '../components/ImageField.jsx';
import StringList from '../components/StringList.jsx';

export function ServicesList() {
  const { services } = useContent();
  return <><PageHeading title='Services' description='Static service layout. No records are loaded or saved.'>
    <Button variant='primary' to='/admin/services/new'>+ Add service</Button></PageHeading>
    <div className='admin-table-wrap'><table className='admin-table'><thead><tr><th>Service</th><th>Property types</th><th>Visibility</th><th>Order</th><th>Action</th></tr></thead>
      <tbody>{services.map((service) => <tr key={service.id}><td data-label='Service'><strong>{service.title}</strong><small>{service.summary}</small></td>
        <td data-label='Property types'>{service.propertyTypes.join(' · ')}</td><td data-label='Visibility'><Badge status={service.status} /></td>
        <td data-label='Order'>{service.order}</td><td data-label='Action'><Link to={`/admin/services/${service.id}`}>Edit service →</Link></td></tr>)}</tbody></table></div>
    {!services.length && <Empty title='No services yet.'><Button to='/admin/services/new'>Open service form</Button></Empty>}
    <p className='admin-hint'>Residential and Commercial are independent choices. Hero images and text remain static.</p>
  </>;
}
export function ServiceEditor() {
  const { id } = useParams();
  if (id) return <NotFound variant='admin' title='Service not found.' description='No service records are connected yet.' returnTo='/admin/services' returnLabel='Back to services' />;
  return <ServiceForm />;
}
function ServiceForm() {
  const [formRef, editor] = useEditor({
    title: '', summary: '', description: '', propertyTypes: [], points: [''],
    imageFile: null, imagePreview: '', imageAlt: '', showOnHome: false,
    group: 'main', status: 'active', order: 1, eyebrow: '', cta: 'Discuss Your Project', tone: 'white',
  }, 'Service');
  const { values, field, update } = editor;
  return <><PageHeading title='New service' description='Prepare a service form. Submitting only logs the entered values.' />
    <form ref={formRef} onSubmit={editor.submit} noValidate><EditorFeedback editor={editor} />
      <fieldset className='admin-editor'><div className='admin-stack'>
        <Panel title='Service details'><Field label='Service name *' {...field('title')} maxLength={100} />
          <Field label='Short description *' multiline rows={3} {...field('summary')} maxLength={500} />
          <Field label='Full description' multiline rows={4} {...field('description')} maxLength={4000} />
          <fieldset className='admin-choice-group'><legend>Property types *</legend><div className='admin-actions'>
            {['Residential', 'Commercial'].map((type) => <Checkbox key={type} name='propertyTypes' label={type} checked={values.propertyTypes.includes(type)}
              onChange={(event) => update('propertyTypes', event.target.checked ? [...values.propertyTypes, type] : values.propertyTypes.filter((value) => value !== type))} />)}
          </div></fieldset>
          <p className='admin-hint'>Select one or both. These describe the properties this service supports.</p>
        </Panel>
        <Panel title='What is included' description='These points belong to the service detail layout.'><StringList label='Point' items={values.points} onChange={(items) => update('points', items)} /></Panel>
        <Panel title='Detail section labels'><Field label='Eyebrow' {...field('eyebrow')} maxLength={100} /><Field label='Contact button label' {...field('cta')} maxLength={80} /></Panel>
      </div><div className='admin-stack'>
        <Panel title='Visibility & order'><Field label='Visibility' {...field('status')}><option value='active'>Active</option><option value='archived'>Archived</option></Field>
          <Field label='Display order' type='number' min='1' max='9999' {...field('order')} />
          <Field label='Services page placement' {...field('group')}><option value='main'>Detailed service section</option><option value='supporting'>Additional care card</option></Field>
          <Checkbox label='Show on Home' checked={values.showOnHome} onChange={(event) => update('showOnHome', event.target.checked)} />
          <Button type='submit' variant='primary'>Save changes</Button><Button to='/admin/services'>Cancel</Button>
          <p className='admin-hint'>Console only. This form does not add services to the website or the admin list.</p>
        </Panel><ImageField editor={editor} title='Service image' />
      </div></fieldset>
    </form>
  </>;
}
