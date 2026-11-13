import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router';
import { lockBodyScroll } from '../../../../utils/lockBodyScroll.js';

import closeIcon from '../../assets/icons/close.svg';
import { formatArticleDate } from '../../data/articleDate.js';
import './ArticleDialog.sass';

const ArticleDialog = ({ id, article, onClose }) => {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  const backdropPress = useRef(false);
  const titleId = `${id}-title`;
  const summaryId = `${id}-summary`;

  useEffect(() => {
    const dialog = dialogRef.current;
    const opener = document.activeElement;
    const pathname = window.location.pathname;
    const unlock = lockBodyScroll();
    dialog.showModal();
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      if (dialog.open) dialog.close();
      unlock();
      if (window.location.pathname === pathname && opener instanceof HTMLElement && opener.isConnected) {
        opener.focus({ preventScroll: true });
      }
    };
  }, []);

  const isBackdrop = (event) => {
    if (event.target !== event.currentTarget) return false;
    const bounds = event.currentTarget.getBoundingClientRect();
    return event.clientX < bounds.left || event.clientX > bounds.right
      || event.clientY < bounds.top || event.clientY > bounds.bottom;
  };

  const keepFocusInside = (event) => {
    if (event.key !== 'Tab') return;
    const elements = [...event.currentTarget.querySelectorAll('button, a[href], [tabindex="0"]')]
      .filter((element) => !element.disabled && element.getClientRects().length > 0);
    const first = elements[0];
    const last = elements[elements.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  };

  return createPortal(
    <dialog
      ref={dialogRef}
      className='article-dialog'
      id={id}
      aria-labelledby={titleId}
      aria-describedby={summaryId}
      onClose={(event) => {
        // StrictMode can queue a close event before the dialog is reopened.
        if (!event.currentTarget.open && event.currentTarget.isConnected) onClose();
      }}
      onPointerDown={(event) => { backdropPress.current = isBackdrop(event); }}
      onPointerCancel={() => { backdropPress.current = false; }}
      onClick={(event) => {
        if (backdropPress.current && isBackdrop(event)) dialogRef.current.close();
        backdropPress.current = false;
      }}
      onKeyDown={keepFocusInside}
    >
      <div className='article-dialog__toolbar'>
        <p>Veldridge Journal</p>
        <button
          ref={closeRef}
          className='article-dialog__close'
          type='button'
          aria-label='Close article'
          onClick={() => dialogRef.current.close()}
        >
          <img src={closeIcon} alt='' aria-hidden='true' />
        </button>
      </div>
      <div className='article-dialog__scroll' role='region' aria-label='Article text' tabIndex={0}>
        <article className='article-dialog__content'>
          <header className='article-dialog__heading'>
            <time className='article-dialog__date' dateTime={article.publishedAt}>
              {formatArticleDate(article.publishedAt)}
            </time>
            <h2 className='article-dialog__title' id={titleId}>{article.title}</h2>
            <p className='article-dialog__intro' id={summaryId}>{article.summary}</p>
          </header>
          <img
            className='article-dialog__image'
            src={article.image}
            alt={article.imageAlt}
            width='800'
            height='260'
            decoding='async'
          />
          {article.sections.map(({ id:sectionId, heading, body }, index) => (
            <section className='article-dialog__section' key={sectionId || index}>
              <h3>{heading}</h3>
              <p>{body}</p>
            </section>
          ))}
          {article.source?.url && <div className='article-dialog__source'>
            <p>Further Reading</p>
            <a href={article.source.url} target='_blank' rel='noopener noreferrer'>
              {article.source.label}
              <span className='article-dialog__sr-only'> (opens in a new tab)</span>
            </a>
          </div>}
          <aside className='article-dialog__contact' aria-label='Contact our team'>
            <h3>Have a question about your roof?</h3>
            <p>Tell our team what you have noticed. We’ll help you discuss the next step.</p>
            <Link
              className='article-dialog__cta'
              to='/contact'
              state={{ articleId: article.id, articleTitle: article.title }}
            >
              Contact Our Team
            </Link>
          </aside>
          <p className='article-dialog__note'>General homeowner guidance. Your roof needs an individual assessment.</p>
        </article>
      </div>
    </dialog>,
    document.body,
  );
};

export default ArticleDialog;
