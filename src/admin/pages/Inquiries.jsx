import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import NotFound from '../../components/feedback/NotFound/NotFound.jsx';
import { inquiriesApi, INQUIRIES_CHANNEL, INQUIRIES_UPDATED } from '../../lib/inquiries.js';
import { Badge, Button, Empty, Field, Notice, PageHeading, Panel } from '../components/UI.jsx';
import InquiryDeleteDialog from '../components/inquiries/InquiryDeleteDialog.jsx';
import InquiryRecord from '../components/inquiries/InquiryRecord.jsx';
import { statusOptions, formatInquiryDate, inquiryFailure } from '../components/inquiries/inquiryView.js';
import './Inquiries.sass';

export function InquiriesList() {
  const [query, setQuery] = useState({ page: 1, status: 'all', search: '' });
  const [search, setSearch] = useState('');
  const [retry, setRetry] = useState(0);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState({ inquiries: [], counts: {}, pagination: null, loading: true, error: '' });
  useEffect(() => {
    const refresh = () => {
      setResult((previous) => ({ ...previous, loading: true, error: '' }));
      setRetry((value) => value + 1);
    };
    let channel;
    window.addEventListener(INQUIRIES_UPDATED, refresh);
    try { channel = new BroadcastChannel(INQUIRIES_CHANNEL); channel.onmessage = (event) => { if (event.data === 'updated') refresh(); }; } catch { /* Manual refresh remains available. */ }
    return () => { channel?.close(); window.removeEventListener(INQUIRIES_UPDATED, refresh); };
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        const response = await inquiriesApi.list(query, { signal: controller.signal });
        if (controller.signal.aborted) return;
        const last = Math.max(1, response.pagination.totalPages);
        if (query.page > last) { setQuery((previous) => ({ ...previous, page: last })); return; }
        setResult({ ...response, loading: false, error: '' });
      } catch (error) {
        if (!controller.signal.aborted) setResult({ inquiries: [], counts: {}, pagination: null, loading: false, error: inquiryFailure(error) });
      }
    };
    void load(); return () => controller.abort();
  }, [query, retry]);
  const refresh = () => {
    setResult((previous) => ({ ...previous, loading: true, error: '' }));
    setRetry((value) => value + 1);
  };
  const changeQuery = (update) => {
    setResult((previous) => ({ ...previous, loading: true, error: '' }));
    setQuery(update);
  };
  return <div className='inquiries-admin'>
    <PageHeading title='Inquiries' description='Messages from Contact. Customer details and photos are private.'>
      <Button disabled={result.loading || Boolean(selected)} onClick={() => refresh()}>Refresh inbox</Button>
    </PageHeading>
    <div className='admin-filter-bar' role='group' aria-label='Filter inquiries by status'>
      {[['all', 'All inquiries'], ...statusOptions].map(([value, label]) => <Button key={value} disabled={Boolean(selected)} aria-pressed={query.status === value}
        onClick={() => changeQuery((previous) => ({ ...previous, status: value, page: 1 }))}>{label} · {result.counts[value] ?? 0}</Button>)}
    </div>
    <p className='admin-hint'>Status counts cover the whole inbox. Search results are filtered below.</p>
    <form className='inquiries-admin__search' onSubmit={(event) => { event.preventDefault(); changeQuery((previous) => ({ ...previous, search: search.trim(), page: 1 })); }}>
      <Field name='search-inquiries' label='Search inquiries' value={search} maxLength={120} placeholder='Name, email, phone, message or reference'
        onChange={(event) => setSearch(event.target.value)} />
      <Button type='submit' disabled={Boolean(selected)}>Search</Button>
      <Button disabled={!search && !query.search} onClick={() => { setSearch(''); changeQuery((previous) => ({ ...previous, search: '', page: 1 })); }}>Clear</Button>
    </form>
    {result.loading ? <Panel><p role='status'>Loading inquiries…</p></Panel> : result.error ? <Notice error><p>{result.error}</p><Button onClick={() => refresh()}>Retry</Button><Button to='/admin/login'>Sign in</Button></Notice>
      : result.inquiries.length ? <div className='admin-table-wrap'><table className='admin-table inquiries-admin__table'>
        <thead><tr><th>Customer</th><th>Message / service</th><th>Received</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>{result.inquiries.map((row) => <tr key={row.id}>
          <td data-label='Customer'><strong>{row.name}</strong><small>{row.email || row.phone}</small></td>
          <td data-label='Message / service'><strong>{row.serviceTitle || 'Not sure yet'}</strong><small>{row.message || 'No message supplied.'}</small><small>{row.attachmentCount} private photos</small></td>
          <td data-label='Received'>{formatInquiryDate(row.createdAt)}</td>
          <td data-label='Status'><Badge status={row.status} />{row.state === 'deleting' && <small>Deletion pending</small>}</td>
          <td data-label='Actions'><div className='inquiries-admin__actions'><Link className='admin-button' to={`/admin/inquiries/${row.id}`}>View</Link><Button variant='danger' onClick={() => setSelected(row)}>Delete</Button></div></td>
        </tr>)}</tbody>
      </table></div> : <Empty title={query.search || query.status !== 'all' ? 'No matching inquiries.' : 'No inquiries yet.'}><p>Submitted Contact messages will appear here.</p><Button to='/contact'>Open Contact</Button></Empty>}
    {result.pagination && !result.loading && <nav className='inquiries-admin__pagination' aria-label='Inquiry pages'>
      <p className='admin-hint'>{result.pagination.total} matching inquiries · Page {query.page} of {Math.max(1, result.pagination.totalPages)}</p>
      <div className='admin-actions'><Button disabled={query.page <= 1 || Boolean(selected)} onClick={() => changeQuery((previous) => ({ ...previous, page: previous.page - 1 }))}>Previous</Button>
        <Button disabled={query.page >= result.pagination.totalPages || Boolean(selected)} onClick={() => changeQuery((previous) => ({ ...previous, page: previous.page + 1 }))}>Next</Button></div>
    </nav>}
    {selected && <InquiryDeleteDialog inquiry={selected} onClose={() => { setSelected(null); refresh(); }} onDeleted={() => { setSelected(null); refresh(); }} />}
  </div>;
}
export function InquiryDetail() {
  const { id } = useParams();
  return <LoadInquiry key={id} id={id} />;
}
function LoadInquiry({ id }) {
  const [retry, setRetry] = useState(0);
  const [result, setResult] = useState({ inquiry: null, error: '', status: 'loading' });
  useEffect(() => {
    const controller = new AbortController();
    inquiriesApi.get(id, { signal: controller.signal }).then(({ inquiry }) => {
      if (!controller.signal.aborted) setResult({ inquiry, error: '', status: 'ready' });
    }).catch((error) => {
      if (!controller.signal.aborted) setResult({ inquiry: null, error: inquiryFailure(error), status: error.status === 404 || error.status === 400 ? 'missing' : 'error' });
    });
    return () => controller.abort();
  }, [id, retry]);
  if (result.status === 'loading') return <Panel><p role='status'>Loading inquiry…</p></Panel>;
  if (result.status === 'missing') return <NotFound variant='admin' title='Inquiry not found.' returnTo='/admin/inquiries' returnLabel='Back to inquiries' />;
  if (result.error) return <Notice error><p>{result.error}</p><Button onClick={() => { setResult({ inquiry: null, error: '', status: 'loading' }); setRetry((value) => value + 1); }}>Retry</Button><Button to='/admin/login'>Sign in</Button></Notice>;
  return <InquiryRecord initial={result.inquiry} />;
}
