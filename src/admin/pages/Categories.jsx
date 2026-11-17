import { useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { useNewsResource } from '../../hooks/useNewsResource.js';
import { newsApi } from '../../lib/news.js';
import { Button, Empty, Field, Notice, PageHeading, Panel } from '../components/UI.jsx';
import SaveStatus from '../components/SaveStatus.jsx';
import NewsDeleteDialog from '../components/news/NewsDeleteDialog.jsx';
import './News.sass';

export default function Categories() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const { data, loading, error, reload } = useNewsResource('/api/admin/news/categories', true);
  return <div className='news-admin'>
    <PageHeading title='News categories' description='Organize articles. Used categories cannot be deleted.'>
      <div className='admin-actions'><Button to='/admin/news'>Back to news</Button><Button variant='primary' to='/admin/news/categories/new'>+ Add category</Button></div>
    </PageHeading>
    {location.state?.notice && <Notice>{location.state.notice}</Notice>}
    <div className='admin-editor'>
      <div className='admin-stack'>
        {loading && <Panel><p role='status'>Loading categories…</p></Panel>}
        {error && <Notice error>{error}<Button onClick={reload}>Retry</Button></Notice>}
        {!loading && !error && (data.categories.length ? <div className='admin-table-wrap'>
          <table className='admin-table news-admin__table'><thead><tr><th>Category</th><th>Articles</th><th>Actions</th></tr></thead><tbody>
            {data.categories.map((category) => <tr key={category.id}>
              <td data-label='Category'><strong>{category.name}</strong><small>{category.description}</small></td><td data-label='Articles'>{category.count}</td>
              <td data-label='Actions'><div className='admin-actions'><Button to={`/admin/news/categories/${category.id}`}>Edit</Button><Button variant='danger' onClick={() => setSelected(category)}>Delete</Button></div></td>
            </tr>)}
          </tbody></table>
        </div> : <Empty title='No categories yet.'><p>Articles can also be saved as Uncategorized.</p></Empty>)}
      </div>
      {id === 'new' ? <CategoryForm key='new' initial={{ name: '', description: '' }} />
        : id ? <CategoryLoader key={id} id={id} /> : <Panel title='Categories'><p>Create a category or choose Edit. Names must be unique, ignoring case.</p></Panel>}
    </div>
    {selected && <NewsDeleteDialog kind='category' item={selected} onClose={() => setSelected(null)} onDone={() => {
      const deletedId = selected.id; setSelected(null); reload();
      if (id === deletedId) navigate('/admin/news/categories', { replace: true, state: { notice: 'Category deleted.' } });
    }} />}
  </div>;
}
function CategoryLoader({ id }) {
  const { data, loading, error, reload } = useNewsResource(`/api/admin/news/categories/${encodeURIComponent(id)}`);
  if (loading) return <Panel><p role='status'>Loading category…</p></Panel>;
  if (error) return <Notice error>{error}<Button onClick={reload}>Retry</Button><Button to='/admin/news/categories'>Back</Button></Notice>;
  return <CategoryForm initial={data.category} />;
}
function CategoryForm({ initial }) {
  const navigate = useNavigate();
  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const lock = useRef(false);
  const changed = name.trim() !== initial.name || description.trim() !== initial.description;
  const save = async (event) => {
    event.preventDefault();
    if (lock.current || !name.trim() || (initial.id && !changed)) return;
    lock.current = true; setSaving(true); setError('');
    try {
      const data = { name: name.trim(), description: description.trim() };
      if (initial.id) await newsApi.updateCategory(initial.id, { ...data, version: initial.version });
      else await newsApi.createCategory(data);
      navigate('/admin/news/categories', { replace: true, state: { notice: initial.id ? 'Category saved.' : 'Category created.' } });
    } catch (failure) { setError(failure.message); }
    finally { lock.current = false; setSaving(false); }
  };
  return <form className='news-admin__form' onSubmit={save}>
    <fieldset className='news-admin__fieldset' disabled={saving}>
      <Panel title={initial.id ? 'Edit category' : 'New category'}>
        <Field name='name' label='Category name *' value={name} onChange={(event) => { setName(event.target.value); setError(''); }} required maxLength={80} />
        <Field name='description' label='Description' multiline rows={4} value={description} onChange={(event) => { setDescription(event.target.value); setError(''); }} maxLength={500} />
        {error && <Notice error>{error}</Notice>}
        <Button variant='primary' type='submit' disabled={saving || !name.trim() || (Boolean(initial.id) && !changed)}>{saving ? 'Saving…' : 'Save category'}</Button>
        <Button onClick={() => { if (!changed || window.confirm('Discard your unsaved category changes?')) navigate('/admin/news/categories'); }}>Cancel</Button>
      </Panel>
    </fieldset>
    <SaveStatus pending={saving} error={error} message={saving ? 'Saving category…' : ''} />
  </form>;
}
