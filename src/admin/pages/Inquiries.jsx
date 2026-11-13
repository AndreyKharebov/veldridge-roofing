import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { workspaceApi } from '../../api/workspace.js';
import { useContent } from '../../content/context.js';
import { Badge, Button, Empty, Field, Notice, PageHeading, Panel } from '../components/UI.jsx';
import InquiryTable from '../components/InquiryTable.jsx';
import Dialog from '../components/Dialog.jsx';
import UnsavedChanges from '../components/UnsavedChanges.jsx';

const statuses = [['new','New'],['in-progress','In progress'],['closed','Closed'],['spam','Spam']];
function useInbox() { return useQuery({queryKey:['workspace','inquiries'],queryFn:workspaceApi.getInquiries}); }
function Attachment({ photo, onOpen }) {
  const [url,setUrl] = useState('');
  useEffect(() => {
    if (!photo.blob) return;
    const local = URL.createObjectURL(photo.blob);
    setUrl(local); // eslint-disable-line react-hooks/set-state-in-effect
    return () => URL.revokeObjectURL(local);
  },[photo.blob]);
  return <button className='admin-attachment' type='button' onClick={() => onOpen({url,name:photo.name})} disabled={!url}>
    {url && <img src={url} alt={photo.name} />}<span>{photo.name}</span><small>View attachment</small>
  </button>;
}
export function InquiriesList() {
  const query = useInbox();
  const [status,setStatus] = useState('all');
  const [search,setSearch] = useState('');
  if (query.isPending) return <Notice>Loading inquiries…</Notice>;
  if (query.isError) return <Notice error>{query.error.message} <Button onClick={() => query.refetch()}>Try again</Button></Notice>;
  const records = query.data;
  const filtered = records.filter((record) => (status === 'all' || record.status === status) && `${record.name} ${record.email} ${record.phone} ${record.message}`.toLowerCase().includes(search.toLowerCase()));
  return <>
    <PageHeading title='Inquiries' description={`${records.filter((row) => row.status === 'new').length} new requests need attention.`} />
    <div className='admin-filter-bar' aria-label='Inquiry status'>
      {[['all','All inquiries'],...statuses].map(([value,label]) => <Button key={value} variant={status === value ? 'primary' : 'secondary'} aria-pressed={status === value} onClick={() => setStatus(value)}>{label} · {value === 'all' ? records.length : records.filter((row) => row.status === value).length}</Button>)}
    </div>
    <Field name='search-inquiries' label='Search inquiries' value={search} placeholder='Name, email, phone or message' onChange={(event) => setSearch(event.target.value)} />
    {filtered.length ? <InquiryTable records={filtered} detailed /> : <Empty title='No inquiries found.'><p>Change the filters, or send a demo inquiry from Contact in this same browser.</p><Button to='/contact'>Open Contact</Button></Empty>}
    <p className='admin-hint' aria-live='polite'>{filtered.length} of {records.length} inquiries · Sample and local browser data only.</p>
  </>;
}
export function InquiryDetail() {
  const { id } = useParams();
  const query = useInbox();
  if (query.isPending) return <Notice>Loading inquiry…</Notice>;
  if (query.isError) return <Notice error>{query.error.message} <Button onClick={() => query.refetch()}>Try again</Button></Notice>;
  const record = query.data.find((row) => row.id === id);
  return record ? <InquiryContent key={record.id} record={record} /> : <Empty title='Inquiry not found.'><Button to='/admin/inquiries'>Back to inquiries</Button></Empty>;
}
function InquiryContent({ record }) {
  const { projects,articles } = useContent();
  const [snapshot,setSnapshot] = useState(record);
  const [status,setStatus] = useState(record.status);
  const [note,setNote] = useState('');
  const [preview,setPreview] = useState(null);
  const [copied,setCopied] = useState('');
  const errorRef = useRef(null);
  const client = useQueryClient();
  const mutation = useMutation({mutationFn:workspaceApi.updateInquiry.bind(null,record.id),onSuccess:async (next) => {
    setSnapshot(next);setStatus(next.status);setNote('');await client.invalidateQueries({queryKey:['workspace','inquiries']});
  },onError:() => window.requestAnimationFrame(() => errorRef.current?.focus())});
  const source = record.source;
  const exists = source?.type === 'project' ? projects.some((p) => p.id === source.id && p.status === 'published') : articles.some((a) => a.id === source?.id && a.status === 'published');
  const copy = async (value) => {
    try { await navigator.clipboard.writeText(value);setCopied('Copied to clipboard.'); }
    catch { setCopied('Clipboard access is unavailable. Select and copy the contact text above.'); }
  };
  return <>
    <UnsavedChanges dirty={status !== snapshot.status || Boolean(note.trim())} />
    <PageHeading title={`Inquiry #${record.id.replace(/^INQ-/,'')}`} description={new Date(record.createdAt).toLocaleString('en-US')}><Button to='/admin/inquiries'>← Inquiries</Button></PageHeading>
    {mutation.isError && <div ref={errorRef} tabIndex={-1} role='alert' className='admin-notice admin-notice--error'>{mutation.error.message}</div>}
    {mutation.isSuccess && <Notice>Inquiry updated locally. No message was sent.</Notice>}
    <div className='admin-editor-grid'><div className='admin-stack'>
      <Panel title={record.name}>
        <dl className='admin-facts'><div><dt>Email</dt><dd>{record.email || 'Not provided'}</dd></div><div><dt>Phone</dt><dd>{record.phone || 'Not provided'}</dd></div><div><dt>ZIP code</dt><dd>{record.zip || 'Not provided'}</dd></div><div><dt>Service</dt><dd>{record.serviceLabel}</dd></div></dl>
        <div className='admin-actions'>{record.email && <Button onClick={() => copy(record.email)}>Copy email</Button>}{record.phone && <Button onClick={() => copy(record.phone)}>Copy phone</Button>}</div>
        {copied && <p role='status' className='admin-hint'>{copied}</p>}
      </Panel>
      <Panel title='Message'><p className='admin-prose'>{record.message || 'No message provided.'}</p>
        {source ? <><p className='admin-hint'>Source: {source.type === 'project' ? 'Gallery project' : 'Blog article'} · {source.title}</p>
          {exists ? <Link className='admin-link' to={source.type === 'project' ? '/gallery' : '/blog'} state={source.type === 'project' ? {projectId:source.id} : {articleId:source.id}}>View source {source.type} →</Link> : <p className='admin-hint'>The source is no longer published. Its title is retained with this inquiry.</p>}</> : <p className='admin-hint'>Source: Contact page</p>}
      </Panel>
      <Panel title={`Attachments · ${record.photos.length} photos`} description='Customer attachments are kept separate from the public media library.'>
        {record.photos.length ? <div className='admin-photo-grid'>{record.photos.map((photo) => <Attachment photo={photo} onOpen={setPreview} key={photo.id} />)}</div> : <p>No photos attached.</p>}
      </Panel>
      <Panel title='Internal notes' description='Only visible in this local admin workspace. Never shown on the public website.'>
        {snapshot.notes.length ? <ol className='admin-notes'>{snapshot.notes.map((item) => <li key={item.id}><p className='admin-prose'>{item.body}</p><small>{new Date(item.createdAt).toLocaleString('en-US')}</small></li>)}</ol> : <p className='admin-hint'>No notes yet.</p>}
        <Field name='internal-note' label='Add a note' multiline rows={4} maxLength={4000} value={note} onChange={(event) => setNote(event.target.value)} disabled={mutation.isPending} />
        <Button variant='primary' disabled={!note.trim() || mutation.isPending} onClick={() => mutation.mutate({status,note,revision:snapshot.revision})}>{mutation.isPending ? 'Saving…' : 'Save note'}</Button>
      </Panel>
    </div><aside className='admin-stack'><Panel title='Inquiry status'><Badge status={snapshot.status} />
      <Field name='inquiry-status' label='Status' value={status} disabled={mutation.isPending} onChange={(event) => setStatus(event.target.value)}>{statuses.map(([value,label]) => <option key={value} value={value}>{label}</option>)}</Field>
      <Button variant='primary' disabled={mutation.isPending} onClick={() => mutation.mutate({status,note,revision:snapshot.revision})}>{mutation.isPending ? 'Saving…' : 'Save status'}</Button>
      <p className='admin-hint'>New → In progress → Closed. Use Spam for unwanted requests.</p>
    </Panel><Panel title='Local demo'><p>These details are stored in this browser only. Replying by email is not connected.</p></Panel></aside></div>
    {preview && <Dialog title={preview.name} onClose={() => setPreview(null)} className='admin-dialog--photo'><img src={preview.url} alt={preview.name} /></Dialog>}
  </>;
}
