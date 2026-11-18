import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { useNewsResource } from '../../hooks/useNewsResource.js';
import { newsApi } from '../../lib/news.js';
import { Button, Empty, Field, Notice, PageHeading, Panel } from '../components/UI.jsx';
import { DangerZone, SaveBar } from '../components/Workspace.jsx';
import SaveStatus from '../components/SaveStatus.jsx';
import NewsDeleteDialog from '../components/news/NewsDeleteDialog.jsx';
import './News.sass';

export default function Categories() {
  const { id } = useParams();
  if (id === 'new') return <CategoryForm key='new' initial={{ name: '', description: '' }} />;
  return id ? <CategoryLoader key={id} id={id} /> : <CategoryList />;
}

function CategoryList() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [notice, setNotice] = useState(location.state?.notice || '');
  const { data, loading, error, reload } = useNewsResource('/api/admin/news/categories', true);
  const items = data?.categories ?? [];
  useEffect(() => {
    if (location.state?.notice) navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);
  return <div className='news-admin'>
    <PageHeading title='News categories' description='Organize articles. Used categories cannot be deleted.' backTo='/admin/news' backLabel='News'>
      <div className='admin-actions'><Button disabled={loading || Boolean(selected)} onClick={reload}>Refresh</Button><Button variant='primary' to='/admin/news/categories/new'>+ Add category</Button></div>
    </PageHeading>
    {notice && <Notice>{notice}</Notice>}
    {loading && <Panel><p role='status'>Loading categories…</p></Panel>}
    {error && <Notice error><p>{error}</p><Button onClick={reload}>Retry</Button></Notice>}
    {!loading && !error && (items.length ? <div className='admin-table-wrap'>
      <table className='admin-table news-admin__table'><thead><tr><th>Category</th><th>Articles</th><th>Actions</th></tr></thead><tbody>
        {items.map((category) => <tr key={category.id}>
          <td data-label='Category'><strong>{category.name}</strong><small>{category.description}</small></td>
          <td data-label='Articles'>{category.count}</td>
          <td data-label='Actions'><div className='admin-actions'><Button to={`/admin/news/categories/${category.id}`}>Edit</Button><Button variant='danger' onClick={() => setSelected(category)}>Delete</Button></div></td>
        </tr>)}
      </tbody></table>
    </div> : <Empty title='No categories yet.'><p>Articles can also be saved as Uncategorized.</p></Empty>)}
    {!loading && !error && <p className='admin-hint'>{items.length} categories</p>}
    {selected && <NewsDeleteDialog kind='category' item={selected} onClose={() => setSelected(null)} onDone={() => {
      setSelected(null); setNotice('Category deleted.'); reload();
    }} />}
  </div>;
}

function CategoryLoader({ id }) {
  const { data, loading, error, reload } = useNewsResource(`/api/admin/news/categories/${encodeURIComponent(id)}`);
  if (loading) return <Panel><p role='status'>Loading category…</p></Panel>;
  if (error) return <Notice error><p>{error}</p><Button onClick={reload}>Retry</Button><Button to='/admin/news/categories'>Back to categories</Button></Notice>;
  return <CategoryForm initial={data.category} />;
}

function CategoryForm({ initial }) {
  const navigate = useNavigate();
  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description);
  const [saving, setSaving] = useState(false);
  const [remove, setRemove] = useState(false);
  const [error, setError] = useState('');
  const lock = useRef(false);
  const changed = name.trim() !== initial.name || description.trim() !== initial.description;
  const back = () => {
    if (!lock.current && (!changed || window.confirm('Discard your unsaved category changes?'))) navigate('/admin/news/categories');
  };
  useEffect(() => {
    if (!changed && !saving) return;
    const warn = (event) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [changed, saving]);
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
  const label = saving ? (initial.id ? 'Saving…' : 'Creating…') : initial.id ? 'Save changes' : 'Create category';
  return <div className='news-admin'>
    <PageHeading title={initial.id ? 'Edit category' : 'New category'} description='Categories organize your articles without changing their content.' onBack={back} backDisabled={saving} backLabel='Categories' />
    <form className='news-admin__form' onSubmit={save}>
      <fieldset className='admin-editor' disabled={saving}>
        <div className='admin-stack'><Panel title='Category details'>
          <Field name='name' label='Category name *' value={name} onChange={(event) => { setName(event.target.value); setError(''); }} required maxLength={80} hint={`${name.length}/80 characters`} />
          <Field name='description' label='Description' multiline rows={4} value={description} onChange={(event) => { setDescription(event.target.value); setError(''); }} maxLength={500} hint={`${description.length}/500 characters`} />
        </Panel></div>
        <aside className='admin-stack'><Panel title='Category information'>
          <p>Names must be unique, ignoring case. A category is optional when creating an article.</p>
          {Number.isInteger(initial.count) && <p className='admin-hint'>{initial.count} articles use this category.</p>}
          <p className='admin-hint'>A category cannot be deleted while any article refers to it, including drafts and archived articles.</p>
        </Panel></aside>
      </fieldset>
      {initial.id && <DangerZone title='Delete category' actionLabel='Delete category' disabled={saving} onAction={() => setRemove(true)}>
        <p>Only unused categories can be deleted. Articles and their images will not be removed.</p>
      </DangerZone>}
      <SaveBar pending={saving} disabled={!name.trim() || (Boolean(initial.id) && !changed)} dirty={changed} error={error} submitLabel={label} onCancel={back} />
    </form>
    <SaveStatus pending={saving} error={error} message={saving ? label : ''} onDismiss={() => setError('')} />
    {remove && <NewsDeleteDialog kind='category' item={initial} onClose={() => setRemove(false)} onDone={() => navigate('/admin/news/categories', { replace: true, state: { notice: 'Category deleted.' } })} />}
  </div>;
}
