import { useCallback, useId, useState } from 'react';
import ArticleRow from '../ArticleRow/ArticleRow.jsx';
import ArticleDialog from '../ArticleDialog/ArticleDialog.jsx';
import { useContent } from '../../../../content/context.js';
import { useLocation } from 'react-router';
import './ArticleList.sass';

const ArticleList = () => {
  const { articles } = useContent();
  const { state } = useLocation();
  const blogArticles = articles.filter((article) => article.status === 'published');
  const [activeArticle, setActiveArticle] = useState(() => blogArticles.find((article) => article.id === state?.articleId) || null);
  const dialogId = useId();
  const closeArticle = useCallback(() => setActiveArticle(null), []);

  return (
    <section className='article-list' aria-labelledby='articles-title'>
      <div className='container article-list__inner'>
        <div className='article-list__header' id='articles' tabIndex={-1}>
          <div>
            <p className='article-list__eyebrow'>From Our Roofing Journal</p>
            <h2 className='article-list__title' id='articles-title'>Helpful reads for your roof.</h2>
          </div>
          <p className='article-list__description'>
            Straightforward guides for homeowners.<br />
            Our latest articles, all in one place.
          </p>
        </div>

        <ol className='article-list__items' aria-label='Articles, newest first'>
          {blogArticles.map((article) => (
            <ArticleRow
              key={article.id}
              article={article}
              dialogId={dialogId}
              onOpen={setActiveArticle}
            />
          ))}
        </ol>
        {!blogArticles.length && <p>New articles are on the way. Please check back soon.</p>}
      </div>
      {activeArticle && (
        <ArticleDialog
          key={activeArticle.id}
          id={dialogId}
          article={activeArticle}
          onClose={closeArticle}
        />
      )}
    </section>
  );
};

export default ArticleList;
