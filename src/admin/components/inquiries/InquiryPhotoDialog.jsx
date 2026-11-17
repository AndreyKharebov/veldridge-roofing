import { useEffect, useState } from 'react';
import { inquiriesApi } from '../../../lib/inquiries.js';
import Dialog from '../Dialog.jsx';
import { Button, Notice } from '../UI.jsx';

export default function InquiryPhotoDialog({ inquiryId, attachment, onClose }) {
  const [result, setResult] = useState({ url: '', error: '', loading: true });
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let url = '';
    inquiriesApi.attachment(inquiryId, attachment.id, { signal: controller.signal }).then((blob) => {
      if (controller.signal.aborted) return;
      url = URL.createObjectURL(blob);
      setResult({ url, error: '', loading: false });
    }).catch((error) => {
      if (!controller.signal.aborted) setResult({ url: '', error: error.status === 401 ? 'Your session expired. Sign in again to view this private photo.' : error.message, loading: false });
    });
    return () => { controller.abort(); if (url) URL.revokeObjectURL(url); };
  }, [inquiryId, attachment.id, retry]);
  const extension = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[attachment.mimeType];
  return <Dialog title='Private inquiry photo' className='inquiry-photo-viewer' onClose={onClose}>
    <p className='admin-hint'>{attachment.filename} · {Math.ceil(attachment.size / 1024)} KB</p>
    {result.loading && <p role='status'>Loading private photo…</p>}
    {result.error && <Notice error><p>{result.error}</p><Button onClick={() => {
      setResult({ url: '', error: '', loading: true }); setRetry((value) => value + 1);
    }}>Retry</Button></Notice>}
    {result.url && <img className='inquiry-photo-viewer__image' src={result.url} alt='Photo submitted with this inquiry' />}
    <div className='admin-actions admin-actions--end'>
      {result.url && <a className='admin-button' href={result.url} download={`inquiry-photo.${extension}`}>Download photo</a>}
      <Button onClick={onClose}>Close</Button>
    </div>
    <p className='admin-hint'>Private attachment. It is not stored in the public Media Library.</p>
  </Dialog>;
}
