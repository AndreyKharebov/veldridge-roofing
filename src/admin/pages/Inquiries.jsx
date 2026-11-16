import { useState } from 'react';
import { useParams } from 'react-router';
import NotFound from '../../components/feedback/NotFound/NotFound.jsx';
import { useContent } from '../../content/context.js';
import { logForm } from '../../utils/logForm.js';
import { Button, Empty, Field, Notice, PageHeading, Panel } from '../components/UI.jsx';
import InquiryTable from '../components/InquiryTable.jsx';

const statuses = [['new','New'],['in-progress','In progress'],['closed','Closed'],['spam','Spam']];
export function InquiriesList() {
  const { inquiries } = useContent();
  const [status,setStatus] = useState('all');
  const [search,setSearch] = useState('');
  const filtered = inquiries.filter((record) => (status === 'all' || record.status === status) && `${record.name} ${record.email} ${record.phone} ${record.message}`.toLowerCase().includes(search.toLowerCase()));
  return <>
    <PageHeading title='Inquiries' description='Inbox layout. No customer data is loaded.' />
    <div className='admin-filter-bar' aria-label='Inquiry status'>
      {[['all','All inquiries'],...statuses].map(([value,label]) => <Button key={value} variant={status === value ? 'primary' : 'secondary'} aria-pressed={status === value} onClick={() => setStatus(value)}>{label} · {value === 'all' ? inquiries.length : inquiries.filter((row) => row.status === value).length}</Button>)}
    </div>
    <Field name='search-inquiries' label='Search inquiries' value={search} placeholder='Name, email, phone or message' onChange={(event) => setSearch(event.target.value)} />
    {filtered.length ? <InquiryTable records={filtered} detailed /> : <Empty title='No inquiries yet.'><p>Contact submissions only log to the console. They do not appear here.</p><Button to='/contact'>Open Contact</Button><Button to='/admin/inquiries/preview'>Preview details layout</Button></Empty>}
    <p className='admin-hint' aria-live='polite'>{filtered.length} of {inquiries.length} inquiries</p>
  </>;
}
export function InquiryDetail() {
  const { id } = useParams();
  // A blank layout is inspectable without creating a fictitious customer record.
  if (id !== 'preview') return <NotFound variant='admin' title='Inquiry not found.' description='No inquiries are loaded in the static layout.' returnTo='/admin/inquiries' returnLabel='Back to inquiries' />;
  return <InquiryLayout />;
}
function InquiryLayout() {
  const [status,setStatus] = useState('');
  const [note,setNote] = useState('');
  const [logged,setLogged] = useState(false);
  const submit = (event) => {
    event.preventDefault();
    logForm('Inquiry update', { status, note });
    setLogged(true);
  };
  return <>
    <PageHeading title='Inquiry details' description='Empty layout preview · No customer record.'><Button to='/admin/inquiries'>← Inquiries</Button></PageHeading>
    {logged && <Notice>Form data logged to the console. No inquiry or note was saved.</Notice>}
    <div className='admin-editor-grid'><div className='admin-stack'>
      <Panel title='Customer details'><dl className='admin-facts'>{['Name','Email','Phone','ZIP code','Service'].map((label) => <div key={label}><dt>{label}</dt><dd>—</dd></div>)}</dl><div className='admin-actions'><Button disabled>Copy email</Button><Button disabled>Copy phone</Button></div></Panel>
      <Panel title='Message'><p className='admin-prose'>No inquiry selected.</p><p className='admin-hint'>Source: —</p></Panel>
      <Panel title='Attachments · 0 photos' description='Customer attachments will be separate from the public media library.'><p>No photos attached.</p></Panel>
      <Panel title='Internal notes' description='Static form. Notes are never saved.'><p className='admin-hint'>No notes yet.</p>
        <form onSubmit={submit}><Field name='internal-note' label='Add a note' multiline rows={4} maxLength={4000} value={note} onChange={(event) => {setNote(event.target.value);setLogged(false);}} /><Button variant='primary' type='submit'>Save note</Button></form>
      </Panel>
    </div><aside className='admin-stack'><Panel title='Inquiry status'><form onSubmit={submit}>
      <Field name='inquiry-status' label='Status' value={status} onChange={(event) => {setStatus(event.target.value);setLogged(false);}}><option value=''>Choose a status</option>{statuses.map(([value,label]) => <option key={value} value={value}>{label}</option>)}</Field>
      <Button variant='primary' type='submit'>Save status</Button><p className='admin-hint'>New → In progress → Closed. Use Spam for unwanted requests.</p>
    </form></Panel><Panel title='Layout preview'><p>No customer information, messages or uploaded attachments are stored in this frontend.</p></Panel></aside></div>
  </>;
}
