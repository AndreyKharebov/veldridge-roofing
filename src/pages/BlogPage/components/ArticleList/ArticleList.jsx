import { useCallback, useId, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { useNewsResource } from '../../../../hooks/useNewsResource.js';
import ArticleRow from '../ArticleRow/ArticleRow.jsx';
import ArticleReader from '../ArticleReader/ArticleReader.jsx';
import './ArticleList.sass';
import './NewsPublic.sass';

export default function ArticleList() {
  const [page, setPage] = useState(1);
  const [categoryId, setCategoryId] = useState('all');
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const articleId = params.get('article');
  const dialogId = useId();
  const query = new URLSearchParams({ page: String(page), categoryId });
  const { data, loading, error, reload } = useNewsResource(`/api/news?${query}`, true);
  const open = (article) => { const next = new URLSearchParams(params); next.set('article', article.id); navigate({ pathname: location.pathname, search: next.toString(), hash: location.hash }, { preventScrollReset: true }); };
  const close = useCallback(() => {
    const next = new URLSearchParams(location.search); next.delete('article');
    navigate({ pathname: location.pathname, search: next.toString(), hash: location.hash }, { replace: true, preventScrollReset: true });
  }, [navigate, location.pathname, location.search, location.hash]);
  return <section className='article-list' aria-labelledby='articles-title'>
    <div className='container article-list__inner'>
      <div className='article-list__header' id='articles' tabIndex={-1}>
        <div><p className='article-list__eyebrow'>From Our Roofing Journal</p><h2 className='article-list__title' id='articles-title'>Helpful reads for your roof.</h2></div>
        <p className='article-list__description'>Straightforward guides for homeowners.<br />Our latest articles, all in one place.</p>
      </div>
      <label className='news-public__filter'>Category
        <select value={categoryId} onChange={(event) => { setCategoryId(event.target.value); setPage(1); }}>
          <option value='all'>All articles</option><option value='uncategorized'>Uncategorized</option>
          {(data?.categories ?? []).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
      </label>
      {loading && <p role='status'>Loading articles…</p>}
      {error && <div role='status'><p>{error}</p><button className='news-public__button' type='button' onClick={reload}>Try again</button></div>}
      {!loading && !error && <>
        <ol className='article-list__items' aria-label='Articles, newest first'>
          {data.articles.map((article) => <ArticleRow key={article.id} article={article} dialogId={dialogId} onOpen={open} />)}
        </ol>
        {!data.articles.length && <p>No articles in this selection yet.</p>}
        {data.pagination.totalPages > 1 && <nav className='news-public__pagination' aria-label='Article pages'>
          <span>Page {page} of {data.pagination.totalPages}</span>
          <button className='news-public__button' type='button' disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</button>
          <button className='news-public__button' type='button' disabled={page >= data.pagination.totalPages} onClick={() => setPage((value) => value + 1)}>Next</button>
        </nav>}
        {page > Math.max(1, data.pagination.totalPages) && <button className='news-public__button' type='button' onClick={() => setPage(1)}>First page</button>}
      </>}
    </div>
    {articleId && <ArticleReader key={articleId} id={dialogId} articleId={articleId} onClose={close} />}
  </section>;
}
