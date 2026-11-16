import { useState } from 'react';
import { Button } from '../UI.jsx';

import { formatMediaSize } from './formatMedia.js';

export default function MediaCard({ item, selected, disabled, onSelect, onEdit, onDelete }) {
  const [imageFailed, setImageFailed] = useState(false);
  const date = new Date(item.createdAt);
  const dateLabel = Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <article className={`media-card${selected ? ' media-card--selected' : ''}`}>
      <div className='media-card__top'>
        <label className='media-library__check'>
          <input type='checkbox' checked={selected} disabled={disabled}
            onChange={() => onSelect(item.id)} aria-label={`Select ${item.filename}`} />
          <span>{selected ? 'Selected' : 'Select image'}</span>
        </label>
        <span className='media-card__type'>{item.mimeType.replace('image/', '').toUpperCase()}</span>
      </div>
      <a className='media-card__preview' href={item.url} target='_blank' rel='noopener noreferrer'
        aria-label={`View original: ${item.filename} (opens in a new tab)`}>
        {imageFailed ? <span className='media-card__unavailable'>Preview unavailable<br />Open original ↗</span> : (
          <img src={item.url} alt={item.alt || ''} loading='lazy' onError={() => setImageFailed(true)} />
        )}
      </a>
      <div className='media-card__body'>
        <h2 className='media-card__name' title={item.filename}>{item.filename}</h2>
        <p className='media-card__meta'>{formatMediaSize(item.size)} · {dateLabel}</p>
        <p className={`media-card__alt${item.alt ? '' : ' media-card__alt--empty'}`} title={item.alt || undefined}>
          {item.alt || 'No alt text added'}
        </p>
        <div className='media-card__actions'>
          <Button onClick={() => onEdit(item)} disabled={disabled} aria-label={`Edit ${item.filename}`}>Edit</Button>
          <Button variant='danger' onClick={() => onDelete([item])} disabled={disabled}
            aria-label={`Delete ${item.filename}`}>Delete</Button>
        </div>
      </div>
    </article>
  );
}
