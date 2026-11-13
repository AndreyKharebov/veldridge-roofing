import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { useContent } from '../../content/context.js';
import { workspaceApi } from '../../api/workspace.js';
import { newId } from '../../api/media.js';
import { useEditor } from '../hooks/useEditor.js';
import { Badge, Button, Empty, Field, PageHeading, Panel } from '../components/UI.jsx';
import EditorFeedback from '../components/EditorFeedback.jsx';
import ImageField from '../components/ImageField.jsx';
import { ConfirmDialog } from '../components/Dialog.jsx';
import ArticleDialog from '../../pages/BlogPage/components/ArticleDialog/ArticleDialog.jsx';

export function NewsList() {
  const { articles,categories } = useContent(); const [status,setStatus] = useState('all');
  const visible = articles.filter((a) => status === 'all' || a.status === status);
  return <><PageHeading title='News' description='Write helpful articles and keep your roofing journal up to date.'><Button variant='primary' to='/admin/news/new'>+ Add article</Button></PageHeading>
    <div className='admin-actions'>{['all','published','draft','archived'].map((s) => <Button key={s} aria-pressed={status === s} onClick={() => setStatus(s)}>{s === 'all' ? 'All articles' : s[0].toUpperCase()+s.slice(1)}</Button>)}<Button to='/admin/news/categories'>Manage categories</Button></div>
    <div className='admin-table-wrap'><table className='admin-table'><thead><tr><th>Article</th><th>Category</th><th>Date</th><th>Status</th><th>Action</th></tr></thead><tbody>
      {visible.map((a) => <tr key={a.id}><td data-label='Article'><strong>{a.title}</strong></td><td data-label='Category'>{categories.find((c) => c.id === a.categoryId)?.name || 'Uncategorized'}</td>
        <td data-label='Date'>{a.publishedAt || 'Not set'}</td><td data-label='Status'><Badge status={a.status} /></td><td data-label='Action'><Link to={`/admin/news/${a.id}`}>Edit article →</Link></td></tr>)}
    </tbody></table></div>{!visible.length && <Empty title='No articles in this view.'><p>Choose another status or add an article.</p></Empty>}
  </>;
}
export function ArticleEditor() {
  const { id } = useParams(); const { articles } = useContent();
  const initial = id ? articles.find((a) => a.id === id) : { title:'',summary:'',imageId:null,imageAlt:'',publishedAt:new Date().toISOString().slice(0,10),categoryId:'',status:'draft',revision:0,sections:[{id:newId('section'),heading:'',body:''}],source:{label:'',url:''} };
  if (!initial) return <Empty title='Article not found.'><Button to='/admin/news'>Back to news</Button></Empty>;
  return <ArticleForm key={id || 'new'} initial={initial} />;
}
function ArticleForm({ initial }) {
  const { media,categories } = useContent();
  const [formRef,editor] = useEditor(initial,(values) => workspaceApi.saveRecord('articles',values));
  const { values,field,update,mutation } = editor;
  const [preview,setPreview] = useState(false);
  const [archive,setArchive] = useState(false);
  const setSection = (index,key,value) => update('sections',values.sections.map((section,i) => i === index ? {...section,[key]:value} : section));
  const move = (from,to) => { const copy=[...values.sections]; [copy[from],copy[to]]=[copy[to],copy[from]]; update('sections',copy); };
  const image = media.find((m) => m.id === values.imageId)?.src || '';
  return <><PageHeading title={values.id ? 'Edit article' : 'New article'} description={`${values.title || 'Untitled article'} / ${values.status}`} />
    <form ref={formRef} noValidate onSubmit={editor.submit}><EditorFeedback editor={editor} />
      <fieldset className='admin-editor' disabled={mutation.isPending}><div className='admin-stack'>
        <Panel title='Article details'><Field label='Title *' {...field('title')} maxLength={150} />
          <Field label='Introduction / card excerpt *' multiline rows={3} {...field('summary')} maxLength={600} />
          <Field label='Category' {...field('categoryId')}><option value=''>Uncategorized</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Field>
          <p className='admin-hint'>The same excerpt appears in the list and at the top of the reader.</p>
        </Panel>
        {values.sections.map((section,index) => <Panel key={section.id} title={`Section ${index+1}`}>
          <div className='admin-actions'><span className='admin-hint'>Heading + paragraph</span><span className='admin-spacer' />
            <Button disabled={index === 0} aria-label={`Move section ${index+1} up`} onClick={() => move(index,index-1)}>↑</Button>
            <Button disabled={index === values.sections.length-1} aria-label={`Move section ${index+1} down`} onClick={() => move(index,index+1)}>↓</Button>
            <Button aria-label={`Remove section ${index+1}`} onClick={() => update('sections',values.sections.filter((_,i) => i !== index))}>Remove</Button>
          </div>
          <Field name={`section-heading-${index}`} label='Section heading *' value={section.heading} error={mutation.error?.fields?.[`section-heading-${index}`]} onChange={(event) => setSection(index,'heading',event.target.value)} maxLength={200} />
          <Field name={`section-body-${index}`} label='Paragraph *' multiline rows={6} value={section.body} error={mutation.error?.fields?.[`section-body-${index}`]} onChange={(event) => setSection(index,'body',event.target.value)} maxLength={12000} />
        </Panel>)}
        {mutation.error?.fields?.sections && <p className='admin__field-error'>{mutation.error.fields.sections}</p>}
        <Button disabled={values.sections.length >= 30} onClick={() => update('sections',[...values.sections,{id:newId('section'),heading:'',body:''}])}>+ Add section</Button>
        <Panel title='Further reading' description='Optional source link below the article.'>
          <Field name='sourceLabel' label='Source label' value={values.source.label} error={mutation.error?.fields?.sourceLabel} onChange={(event) => update('source',{...values.source,label:event.target.value})} maxLength={150} />
          <Field name='sourceUrl' label='Source URL' value={values.source.url} error={mutation.error?.fields?.sourceUrl} onChange={(event) => update('source',{...values.source,url:event.target.value})} maxLength={2000} />
        </Panel>
      </div><div className='admin-stack'>
        <Panel title='Publication'><Badge status={values.status} /><Field label='Publication date' type='date' {...field('publishedAt')} />
          <Button disabled={!image || !values.title.trim()} onClick={() => setPreview(true)}>Preview article</Button>
          <Button type='submit'>{mutation.isPending ? 'Saving…' : values.status === 'draft' ? 'Save draft' : 'Save changes'}</Button>
          {values.status !== 'published' && <Button variant='primary' onClick={() => mutation.mutate({...values,status:'published'})}>Publish article</Button>}
          <Button to='/admin/news'>Cancel</Button><p className='admin-hint'>Drafts are visible only in this workspace. Publishing updates Blog and Latest News. The publication date controls sorting, not scheduling.</p>
        </Panel><ImageField editor={editor} title='Article cover' />
        <Panel title='Reader layout'><p>Date → title → introduction → cover → sections → source → Contact CTA</p><p className='admin-hint'>Matches the existing article window. Typography and the closing Contact block stay fixed.</p></Panel>
        {values.id && values.status !== 'archived' && <Panel title='Archive article'><Button variant='danger' onClick={() => setArchive(true)}>Archive article</Button></Panel>}
      </div></fieldset>
    </form>
    {preview && <ArticleDialog id='admin-article-preview' article={{...values,image,publishedAt:values.publishedAt || new Date().toISOString().slice(0,10)}} onClose={() => setPreview(false)} />}
    {archive && <ConfirmDialog title='Archive this article?' danger action='Archive article' pending={mutation.isPending} onClose={() => setArchive(false)} onConfirm={() => mutation.mutate({...values,status:'archived'},{onSuccess:() => setArchive(false)})}><p>The article will be removed from Blog and Latest News. Its content is retained.</p>{mutation.isError && <p role='alert'>{mutation.error.message}</p>}</ConfirmDialog>}
  </>;
}
