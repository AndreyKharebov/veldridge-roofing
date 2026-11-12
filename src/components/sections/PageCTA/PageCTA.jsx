import { Link } from 'react-router';

import './PageCTA.sass';

const PageCTA = ({ idPrefix, eyebrow, title, description, action, image, imageAlt }) => {
  const titleId = `${idPrefix}-title`;

  return (
    <section className='page-cta' aria-labelledby={titleId}>
      <div className='container'>
        <div className='page-cta__inner'>
          <div className='page-cta__content'>
            <p className='page-cta__eyebrow'>{eyebrow}</p>
            <h2 className='page-cta__title' id={titleId}>{title}</h2>
            <p className='page-cta__description'>{description}</p>
            <Link className='page-cta__button' to={action.to}>
              {action.label}
            </Link>
          </div>
          <img
            className='page-cta__image'
            src={image}
            alt={imageAlt}
            width='496'
            height='320'
            loading='lazy'
          />
        </div>
      </div>
    </section>
  );
};

export default PageCTA;
