import { useState } from 'react';
import { useParams } from 'react-router';
import { useContent } from '../../content/context.js';
import { workspaceApi } from '../../api/workspace.js';
import { newId } from '../../api/media.js';
import { useEditor } from '../hooks/useEditor.js';
import { Badge, Button, Checkbox, Empty, Field, PageHeading, Panel } from '../components/UI.jsx';
import EditorFeedback from '../components/EditorFeedback.jsx';
import StringList from '../components/StringList.jsx';
import MediaPicker from '../components/MediaPicker.jsx';
import { ConfirmDialog } from '../components/Dialog.jsx';
import ProjectDialog from '../../pages/GalleryPage/components/ProjectDialog/ProjectDialog.jsx';
import ProjectPhoto from '../../pages/GalleryPage/components/ProjectPhoto/ProjectPhoto.jsx';

export function ProjectsList() {
  const { projects } = useContent(); const [status,setStatus] = useState('all'); const [page,setPage] = useState(1);
  const filtered = projects.filter((p) => status === 'all' || p.status === status);
  const pages = Math.max(1,Math.ceil(filtered.length/6));
  const currentPage = Math.min(page,pages);
  return <><PageHeading title='Projects' description='Manage your project gallery, photographs and the details behind each roof.'><Button variant='primary' to='/admin/projects/new'>+ Add project</Button></PageHeading>
    <div className='admin-actions'>{['all','published','draft','archived'].map((s) => <Button aria-pressed={status === s} key={s} onClick={() => {setStatus(s);setPage(1);}}>{s === 'all' ? 'All projects' : s[0].toUpperCase()+s.slice(1)}</Button>)}</div>
    <div className='admin-projects'>{filtered.slice((currentPage-1)*6,currentPage*6).map((project) => <Panel key={project.id} className='admin-project-card'>
      {project.image ? <div className='admin-project-card__photo'><ProjectPhoto photo={project.coverPhoto || project.photos[0]} /></div> : <div className='admin-image-placeholder'>No cover selected</div>}
      <div className='admin-project-card__body'><h2>{project.title}</h2><p>{project.categoryLabel} · {project.propertyType}</p>
        <p className='admin-hint'>{project.photos.length} photos</p><Badge status={project.status} /><Button to={`/admin/projects/${project.id}`}>Edit project</Button>
      </div></Panel>)}</div>
    {!filtered.length && <Empty title='No projects in this view.'><Button to='/admin/projects/new'>Add a project</Button></Empty>}
    <div className='admin-actions'><p className='admin-hint'>{filtered.length} projects · Page {currentPage} of {pages}</p><span className='admin-spacer' />
      <Button disabled={currentPage === 1} onClick={() => setPage(currentPage-1)}>Previous</Button><Button disabled={currentPage >= pages} onClick={() => setPage(currentPage+1)}>Next</Button></div>
  </>;
}
export function ProjectEditor() {
  const { id } = useParams(); const { projects } = useContent();
  const initial = id ? projects.find((p) => p.id === id) : {title:'',summary:'',serviceId:'',propertyType:'',property:'',duration:'',material:'',finish:'',photos:[],coverPhotoId:'',work:[''],status:'draft',order:projects.length+1,revision:0,isDemo:true};
  if (!initial) return <Empty title='Project not found.'><Button to='/admin/projects'>Back to projects</Button></Empty>;
  return <ProjectForm key={id || 'new'} initial={initial} />;
}
function ProjectForm({ initial }) {
  const { media,services } = useContent();
  const [formRef,editor] = useEditor(initial,(values) => workspaceApi.saveRecord('projects',values));
  const { values,field,update,mutation } = editor;
  const [picker,setPicker] = useState(false); const [preview,setPreview] = useState(false); const [archive,setArchive] = useState(false);
  const [selectedPhoto,setSelectedPhoto] = useState(initial.photos[0]?.id || '');
  const photos = values.photos.map((photo) => ({...photo,src:media.find((m) => m.id === photo.mediaId)?.src || ''}));
  const photo = photos.find((p) => p.id === selectedPhoto) || photos[0];
  const cover = photos.find((p) => p.id === values.coverPhotoId) || photos[0];
  const service = services.find((s) => s.id === values.serviceId);
  const setPhoto = (key,value) => update('photos',values.photos.map((p) => p.id === photo.id ? {...p,[key]:value} : p));
  const removePhoto = (id) => {
    const next = values.photos.filter((p) => p.id !== id);
    update('photos',next); if (values.coverPhotoId === id) update('coverPhotoId',next[0]?.id || '');
    if (selectedPhoto === id) setSelectedPhoto(next[0]?.id || '');
  };
  const move = (from,to) => { const next = [...values.photos]; [next[from],next[to]]=[next[to],next[from]]; update('photos',next); };
  return <><PageHeading title={values.id ? 'Edit project' : 'New project'} description={`${values.title || 'Untitled project'} / ${values.status}`} />
    <form ref={formRef} onSubmit={editor.submit} noValidate><EditorFeedback editor={editor} />
      <fieldset className='admin-editor' disabled={mutation.isPending}><div className='admin-stack'>
        <Panel title='Project photos' description='Choose one cover. It is used in Gallery cards; all photographs remain in the project viewer.'>
          <div className='admin-dropzone'><p>Add multiple project photos</p><p className='admin-hint'>JPG, PNG or WebP · Up to 10 MB per image · Maximum 20 photos</p>
            <div className='admin-actions'><Button variant='primary' onClick={() => setPicker(true)}>Upload photos</Button><Button onClick={() => setPicker(true)}>Choose from library</Button></div>
          </div>
          {mutation.error?.fields?.photos && <p className='admin__field-error'>{mutation.error.fields.photos}</p>}
          <div className='admin-photo-grid'>{photos.map((p,index) => <div className={`admin-photo-card${values.coverPhotoId === p.id ? ' is-cover' : ''}`} key={p.id}>
            <button type='button' className='admin-photo-select' onClick={() => setSelectedPhoto(p.id)} aria-label={`Edit photo ${index+1}`} aria-pressed={photo?.id === p.id}>
              <ProjectPhoto photo={p} className='admin-photo' />
            </button><p className='admin-hint'>{media.find((m) => m.id === p.mediaId)?.name}</p>
            <Button variant={values.coverPhotoId === p.id ? 'primary' : 'secondary'} onClick={() => update('coverPhotoId',p.id)}>{values.coverPhotoId === p.id ? '✓ Cover photo' : 'Set as cover'}</Button>
            <div className='admin-actions'><Button disabled={!index} aria-label={`Move photo ${index+1} left`} onClick={() => move(index,index-1)}>←</Button><Button disabled={index === photos.length-1} aria-label={`Move photo ${index+1} right`} onClick={() => move(index,index+1)}>→</Button><button type='button' className='admin-text-danger' onClick={() => removePhoto(p.id)}>Remove</button></div>
          </div>)}</div>
          {photo && <><p className='admin-hint'>Editing photo {photos.findIndex((p) => p.id === photo.id)+1}. Select a thumbnail to edit a different photo.</p>
            <Field label='Photo caption' name='photoCaption' value={photo.caption} onChange={(event) => setPhoto('caption',event.target.value)} maxLength={250} />
            <Field label='Image description *' name='photoAlt' value={photo.alt} onChange={(event) => setPhoto('alt',event.target.value)} maxLength={250} /></>}
          {values.isDemo && <p className='admin-hint'>Seed projects use illustrative photographs and crops. Replace them with actual same-project photos before publication.</p>}
        </Panel>
        <Panel title='Project information'><Field label='Project title *' {...field('title')} maxLength={150} />
          <div className='admin-two-columns'><Field label='Service category *' {...field('serviceId')}><option value=''>Choose a service</option>{services.filter((s) => s.status === 'active' || s.id === values.serviceId).map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}</Field>
            <Field label='Property type *' {...field('propertyType')}><option value=''>Choose a type</option>{(service?.propertyTypes || ['Residential','Commercial']).map((s) => <option key={s}>{s}</option>)}</Field></div>
          <Field label='Property description' {...field('property')} maxLength={150} />
          <Field label='Short project summary *' multiline rows={3} {...field('summary')} maxLength={800} />
          <div className='admin-two-columns'><Field label='On-site duration' {...field('duration')} maxLength={150} /><Field label='Main material' {...field('material')} maxLength={150} /></div>
          <Field label='Finish / color' {...field('finish')} maxLength={150} />
          <Checkbox label='Mark as an illustrative / sample project' checked={values.isDemo} onChange={(event) => update('isDemo',event.target.checked)} />
        </Panel><Panel title='What we did' description='Short, factual points shown in the existing project window.'><StringList label='Work item' items={values.work} onChange={(items) => update('work',items)} /></Panel>
      </div><div className='admin-stack'>
        <Panel title='Publication'><Badge status={values.status} /><Field label='Status' {...field('status')}><option value='draft'>Draft</option><option value='published'>Published</option><option value='archived'>Archived</option></Field>
          <Field label='Display order' type='number' min='1' max='9999' {...field('order')} />
          <Button disabled={!photos.length || !values.title.trim()} onClick={() => setPreview(true)}>Preview project</Button>
          <Button variant='primary' type='submit'>{mutation.isPending ? 'Saving…' : 'Save changes'}</Button><Button to='/admin/projects'>Cancel</Button>
          <p className='admin-hint'>Published changes appear in Gallery after saving. Draft projects stay private to this demo workspace.</p>
        </Panel><Panel title='Gallery cover preview'>{cover ? <ProjectPhoto photo={cover} className='admin-cover-photo' /> : <div className='admin-image-placeholder'>Choose a cover photo</div>}
          <p className='admin-eyebrow'>{service?.title || 'Service category'}</p><h3>{values.title || 'Project title'}</h3><p>View Project →</p>
        </Panel>{values.id && values.status !== 'archived' && <Panel title='Archive project'><p className='admin-hint'>Remove the project from the public Gallery without losing its photos or details.</p><Button variant='danger' onClick={() => setArchive(true)}>Archive project</Button></Panel>}
      </div></fieldset>
    </form>
    {picker && <MediaPicker multiple onClose={() => setPicker(false)} onChoose={(ids) => {
      const additions = ids.slice(0,20-values.photos.length).map((id) => ({id:newId('photo'),mediaId:id,caption:'',alt:media.find((m) => m.id === id)?.alt || ''}));
      update('photos',[...values.photos,...additions]); if (!values.coverPhotoId) update('coverPhotoId',additions[0]?.id || '');
      if (!selectedPhoto) setSelectedPhoto(additions[0]?.id || ''); setPicker(false);
    }} />}
    {preview && <ProjectDialog id='admin-project-preview' project={{...values,photos,categoryLabel:service?.title || 'Roofing project'}} onClose={() => setPreview(false)} />}
    {archive && <ConfirmDialog title='Archive this project?' danger action='Archive project' pending={mutation.isPending} onClose={() => setArchive(false)} onConfirm={() => mutation.mutate({...values,status:'archived'},{onSuccess:() => setArchive(false)})}><p>The project will disappear from the public Gallery. Its photos and details are retained.</p>{mutation.isError && <p role='alert'>{mutation.error.message}</p>}</ConfirmDialog>}
  </>;
}
