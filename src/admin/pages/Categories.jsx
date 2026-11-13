import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate, useParams } from 'react-router';
import { useContent } from '../../content/context.js';
import { workspaceApi } from '../../api/workspace.js';
import { useEditor } from '../hooks/useEditor.js';
import { Button, Empty, Field, Notice, PageHeading, Panel } from '../components/UI.jsx';
import EditorFeedback from '../components/EditorFeedback.jsx';
import { ConfirmDialog } from '../components/Dialog.jsx';
export default function Categories() {
  const { id } = useParams(); const { categories,articles } = useContent();
  const editing = id === 'new' ? {name:'',description:'',revision:0} : categories.find((c) => c.id === id);
  return <><PageHeading title='News categories' description='Organize articles in the workspace. Public Blog stays a simple newest-first list.'>
    <div className='admin-actions'><Button to='/admin/news'>← News</Button><Button to='/admin/news/categories/new' variant='primary'>+ Add category</Button></div>
  </PageHeading><div className='admin-editor'><div className='admin-table-wrap'><table className='admin-table'><thead><tr><th>Category</th><th>Articles</th><th>Action</th></tr></thead><tbody>
    {categories.map((category) => <tr key={category.id}><td data-label='Category'>{category.name}</td><td data-label='Articles'>{articles.filter((a) => a.categoryId === category.id).length}</td>
      <td data-label='Action'><Link to={`/admin/news/categories/${category.id}`}>Edit →</Link></td></tr>)}
  </tbody></table></div>
    {editing ? <CategoryForm key={id} initial={editing} /> : <Empty title={id ? 'Category not found.' : 'Select a category.'}><p>Choose Edit or add a new category.</p></Empty>}
  </div></>;
}
function CategoryForm({ initial }) {
  const navigate = useNavigate(); const { articles } = useContent();
  const [formRef,editor] = useEditor(initial,(values) => workspaceApi.saveRecord('categories',values));
  const [confirm,setConfirm] = useState(false);
  const remove = useMutation({mutationFn:() => workspaceApi.deleteCategory(editor.values.id,editor.values.revision),onSuccess:() => {
    setConfirm(false); navigate('/admin/news/categories');
  }});
  const linked = articles.filter((a) => a.categoryId === editor.values.id).length;
  return <form ref={formRef} onSubmit={editor.submit} noValidate className='admin-stack'>
    <EditorFeedback editor={editor} /><fieldset disabled={editor.mutation.isPending}><Panel title={editor.values.id ? 'Edit category' : 'New category'}>
      <Field label='Category name *' {...editor.field('name')} maxLength={80} />
      <Field label='Description' {...editor.field('description')} multiline rows={4} maxLength={500} />
      <Button type='submit' variant='primary'>{editor.mutation.isPending ? 'Saving…' : 'Save category'}</Button>
      {editor.values.id && <><p className='admin-hint'>{linked} linked articles. Reassign articles before deleting this category.</p>
        <Button variant='danger' onClick={() => setConfirm(true)}>Delete category</Button></>}
    </Panel></fieldset>
    {confirm && <ConfirmDialog title={linked ? 'This category is in use.' : 'Delete this category?'} action={linked ? 'Keep category' : 'Delete category'} danger={!linked} pending={remove.isPending}
      onClose={() => setConfirm(false)} onConfirm={() => linked ? setConfirm(false) : remove.mutate()}>
      <p>{linked ? 'Move linked articles to another category before deleting it.' : 'This action removes the empty category. Articles will not be deleted.'}</p>
      {remove.isError && <Notice error>{remove.error.message}</Notice>}
    </ConfirmDialog>}
  </form>;
}
