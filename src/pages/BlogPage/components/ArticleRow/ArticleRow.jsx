import arrowIcon from '../../assets/icons/arrow-right.svg';
import { formatArticleDate } from '../../data/articleDate.js';
import './ArticleRow.sass';

const ArticleRow = ({ article, dialogId, onOpen }) => (
  <li className='article-row'>
    <img
      className='article-row__image'
      src={article.image}
      alt={article.imageAlt}
      width='320'
      height='208'
      loading='lazy'
      decoding='async'
    />
    <div className='article-row__content'>
      <time className='article-row__date' dateTime={article.publishedAt}>
        {formatArticleDate(article.publishedAt)}
      </time>
      <h3 className='article-row__title'>
        <button
          className='article-row__open'
          type='button'
          id={`article-${article.id}`}
          aria-haspopup='dialog'
          aria-controls={dialogId}
          onClick={(event) => {
            // Safari does not always focus a button when it is clicked.
            event.currentTarget.focus({ preventScroll: true });
            onOpen(article);
          }}
        >
          {article.title}
        </button>
      </h3>
      <p className='article-row__summary'>{article.summary}</p>
      <span className='article-row__read-more' aria-hidden='true'>
        <span>Read More</span>
        <span className='article-row__arrow'><img src={arrowIcon} alt='' /></span>
      </span>
    </div>
  </li>
);

export default ArticleRow;
