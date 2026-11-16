import { useState } from 'react';
import { Link, useParams } from 'react-router';
import NotFound from '../../components/feedback/NotFound/NotFound.jsx';
import { useContent } from '../../content/context.js';
import { useEditor } from '../hooks/useEditor.js';
import { Badge, Button, Empty, Field, PageHeading, Panel } from '../components/UI.jsx';
import EditorFeedback from '../components/EditorFeedback.jsx';
import ImageField from '../components/ImageField.jsx';
import ArticleDialog from '../../pages/BlogPage/components/ArticleDialog/ArticleDialog.jsx';

export function NewsList() {
  const { articles, categories } = useContent();
  const [status, setStatus] = useState('all');
  const visible = articles.filter((article) => status === 'all' || article.status === status);
  return <><PageHeading title='News' description='Article list layout. No articles are loaded.'><Button variant='primary' to='/admin/news/new'>+ Add article</Button></PageHeading>
    <div className='admin-actions'>{['all','published','draft','archived'].map((value) => <Button key={value} aria-pressed={status === value} onClick={() => setStatus(value)}>{value === 'all' ? 'All articles' : value[0].toUpperCase()+value.slice(1)}</Button>)}<Button to='/admin/news/categories'>Manage categories</Button></div>
    <div className='admin-table-wrap'><table className='admin-table'><thead><tr><th>Article</th><th>Category</th><th>Date</th><th>Status</th><th>Action</th></tr></thead><tbody>
      {visible.map((article) => <tr key={article.id}><td data-label='Article'><strong>{article.title}</strong></td><td data-label='Category'>{categories.find(({ id }) => id === article.categoryId)?.name || 'Uncategorized'}</td>
        <td data-label='Date'>{article.publishedAt || 'Not set'}</td><td data-label='Status'><Badge status={article.status} /></td><td data-label='Action'><Link to={`/admin/news/${article.id}`}>Edit article →</Link></td></tr>)}
    </tbody></table></div>{!visible.length && <Empty title='No articles yet.'><p>Open the article form to inspect the layout. Submissions only log to the console.</p></Empty>}
  </>;
}
export function ArticleEditor() {
  const { id } = useParams();
  if (id) return <NotFound variant='admin' title='Article not found.' description='No articles are loaded in the static layout.' returnTo='/admin/news' returnLabel='Back to news' />;
  return <ArticleForm />;
}
function ArticleForm() {
  const { categories } = useContent();
  const [formRef, editor] = useEditor({ title:'', summary:'', imageFile:null, imagePreview:'', imageAlt:'', publishedAt:'', categoryId:'', status:'draft', sections:[{id:'section-initial', heading:'', body:''}], source:{label:'', url:''} }, 'Article');
  const { values, field, update } = editor;
  const [preview, setPreview] = useState(false);
  const setSection = (index, key, value) => update('sections', values.sections.map((section, i) => i === index ? {...section, [key]:value} : section));
  const move = (from, to) => { const next = [...values.sections]; [next[from], next[to]] = [next[to], next[from]]; update('sections', next); };
  // The source is plain text while editing; do not render an unsafe link in a preview.
  let source = { label:'', url:'' };
  try {
    const url = new URL(values.source.url);
    if (['http:', 'https:'].includes(url.protocol) && !url.username && !url.password) source = values.source;
  } catch { /* An empty or incomplete URL stays as form input only. */ }
  return <><PageHeading title='New article' description='Static form · Nothing is published or saved.' />
    <form ref={formRef} noValidate onSubmit={editor.submit}><EditorFeedback editor={editor} />
      <fieldset className='admin-editor'><div className='admin-stack'>
        <Panel title='Article details'><Field label='Title *' {...field('title')} maxLength={150} />
          <Field label='Introduction / card excerpt *' multiline rows={3} {...field('summary')} maxLength={600} />
          <Field label='Category' {...field('categoryId')}><option value=''>Uncategorized</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</Field>
          <p className='admin-hint'>The same excerpt appears in the list and at the top of the reader.</p>
        </Panel>
        {values.sections.map((section, index) => <Panel key={section.id} title={`Section ${index+1}`}>
          <div className='admin-actions'><span className='admin-hint'>Heading + paragraph</span><span className='admin-spacer' />
            <Button disabled={index === 0} aria-label={`Move section ${index+1} up`} onClick={() => move(index,index-1)}>↑</Button>
            <Button disabled={index === values.sections.length-1} aria-label={`Move section ${index+1} down`} onClick={() => move(index,index+1)}>↓</Button>
            <Button aria-label={`Remove section ${index+1}`} onClick={() => update('sections',values.sections.filter((_,i) => i !== index))}>Remove</Button>
          </div>
          <Field name={`section-heading-${index}`} label='Section heading *' value={section.heading} onChange={(event) => setSection(index,'heading',event.target.value)} maxLength={200} />
          <Field name={`section-body-${index}`} label='Paragraph *' multiline rows={6} value={section.body} onChange={(event) => setSection(index,'body',event.target.value)} maxLength={12000} />
        </Panel>)}
        <Button disabled={values.sections.length >= 30} onClick={() => update('sections',[...values.sections,{id:crypto.randomUUID(),heading:'',body:''}])}>+ Add section</Button>
        <Panel title='Further reading' description='Optional source link below the article.'>
          <Field name='sourceLabel' label='Source label' value={values.source.label} onChange={(event) => update('source',{...values.source,label:event.target.value})} maxLength={150} />
          <Field name='sourceUrl' label='Source URL' value={values.source.url} onChange={(event) => update('source',{...values.source,url:event.target.value})} maxLength={2000} />
        </Panel>
      </div><div className='admin-stack'>
        <Panel title='Publication'><Badge status={values.status} /><Field label='Publication date' type='date' {...field('publishedAt')} />
          <Field label='Status' {...field('status')}><option value='draft'>Draft</option><option value='published'>Published</option><option value='archived'>Archived</option></Field>
          <Button disabled={!values.imagePreview || !values.title.trim() || !values.publishedAt} onClick={() => setPreview(true)}>Preview article</Button>
          <Button type='submit'>{values.status === 'draft' ? 'Save draft' : 'Save changes'}</Button>
          <Button variant='primary' onClick={() => editor.log({...values,status:'published'})}>Publish article</Button>
          <Button to='/admin/news'>Cancel</Button><p className='admin-hint'>Save and publish only log form data. The article list remains empty.</p>
        </Panel><ImageField editor={editor} title='Article cover' />
        <Panel title='Reader layout'><p>Date → title → introduction → cover → sections → source → Contact CTA</p><p className='admin-hint'>Add a title, date and local cover image to preview your current inputs.</p></Panel>
      </div></fieldset>
    </form>
    {preview && <ArticleDialog id='admin-article-preview' article={{...values, image:values.imagePreview, source}} onClose={() => setPreview(false)} />}
  </>;
}
