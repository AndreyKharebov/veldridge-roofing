import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router';
import { lockBodyScroll } from '../../../../utils/lockBodyScroll.js';
import { normalizeSocialUrl } from '../../../../utils/socialUrl.js';
import closeIcon from '../../assets/icons/close.svg';
import { formatArticleDate } from '../../data/articleDate.js';
import './ArticleDialog.sass';
import './ArticleContent.sass';

const ArticleDialog = ({ id, article, onClose, preview = false, loading = false, error = '', onRetry }) => {
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
      if (window.location.pathname === pathname && opener instanceof HTMLElement && opener.isConnected) opener.focus({ preventScroll: true });
    };
  }, []);
  const isBackdrop = (event) => {
    if (event.target !== event.currentTarget) return false;
    const bounds = event.currentTarget.getBoundingClientRect();
    return event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
  };
  const keepFocusInside = (event) => {
    if (event.key !== 'Tab') return;
    const elements = [...event.currentTarget.querySelectorAll('button, a[href], [tabindex="0"]')]
      .filter((element) => !element.disabled && element.getClientRects().length > 0);
    const first = elements[0]; const last = elements[elements.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  };
  let sourceUrl = '';
  try { sourceUrl = normalizeSocialUrl(article?.source?.url || ''); } catch { /* Never render unsafe imported links. */ }
  const ready = !loading && !error && Boolean(article);
  return createPortal(
    <dialog ref={dialogRef} className='article-dialog' id={id} aria-labelledby={titleId} aria-describedby={ready ? summaryId : undefined}
      onClose={(event) => { if (!event.currentTarget.open && event.currentTarget.isConnected) onClose(); }}
      onPointerDown={(event) => { backdropPress.current = isBackdrop(event); }}
      onPointerCancel={() => { backdropPress.current = false; }}
      onClick={(event) => {
        if (backdropPress.current && isBackdrop(event)) dialogRef.current.close();
        backdropPress.current = false;
      }} onKeyDown={keepFocusInside}>
      <div className='article-dialog__toolbar'>
        <p>{preview ? 'Unsaved article preview' : 'Veldridge Journal'}</p>
        <button ref={closeRef} className='article-dialog__close' type='button' aria-label='Close article' onClick={() => dialogRef.current.close()}>
          <img src={closeIcon} alt='' aria-hidden='true' />
        </button>
      </div>
      <div className='article-dialog__scroll' role='region' aria-label='Article text' tabIndex={0} aria-busy={loading}>
        {!ready ? <div className='article-dialog__content'>
          <h2 id={titleId}>{loading ? 'Loading article…' : 'Article unavailable'}</h2>
          {error && <p role='alert'>{error}</p>}
          {onRetry && !loading && <button type='button' className='article-dialog__retry' onClick={onRetry}>Try again</button>}
        </div> : <article className='article-dialog__content'>
          <header className='article-dialog__heading'>
            {article.publishedAt ? <time className='article-dialog__date' dateTime={article.publishedAt}>{formatArticleDate(article.publishedAt)}</time>
              : <p className='article-dialog__date'>Draft — publication date not set</p>}
            {article.categoryName && <p className='article-dialog__date'>{article.categoryName}</p>}
            <h2 className='article-dialog__title' id={titleId}>{article.title}</h2>
            <p className='article-dialog__intro' id={summaryId}>{article.summary}</p>
          </header>
          {article.image && <img className='article-dialog__image' src={article.image} alt={article.imageAlt} width='800' height='260' decoding='async' />}
          {(article.sections ?? []).map(({ id: sectionId, heading, body }, index) => (
            <section className='article-dialog__section' key={sectionId || index}><h3>{heading}</h3><p>{body}</p></section>
          ))}
          {sourceUrl && <div className='article-dialog__source'>
            <p>Further Reading</p><a href={sourceUrl} target='_blank' rel='noopener noreferrer'>
              {article.source.label || 'Read the source'}<span className='article-dialog__sr-only'> (opens in a new tab)</span>
            </a>
          </div>}
          {!preview && <aside className='article-dialog__contact' aria-label='Contact our team'>
            <h3>Have a question about your roof?</h3><p>Tell our team what you have noticed. We’ll help you discuss the next step.</p>
            <Link className='article-dialog__cta' to='/contact' state={{ articleId: article.id, articleTitle: article.title }}>Contact Our Team</Link>
          </aside>}
          <p className='article-dialog__note'>{preview ? 'Preview only. Save the article to persist your changes.' : 'General homeowner guidance. Your roof needs an individual assessment.'}</p>
        </article>}
      </div>
    </dialog>, document.body,
  );
};
export default ArticleDialog;
