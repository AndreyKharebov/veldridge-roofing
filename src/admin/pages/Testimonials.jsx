import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { testimonialsApi } from '../../lib/testimonials.js';
import { useTestimonialResource } from '../../hooks/useTestimonialResource.js';
import NotFound from '../../components/feedback/NotFound/NotFound.jsx';
import { Badge, Button, Empty, Notice, PageHeading, Panel } from '../components/UI.jsx';
import TestimonialForm from '../components/testimonials/TestimonialForm.jsx';
import TestimonialDeleteDialog from '../components/testimonials/TestimonialDeleteDialog.jsx';
import { freshTestimonial, toTestimonialForm } from '../components/testimonials/testimonialForm.js';
import { ListToolbar, Pagination, StatusFilters } from '../components/Workspace.jsx';
import './Testimonials.sass';

export function TestimonialsList() {
  const location = useLocation();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('all');
  const [selected, setSelected] = useState(null);
  const [notice, setNotice] = useState(location.state?.notice || '');
  const result = useTestimonialResource(`/api/admin/testimonials?${new URLSearchParams({ page: String(page), status })}`, true);
  const items = result.data?.testimonials ?? [];
  const pagination = result.data?.pagination;
  useEffect(() => {
    if (location.state?.notice) navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);
  // Adjust only our own state after a last-page deletion; the next render loads the valid page.
  if (!result.loading && pagination && page > Math.max(1, pagination.totalPages)) {
    setPage(Math.max(1, pagination.totalPages));
  }
  return <div className='testimonials-admin'>
    <PageHeading title='Testimonials' description='Add and manage the reviews displayed on Home.'>
      <div className='admin-actions'><Button disabled={result.loading} onClick={result.reload}>Refresh</Button><Button variant='primary' to='/admin/testimonials/new'>+ Add review</Button></div>
    </PageHeading>
    <ListToolbar><StatusFilters options={['all', 'published', 'draft', 'archived'].map((key) => [key, key === 'all' ? 'All reviews' : key[0].toUpperCase() + key.slice(1)])}
      value={status} disabled={result.loading} onChange={(value) => { setPage(1); setStatus(value); }} /></ListToolbar>
    {notice && <Notice>{notice}</Notice>}
    {result.loading && <Panel><p role='status'>Loading reviews…</p></Panel>}
    {result.error && <Notice error><p>{result.error}</p><Button onClick={result.reload}>Try again</Button></Notice>}
    {!result.loading && !result.error && (items.length ? <div className='admin-table-wrap'>
      <table className='admin-table testimonials-admin__table'>
        <thead><tr><th>Author / review</th><th>Rating</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>{items.map((item) => <tr key={item.id}>
          <td data-label='Author / review'><strong>{item.name}</strong><small>{item.location}</small><p className='testimonials-admin__excerpt'>{item.review || 'No review text yet'}</p></td>
          <td data-label='Rating'>{item.rating} / 5</td>
          <td data-label='Status'><Badge status={item.status} />{item.isDemo && <small>Demo review</small>}</td>
          <td data-label='Actions'><div className='admin-actions'><Button to={`/admin/testimonials/${item.id}`}>Edit</Button><Button variant='danger' onClick={() => setSelected(item)}>Delete</Button></div></td>
        </tr>)}</tbody>
      </table>
    </div> : <Empty title={status === 'all' ? 'No reviews yet.' : 'No reviews with this status.'}><p>Create a draft and publish when it is ready.</p></Empty>)}
    {!result.loading && !result.error && <Pagination pagination={pagination} page={page} noun='reviews' onPageChange={setPage} />}
    <p className='admin-hint'>Drafts and archived reviews are private. Home shows published reviews newest first by first publication date.</p>
    {selected && <TestimonialDeleteDialog item={selected} onClose={() => setSelected(null)} onDone={() => { setSelected(null); setNotice('Review deleted. Its photo stays in Media Library.'); result.reload(); }} />}
  </div>;
}

export function TestimonialEditor() {
  const { id } = useParams();
  return id ? <ExistingTestimonial key={id} id={id} /> : <TestimonialForm key='new' initial={freshTestimonial()} />;
}
function ExistingTestimonial({ id }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [seed] = useState(() => location.state?.createdTestimonial?.id === id ? location.state.createdTestimonial : null);
  const [retry, setRetry] = useState(0);
  const [result, setResult] = useState({ item: seed, loading: !seed, error: '', missing: false });
  useEffect(() => {
    if (location.state?.createdTestimonial?.id === id) navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, id, navigate]);
  useEffect(() => {
    const controller = new AbortController();
    testimonialsApi.get(id, { signal: controller.signal }).then(({ testimonial }) => {
      if (!controller.signal.aborted) setResult({ item: testimonial, loading: false, error: '', missing: false });
    }).catch((failure) => {
      if (!controller.signal.aborted) setResult({ item: null, loading: false, error: failure.message, missing: failure.status === 404 });
    });
    return () => controller.abort();
  }, [id, retry]);
  if (result.loading) return <Panel><p role='status'>Loading review…</p></Panel>;
  if (result.missing) return <NotFound variant='admin' title='Review not found.' returnTo='/admin/testimonials' returnLabel='Back to reviews' />;
  if (result.error) return <Notice error><p>{result.error}</p><Button onClick={() => { setResult((previous) => ({ ...previous, loading: true })); setRetry((value) => value + 1); }}>Try again</Button></Notice>;
  return <TestimonialForm initial={toTestimonialForm(result.item)} created={Boolean(seed)} />;
}
