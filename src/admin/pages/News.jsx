import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { useNewsResource } from '../../hooks/useNewsResource.js';
import { Badge, Button, Empty, Field, Notice, PageHeading, Panel } from '../components/UI.jsx';
import SaveStatus from '../components/SaveStatus.jsx';
import ArticleForm from '../components/news/ArticleForm.jsx';
import NewsDeleteDialog from '../components/news/NewsDeleteDialog.jsx';
import { freshArticle, toArticleForm } from '../components/news/articleForm.js';
import './News.sass';

export function NewsList() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('all');
  const [categoryId, setCategoryId] = useState('all');
  const [selected, setSelected] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams({ page: String(page), status, categoryId });
  const { data, loading, error, reload } = useNewsResource(`/api/admin/news?${query}`, true);
  const articles = data?.articles ?? [];
  return <div className='news-admin'>
    <PageHeading title='News' description='Draft, publish and maintain your roofing journal.'>
      <Button variant='primary' to='/admin/news/new'>+ Add article</Button>
    </PageHeading>
    <div className='news-admin__filters'>
      <Field name='status' label='Status' value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
        <option value='all'>All articles</option><option value='draft'>Draft</option><option value='published'>Published</option><option value='archived'>Archived</option>
      </Field>
      <Field name='category' label='Category' value={categoryId} onChange={(event) => { setCategoryId(event.target.value); setPage(1); }}>
        <option value='all'>All categories</option><option value='uncategorized'>Uncategorized</option>
        {(data?.categories ?? []).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
      </Field>
      <Button to='/admin/news/categories'>Manage categories</Button>
      <Button disabled={loading} onClick={reload}>Refresh</Button>
    </div>
    {location.state?.notice && <Notice>{location.state.notice}</Notice>}
    {error && <Notice error><p>{error}</p><Button onClick={reload}>Retry</Button></Notice>}
    {loading && <Panel><p role='status'>Loading articles…</p></Panel>}
    {!loading && !error && (articles.length ? <div className='admin-table-wrap'>
      <table className='admin-table news-admin__table'><thead><tr><th>Article</th><th>Category</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>{articles.map((article) => <tr key={article.id}>
          <td data-label='Article'><strong>{article.title}</strong><small>{article.summary || 'No introduction yet'}</small></td>
          <td data-label='Category'>{article.categoryName}</td><td data-label='Date'>{article.publishedAt || 'Not set'}</td>
          <td data-label='Status'><Badge status={article.status} /></td>
          <td data-label='Actions'><div className='admin-actions'><Button to={`/admin/news/${article.id}`}>Edit</Button><Button variant='danger' onClick={() => setSelected(article)}>Delete</Button></div></td>
        </tr>)}</tbody>
      </table>
    </div> : <Empty title='No articles in this selection.'><p>Create an article or change the filters.</p>{page > 1 && <Button onClick={() => setPage(1)}>First page</Button>}</Empty>)}
    {data?.pagination && !loading && <nav className='news-admin__pagination' aria-label='News pages'>
      <p>{data.pagination.total} articles · Page {page} of {Math.max(1, data.pagination.totalPages)}</p>
      <div className='admin-actions'><Button disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</Button><Button disabled={page >= data.pagination.totalPages} onClick={() => setPage((value) => value + 1)}>Next</Button></div>
    </nav>}
    {selected && <NewsDeleteDialog item={selected} onClose={() => setSelected(null)} onDone={() => {
      setSelected(null);
      if (articles.length === 1 && page > 1) setPage((value) => value - 1); else reload();
      navigate('/admin/news', { replace: true, state: { notice: 'Article deleted. Its cover image was retained.' } });
    }} />}
  </div>;
}
export function ArticleEditor() {
  const { id } = useParams();
  return id ? <ExistingArticle key={id} id={id} /> : <ArticleForm key='new' initial={freshArticle()} />;
}
function ExistingArticle({ id }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [seed] = useState(() => location.state?.createdArticle?.id === id ? location.state.createdArticle : null);
  const { data, loading, error, reload } = useNewsResource(`/api/admin/news/${encodeURIComponent(id)}`);
  useEffect(() => {
    if (seed) navigate(`/admin/news/${id}`, { replace: true, state: null });
  }, [seed, id, navigate]);
  if (!seed && loading) return <Panel><p role='status'>Loading article…</p></Panel>;
  if (!seed && error) return <Notice error><p>{error}</p><Button onClick={reload}>Retry</Button><Button to='/admin/news'>Back to news</Button></Notice>;
  const article = seed || data?.article;
  if (!article) return <SaveStatus error='Article not found.' />;
  return <ArticleForm initial={toArticleForm(article)} created={Boolean(seed)} />;
}
