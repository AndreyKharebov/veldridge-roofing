import { Link, useParams } from 'react-router';
import NotFound from '../../components/feedback/NotFound/NotFound.jsx';
import { useContent } from '../../content/context.js';
import { useEditor } from '../hooks/useEditor.js';
import { Button, Empty, Field, PageHeading, Panel } from '../components/UI.jsx';
import EditorFeedback from '../components/EditorFeedback.jsx';

export default function Categories() {
  const { id } = useParams();
  const { categories, articles } = useContent();
  if (id && id !== 'new') return <NotFound variant='admin' title='Category not found.' description='No category records are connected yet.' returnTo='/admin/news/categories' returnLabel='Back to categories' />;
  return <><PageHeading title='News categories' description='Static category layout. Form submissions only appear in the console.'>
    <div className='admin-actions'><Button to='/admin/news'>← News</Button><Button to='/admin/news/categories/new' variant='primary'>+ Add category</Button></div>
  </PageHeading><div className='admin-editor'><div className='admin-table-wrap'><table className='admin-table'><thead><tr><th>Category</th><th>Articles</th><th>Action</th></tr></thead><tbody>
    {categories.map((category) => <tr key={category.id}><td data-label='Category'>{category.name}</td><td data-label='Articles'>{articles.filter((article) => article.categoryId === category.id).length}</td>
      <td data-label='Action'><Link to={`/admin/news/categories/${category.id}`}>Edit →</Link></td></tr>)}
  </tbody></table></div>
    {id === 'new' ? <CategoryForm /> : <Empty title='No categories yet.'><p>Open the category form to inspect the layout.</p></Empty>}
  </div></>;
}
function CategoryForm() {
  const [formRef, editor] = useEditor({ name: '', description: '' }, 'News category');
  return <form ref={formRef} onSubmit={editor.submit} noValidate className='admin-stack'>
    <EditorFeedback editor={editor} /><fieldset><Panel title='New category'>
      <Field label='Category name *' {...editor.field('name')} maxLength={80} />
      <Field label='Description' {...editor.field('description')} multiline rows={4} maxLength={500} />
      <Button type='submit' variant='primary'>Save category</Button>
      <p className='admin-hint'>No category will be created. Values are logged only.</p>
    </Panel></fieldset>
  </form>;
}
