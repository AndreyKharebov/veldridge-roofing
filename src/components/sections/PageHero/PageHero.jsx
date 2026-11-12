import { Link } from 'react-router';

import './PageHero.sass';

const PageHero = ({
  idPrefix,
  breadcrumb,
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
  note,
  image,
  imageAlt,
  highlights = [],
}) => {
  const titleId = `${idPrefix}-title`;

  return (
    <section className='page-hero' aria-labelledby={titleId}>
      <div className='container'>
        <nav className='page-hero__breadcrumbs' aria-label='Breadcrumb'>
          <ol>
            <li><Link to='/'>Home</Link></li>
            <li aria-hidden='true'>/</li>
            <li><span aria-current='page'>{breadcrumb}</span></li>
          </ol>
        </nav>

        <div className='page-hero__inner'>
          <div className='page-hero__content'>
            <p className='page-hero__eyebrow'>{eyebrow}</p>
            <h1 className='page-hero__title' id={titleId}>{title}</h1>
            <p className='page-hero__description'>{description}</p>

            <div className='page-hero__actions'>
              <Link className='page-hero__button' to={primaryAction.to}>
                {primaryAction.label}
              </Link>
              {secondaryAction && (
                <Link
                  className='page-hero__text-link'
                  to={secondaryAction.to}
                  preventScrollReset
                >
                  {secondaryAction.label}
                </Link>
              )}
            </div>

            <p className='page-hero__note'>{note}</p>
          </div>

          <div className='page-hero__visual'>
            <img
              className='page-hero__image'
              src={image}
              alt={imageAlt}
              width='608'
              height='536'
              fetchPriority='high'
            />
            <div className='page-hero__area'>
              <span className='page-hero__states'>PA · NJ · DE</span>
              <span className='page-hero__caption'>Proudly serving</span>
            </div>
          </div>
        </div>

        <ul className='page-hero__highlights'>
          {highlights.map(({ id, title: highlightTitle, description: detail }) => (
            <li className='page-hero__highlight' key={id}>
              <p className='page-hero__highlight-title'>{highlightTitle}</p>
              <p className='page-hero__highlight-description'>{detail}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default PageHero;
