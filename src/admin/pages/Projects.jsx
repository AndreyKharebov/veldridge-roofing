import { useState } from 'react';
import { useParams } from 'react-router';
import NotFound from '../../components/feedback/NotFound/NotFound.jsx';
import { useContent } from '../../content/context.js';
import { useObjectUrls } from '../../hooks/useObjectUrls.js';
import { useEditor } from '../hooks/useEditor.js';
import { Badge, Button, Empty, Field, PageHeading, Panel } from '../components/UI.jsx';
import EditorFeedback from '../components/EditorFeedback.jsx';
import StringList from '../components/StringList.jsx';
import MediaPicker from '../components/MediaPicker.jsx';
import ProjectDialog from '../../pages/GalleryPage/components/ProjectDialog/ProjectDialog.jsx';
import ProjectPhoto from '../../pages/GalleryPage/components/ProjectPhoto/ProjectPhoto.jsx';

export function ProjectsList() {
  const { projects } = useContent();
  const [status,setStatus] = useState('all');
  const [page,setPage] = useState(1);
  const filtered = projects.filter((project) => status === 'all' || project.status === status);
  const pages = Math.max(1, Math.ceil(filtered.length / 6));
  const currentPage = Math.min(page, pages);
  return <><PageHeading title='Projects' description='Project gallery layout. No projects are loaded.'><Button variant='primary' to='/admin/projects/new'>+ Add project</Button></PageHeading>
    <div className='admin-actions'>{['all','published','draft','archived'].map((value) => <Button aria-pressed={status === value} key={value} onClick={() => {setStatus(value);setPage(1);}}>{value === 'all' ? 'All projects' : value[0].toUpperCase()+value.slice(1)}</Button>)}</div>
    <div className='admin-projects'>{filtered.slice((currentPage-1)*6,currentPage*6).map((project) => <Panel key={project.id} className='admin-project-card'>
      {project.image ? <div className='admin-project-card__photo'><ProjectPhoto photo={project.coverPhoto || project.photos[0]} /></div> : <div className='admin-image-placeholder'>No cover selected</div>}
      <div className='admin-project-card__body'><h2>{project.title}</h2><p>{project.categoryLabel} · {project.propertyType}</p><p className='admin-hint'>{project.photos.length} photos</p><Badge status={project.status} /><Button to={`/admin/projects/${project.id}`}>Edit project</Button></div>
    </Panel>)}</div>
    {!filtered.length && <Empty title='No projects yet.'><Button to='/admin/projects/new'>Open project form</Button></Empty>}
    <div className='admin-actions'><p className='admin-hint'>{filtered.length} projects · Page {currentPage} of {pages}</p><span className='admin-spacer' /><Button disabled={currentPage === 1} onClick={() => setPage(currentPage-1)}>Previous</Button><Button disabled={currentPage >= pages} onClick={() => setPage(currentPage+1)}>Next</Button></div>
  </>;
}
export function ProjectEditor() {
  const { id } = useParams();
  if (id) return <NotFound variant='admin' title='Project not found.' description='No projects are loaded in the static layout.' returnTo='/admin/projects' returnLabel='Back to projects' />;
  return <ProjectForm />;
}
function ProjectForm() {
  const { services } = useContent();
  const [formRef,editor] = useEditor({title:'',summary:'',serviceId:'',propertyType:'',property:'',duration:'',material:'',finish:'',photos:[],coverPhotoId:'',work:[''],status:'draft',order:1}, 'Project');
  const { values,field,update } = editor;
  const [picker,setPicker] = useState(false);
  const [preview,setPreview] = useState(false);
  const [selectedPhoto,setSelectedPhoto] = useState('');
  const urls = useObjectUrls();
  const photos = values.photos;
  const photo = photos.find(({ id }) => id === selectedPhoto) || photos[0];
  const cover = photos.find(({ id }) => id === values.coverPhotoId) || photos[0];
  const service = services.find(({ id }) => id === values.serviceId);
  const setPhoto = (key,value) => update('photos',photos.map((item) => item.id === photo.id ? {...item,[key]:value} : item));
  const removePhoto = (id) => {
    urls.release(photos.find((item) => item.id === id)?.src);
    const next = photos.filter((item) => item.id !== id);
    update('photos',next);
    if (values.coverPhotoId === id) update('coverPhotoId',next[0]?.id || '');
    if (selectedPhoto === id) setSelectedPhoto(next[0]?.id || '');
  };
  const move = (from,to) => { const next = [...photos]; [next[from],next[to]]=[next[to],next[from]]; update('photos',next); };
  const addPhotos = (files) => {
    const additions = files.slice(0,20-photos.length).map((file) => ({id:crypto.randomUUID(), file, src:urls.create(file), caption:'',alt:''}));
    update('photos',[...photos,...additions]);
    if (!values.coverPhotoId) update('coverPhotoId',additions[0]?.id || '');
    if (!selectedPhoto) setSelectedPhoto(additions[0]?.id || '');
    setPicker(false);
  };
  return <><PageHeading title='New project' description='Static form · Nothing is published or saved.' />
    <form ref={formRef} onSubmit={editor.submit} noValidate><EditorFeedback editor={editor} />
      <fieldset className='admin-editor'><div className='admin-stack'>
        <Panel title='Project photos' description='Choose one cover for the local preview. Files stay only in this open form.'>
          <div className='admin-dropzone'><p>Add multiple project photos</p><p className='admin-hint'>JPG, PNG or WebP · Up to 10 MB per image · Maximum 20 photos</p><div className='admin-actions'><Button variant='primary' disabled={photos.length >= 20} onClick={() => setPicker(true)}>Choose local photos</Button></div></div>
          <div className='admin-photo-grid'>{photos.map((item,index) => <div className={`admin-photo-card${values.coverPhotoId === item.id ? ' is-cover' : ''}`} key={item.id}>
            <button type='button' className='admin-photo-select' onClick={() => setSelectedPhoto(item.id)} aria-label={`Edit photo ${index+1}`} aria-pressed={photo?.id === item.id}><ProjectPhoto photo={item} className='admin-photo' /></button>
            <p className='admin-hint'>{item.file.name}</p><Button variant={values.coverPhotoId === item.id ? 'primary' : 'secondary'} onClick={() => update('coverPhotoId',item.id)}>{values.coverPhotoId === item.id ? '✓ Cover photo' : 'Set as cover'}</Button>
            <div className='admin-actions'><Button disabled={!index} aria-label={`Move photo ${index+1} left`} onClick={() => move(index,index-1)}>←</Button><Button disabled={index === photos.length-1} aria-label={`Move photo ${index+1} right`} onClick={() => move(index,index+1)}>→</Button><button type='button' className='admin-text-danger' onClick={() => removePhoto(item.id)}>Remove</button></div>
          </div>)}</div>
          {photo && <><p className='admin-hint'>Editing photo {photos.findIndex(({ id }) => id === photo.id)+1}.</p><Field label='Photo caption' name='photoCaption' value={photo.caption} onChange={(event) => setPhoto('caption',event.target.value)} maxLength={250} /><Field label='Image description *' name='photoAlt' value={photo.alt} onChange={(event) => setPhoto('alt',event.target.value)} maxLength={250} /></>}
        </Panel>
        <Panel title='Project information'><Field label='Project title *' {...field('title')} maxLength={150} />
          <div className='admin-two-columns'><Field label='Service category *' {...field('serviceId')}><option value=''>No services connected yet</option>{services.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</Field><Field label='Property type *' {...field('propertyType')}><option value=''>Choose a type</option>{['Residential','Commercial'].map((type) => <option key={type}>{type}</option>)}</Field></div>
          <Field label='Property description' {...field('property')} maxLength={150} /><Field label='Short project summary *' multiline rows={3} {...field('summary')} maxLength={800} />
          <div className='admin-two-columns'><Field label='On-site duration' {...field('duration')} maxLength={150} /><Field label='Main material' {...field('material')} maxLength={150} /></div><Field label='Finish / color' {...field('finish')} maxLength={150} />
        </Panel><Panel title='What we did' description='Points shown in the project window.'><StringList label='Work item' items={values.work} onChange={(items) => update('work',items)} /></Panel>
      </div><div className='admin-stack'>
        <Panel title='Publication'><Badge status={values.status} /><Field label='Status' {...field('status')}><option value='draft'>Draft</option><option value='published'>Published</option><option value='archived'>Archived</option></Field><Field label='Display order' type='number' min='1' max='9999' {...field('order')} />
          <Button disabled={!photos.length || !values.title.trim()} onClick={() => setPreview(true)}>Preview project</Button><Button variant='primary' type='submit'>Save changes</Button><Button to='/admin/projects'>Cancel</Button><p className='admin-hint'>Submission only logs the current fields. It does not add a project.</p>
        </Panel><Panel title='Gallery cover preview'>{cover ? <ProjectPhoto photo={cover} className='admin-cover-photo' /> : <div className='admin-image-placeholder'>Choose a cover photo</div>}<p className='admin-eyebrow'>{service?.title || 'Service category'}</p><h3>{values.title || 'Project title'}</h3><p>View Project →</p></Panel>
      </div></fieldset>
    </form>
    {picker && <MediaPicker multiple onClose={() => setPicker(false)} onChoose={addPhotos} />}
    {preview && <ProjectDialog id='admin-project-preview' project={{...values,categoryLabel:service?.title || 'Service category'}} onClose={() => setPreview(false)} />}
  </>;
}
