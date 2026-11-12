import { useCallback, useId, useState } from 'react';
import ArticleRow from '../ArticleRow/ArticleRow.jsx';
import ArticleDialog from '../ArticleDialog/ArticleDialog.jsx';
import { blogArticles } from '../../data/blogArticles.js';
import './ArticleList.sass';

const ArticleList = () => {
  const [activeArticle, setActiveArticle] = useState(null);
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
