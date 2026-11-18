import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { inquiriesApi } from '../../../lib/inquiries.js';
import { Badge, Button, Field, Notice, PageHeading, Panel } from '../UI.jsx';
import SaveStatus from '../SaveStatus.jsx';
import { DangerZone, FormActions } from '../Workspace.jsx';
import InquiryDeleteDialog from './InquiryDeleteDialog.jsx';
import InquiryPhotoDialog from './InquiryPhotoDialog.jsx';
import { statusOptions, formatInquiryDate, inquiryFailure } from './inquiryView.js';

export default function InquiryRecord({ initial }) {
  const navigate = useNavigate();
  const [inquiry, setInquiry] = useState(initial);
  const [status, setStatus] = useState(initial.status);
  const [note, setNote] = useState('');
  const [pending, setPending] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [photo, setPhoto] = useState(null);
  const lock = useRef(false);
  const mounted = useRef(false);
  const dirty = Boolean(note.trim()) || status !== inquiry.status;
  const disabled = Boolean(pending) || inquiry.state === 'deleting';
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => {
    if (!dirty && !pending) return;
    const warn = (event) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty, pending]);
  const reload = async () => {
    if (lock.current) return;
    lock.current = true; setPending('Reloading…'); setError(''); setMessage('');
    try {
      const response = await inquiriesApi.get(inquiry.id);
      if (mounted.current) { setInquiry(response.inquiry); setStatus(response.inquiry.status); setMessage('Details refreshed. Your unsaved note was kept.'); }
    } catch (failure) { if (mounted.current) setError(inquiryFailure(failure)); }
    finally { lock.current = false; if (mounted.current) setPending(''); }
  };
  const save = async (event, kind) => {
    event.preventDefault();
    if (lock.current || disabled || (kind === 'note' ? !note.trim() : status === inquiry.status)) return;
    lock.current = true; setPending(kind === 'note' ? 'Saving note…' : 'Saving status…'); setError(''); setMessage('');
    try {
      const response = await inquiriesApi.update(inquiry.id, { version: inquiry.version, ...(kind === 'note' ? { note } : { status }) });
      if (!mounted.current) return;
      setInquiry(response.inquiry);
      // Saving a note must not overwrite an unsaved status selection.
      if (kind === 'status') setStatus(response.inquiry.status); else setNote('');
      setMessage(kind === 'note' ? 'Internal note saved.' : 'Inquiry status saved.');
    } catch (failure) { if (mounted.current) setError(inquiryFailure(failure)); }
    finally { lock.current = false; if (mounted.current) setPending(''); }
  };
  const back = () => { if (!dirty || window.confirm('Discard your unsaved note or status change?')) navigate('/admin/inquiries'); };
  const copy = async (value) => {
    try { await navigator.clipboard.writeText(value); setMessage('Copied to clipboard.'); }
    catch { setError('Could not copy automatically. Select the text and copy it manually.'); }
  };
  const facts = [
    ['Name', inquiry.name], ['Email', inquiry.email], ['Phone', inquiry.phone], ['ZIP code', inquiry.zip],
    ['Service', inquiry.serviceTitle || 'Not sure yet'], ['Received', formatInquiryDate(inquiry.createdAt)],
  ];
  return <div className='inquiries-admin'>
    <PageHeading title='Inquiry details' description={inquiry.reference} onBack={back} backDisabled={Boolean(pending)} backLabel='Inquiries' />
    <SaveStatus pending={Boolean(pending)} error={error} message={pending || message} onDismiss={() => { setError(''); setMessage(''); }} />
    {error && <Notice error><p>{error}</p><Button disabled={Boolean(pending)} onClick={reload}>Reload details (keep note)</Button></Notice>}
    {inquiry.state === 'deleting' && <Notice error>Deletion was interrupted. Editing and photo access are disabled. Use Retry deletion to finish removing the record and its private files.</Notice>}
    <div className='admin-editor-grid'>
      <div className='admin-stack'>
        <Panel title='Customer details'>
          <dl className='admin-facts inquiries-admin__facts'>{facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || '—'}</dd></div>)}</dl>
          <div className='admin-actions'>{inquiry.email && <Button onClick={() => void copy(inquiry.email)}>Copy email</Button>}{inquiry.phone && <Button onClick={() => void copy(inquiry.phone)}>Copy phone</Button>}</div>
          <p className='admin-hint'>Original customer details are read-only. Record corrections and follow-up in internal notes.</p>
        </Panel>
        <Panel title='Message'>
          <p className='admin-prose'>{inquiry.message || 'No message supplied.'}</p>
          <p className='admin-hint'>Source: {inquiry.source?.type || 'contact'}{inquiry.source?.title ? ` · ${inquiry.source.title}` : ''}</p>
        </Panel>
        <Panel title={`Attachments · ${inquiry.attachments.length} photos`} description='Private photos are accessible only to signed-in administrators.'>
          {inquiry.attachments.length ? <div className='inquiries-admin__attachments'>{inquiry.attachments.map((attachment, index) => <button type='button'
            className='inquiries-admin__attachment' key={attachment.id} disabled={disabled} onClick={() => setPhoto(attachment)}>
            <span className='inquiries-admin__photo-number' aria-hidden='true'>{index + 1}</span>
            <span><strong>{attachment.filename}</strong><small>{Math.ceil(attachment.size / 1024)} KB · Open private photo</small></span>
          </button>)}</div> : <p className='admin-hint'>No photos attached.</p>}
        </Panel>
        <Panel title='Internal notes' description='Notes are stored in the admin workspace and never returned to visitors.'>
          {inquiry.notes.length ? <ol className='inquiries-admin__notes'>{[...inquiry.notes].reverse().map((entry) => <li key={entry.id}>
            <p className='admin-prose'>{entry.text}</p><small>{entry.author} · {formatInquiryDate(entry.createdAt)}</small>
          </li>)}</ol> : <p className='admin-hint'>No notes yet.</p>}
          <form className='inquiries-admin__form' onSubmit={(event) => void save(event, 'note')}>
            <Field label='Add an internal note' name='note' multiline rows={5} maxLength={4000} value={note} disabled={disabled || inquiry.notes.length >= 100}
              onChange={(event) => { setNote(event.target.value); setError(''); setMessage(''); }} hint={`${note.length}/4000 characters · ${inquiry.notes.length}/100 saved notes`} />
            <FormActions><Button variant='primary' type='submit' disabled={disabled || !note.trim() || inquiry.notes.length >= 100}>{pending === 'Saving note…' ? pending : 'Save note'}</Button></FormActions>
          </form>
        </Panel>
      </div>
      <aside className='admin-stack'>
        <Panel title='Inquiry status'>
          <Badge status={inquiry.status} />
          <form className='inquiries-admin__form' onSubmit={(event) => void save(event, 'status')}>
            <Field label='Status' name='inquiry-status' value={status} disabled={disabled} onChange={(event) => { setStatus(event.target.value); setError(''); setMessage(''); }}>
              {statusOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </Field>
            <FormActions><Button variant='primary' type='submit' disabled={disabled || status === inquiry.status}>{pending === 'Saving status…' ? pending : 'Save status'}</Button></FormActions>
            <p className='admin-hint'>New → In progress → Closed. Use Spam for unwanted requests. These changes do not send email.</p>
          </form>
        </Panel>
      </aside>
    </div>
    <DangerZone title='Delete inquiry' actionLabel={inquiry.state === 'deleting' ? 'Retry deletion' : 'Delete inquiry'} disabled={Boolean(pending)} onAction={() => setDeleting(true)}>
      <p>Permanently removes this inquiry, notes and all private attachments. Use Closed to keep a completed inquiry.</p>
    </DangerZone>
    {photo && <InquiryPhotoDialog key={photo.id} inquiryId={inquiry.id} attachment={photo} onClose={() => setPhoto(null)} />}
    {deleting && <InquiryDeleteDialog inquiry={inquiry} onClose={() => { setDeleting(false); void reload(); }} onDeleted={() => navigate('/admin/inquiries', { replace: true })} />}
  </div>;
}
