import { useEffect, useRef, useState } from 'react';
import { mediaApi } from '../../../lib/media.js';
import Dialog from '../Dialog.jsx';
import { Button, Notice } from '../UI.jsx';
import { formatMediaSize } from './formatMedia.js';

export default function MediaEditDialog({ item, onSaved, onClose, onBusy }) {
  const mounted = useRef(false);
  const savingRef = useRef(false);
  const [filename, setFilename] = useState(item.filename);
  const [alt, setAlt] = useState(item.alt ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const changed = filename.trim() !== item.filename || alt.trim() !== (item.alt ?? '');

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const close = () => { if (!savingRef.current) onClose(); };
  const save = async (event) => {
    event.preventDefault();
    if (savingRef.current || !changed) return;
    if (!filename.trim()) { setError('Image name cannot be empty.'); return; }
    savingRef.current = true;
    setSaving(true);
    setError('');
    onBusy(true);
    try {
      const { media } = await mediaApi.update(item.id, { filename: filename.trim(), alt: alt.trim() });
      if (mounted.current) onSaved(media);
    } catch (failure) {
      if (mounted.current) setError(failure.status === 401
        ? 'Your session expired. Sign in again before saving. Your changes have not been saved.'
        : failure.message);
    } finally {
      savingRef.current = false;
      if (mounted.current) { setSaving(false); onBusy(false); }
    }
  };

  return (
    <Dialog title='Edit image' className='media-edit' onClose={close} closeDisabled={saving}>
      <form className='media-edit__form' onSubmit={save} aria-busy={saving}>
        <div className='media-edit__preview'><img src={item.url} alt={item.alt || ''} /></div>
        <p className='admin-hint'>{item.mimeType.replace('image/', '').toUpperCase()} · {formatMediaSize(item.size)}</p>
        {error && <Notice error>{error}</Notice>}
        <fieldset className='media-edit__fields' disabled={saving}>
          <div className='admin__field'>
            <label htmlFor='media-edit-name'>Image name <span aria-hidden='true'>*</span></label>
            <input id='media-edit-name' name='filename' className='admin__control' value={filename}
              onChange={(event) => { setFilename(event.target.value); setError(''); }}
              maxLength={255} required aria-describedby='media-edit-name-hint' />
            <p id='media-edit-name-hint' className='admin-hint'>Changes the library name only. The original file and its URL stay the same.</p>
          </div>
          <div className='admin__field'>
            <label htmlFor='media-edit-alt'>Alt text</label>
            <textarea id='media-edit-alt' name='alt' className='admin__control' value={alt} rows={4}
              onChange={(event) => { setAlt(event.target.value); setError(''); }} maxLength={300}
              placeholder='Describe what the image shows' aria-describedby='media-edit-alt-hint' />
            <div id='media-edit-alt-hint' className='media-edit__hint'>
              <span>Leave empty for a decorative image.</span><span>{alt.length}/300</span>
            </div>
          </div>
        </fieldset>
        <div className='admin-dialog__actions'>
          <Button disabled={saving} onClick={close}>Cancel</Button>
          <Button type='submit' variant='primary' disabled={saving || !changed || !filename.trim()}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
