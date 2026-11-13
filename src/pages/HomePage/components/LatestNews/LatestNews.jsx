import { Link } from 'react-router';

import { useContent } from '../../../../content/context.js';

import './LatestNews.sass';


const LatestNews = () => {
  const { articles } = useContent();
  const latestNews = articles.filter((article) => article.status === 'published').slice(0,3).map((article) => ({...article,date:article.publishedAt}));
  if (!latestNews.length) return null;
  return (
    <section className='latest-news'>
      <div className='container'>
        <div className='latest-news__header'>
          <h2 className='latest-news__title'>
            Our Latest <span>News</span>
          </h2>

          <p className='latest-news__description'>
            Explore roofing tips, helpful advice, and the latest insights from
            our team.
          </p>
        </div>

        <div className='latest-news__grid'>
          {latestNews.map((article) => (
            <article className='latest-news__card' key={article.id}>
              <div className='latest-news__image-wrapper'>
                {article.image ? (
                  <img
                    className='latest-news__image'
                    src={article.image}
                    alt={article.imageAlt}
                    loading='lazy'
                  />
                ) : (
                  <span
                    className='latest-news__image-placeholder'
                    aria-hidden='true'
                  />
                )}
              </div>

              <div className='latest-news__card-content'>
                {article.date && (
                  <div className='latest-news__date'>
                    <svg
                      width='20'
                      height='20'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='1.8'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      aria-hidden='true'
                    >
                      <rect x='3' y='5' width='18' height='16' rx='2' />
                      <path d='M16 3v4M8 3v4M3 10h18' />
                    </svg>

                    <time dateTime={article.date}>
                      {new Date(`${article.date}T12:00:00`).toLocaleDateString(
                        'en-US',
                        {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        },
                      )}
                    </time>
                  </div>
                )}

                <h3 className='latest-news__card-title'>{article.title}</h3>

                <Link
                  className='latest-news__read-more'
                  to='/blog'
                  state={{articleId:article.id}}
                  aria-label={`Read more: ${article.title}`}
                >
                  Read More
                </Link>
              </div>
            </article>
          ))}
        </div>

        <Link className='latest-news__button' to='/blog'>
          View All Blog
        </Link>
      </div>
    </section>
  );
};

export default LatestNews;
