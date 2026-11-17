import { useEffect, useRef, useState } from 'react';
import { mediaApi } from '../../lib/media.js';
import { Button, Empty, Notice, PageHeading, Panel } from '../components/UI.jsx';
import MediaCard from '../components/media/MediaCard.jsx';
import MediaEditDialog from '../components/media/MediaEditDialog.jsx';
import MediaDeleteDialog from '../components/media/MediaDeleteDialog.jsx';
import './Media.sass';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_FILES = 10;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function SelectPage({ checked, mixed, disabled, onChange }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.indeterminate = mixed; }, [mixed]);
  return <label className='media-library__check'>
    <input ref={ref} type='checkbox' checked={checked} disabled={disabled} onChange={onChange} />
    <span>Select all on this page</span>
  </label>;
}

export default function Media() {
  const inputRef = useRef(null);
  const mounted = useRef(false);
  const uploadLock = useRef(false);
  const [query, setQuery] = useState({ page: 1, revision: 0 });
  const [result, setResult] = useState({ items: [], pagination: null, loading: true, error: '' });
  const [selectedIds, setSelectedIds] = useState([]);
  const [editing, setEditing] = useState(null);
  const [deleteTargets, setDeleteTargets] = useState(null);
  const [mutationPending, setMutationPending] = useState(false);
  const [notice, setNotice] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const { items, pagination, loading, error } = result;
  const selectedItems = items.filter((item) => selectedIds.includes(item.id));
  const busy = uploading || mutationPending;
  const blocked = busy || loading || Boolean(editing || deleteTargets);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  useEffect(() => {
    if (!busy) return;
    const warn = (event) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [busy]);
  useEffect(() => {
    const controller = new AbortController();
    mediaApi.getAll(query.page, { signal: controller.signal }).then((response) => {
      if (controller.signal.aborted) return;
      const lastPage = Math.max(1, response.pagination.totalPages);
      if (query.page > lastPage) {
        setSelectedIds([]); setQuery((previous) => ({ ...previous, page: lastPage })); return;
      }
      setResult({ items: response.media, pagination: response.pagination, loading: false, error: '' });
      setSelectedIds((previous) => previous.filter((id) => response.media.some((item) => item.id === id)));
    }).catch((failure) => {
      if (controller.signal.aborted) return;
      setSelectedIds([]);
      setResult({ items: [], pagination: null, loading: false, error: failure.status === 401
        ? 'Your session expired. Sign in again to view the media library.' : failure.message });
    });
    return () => controller.abort();
  }, [query]);
  const reload = (page = query.page) => {
    setResult((previous) => ({ ...previous, loading: true, error: '' }));
    setQuery((previous) => ({ page, revision: previous.revision + 1 }));
  };
  const changePage = (page) => {
    if (blocked) return;
    setSelectedIds([]); setNotice(''); reload(page);
  };
  const select = (id) => {
    if (blocked) return;
    setSelectedIds((previous) => previous.includes(id) ? previous.filter((value) => value !== id) : [...previous, id]);
  };
  const openDelete = (targets) => {
    if (blocked || !targets.length) return;
    setNotice(''); setDeleteTargets(targets.map(({ id, filename }) => ({ id, filename })));
  };
  const handleDeleted = (ids) => {
    const removed = new Set(ids);
    setSelectedIds((previous) => previous.filter((id) => !removed.has(id)));
    setResult((previous) => ({ ...previous, items: previous.items.filter((item) => !removed.has(item.id)) }));
    setNotice(`${ids.length} ${ids.length === 1 ? 'image removed' : 'images removed'} from the library.`); reload();
  };
  const handleSaved = (media) => {
    setResult((previous) => ({ ...previous, items: previous.items.map((item) => item.id === media.id ? media : item) }));
    setNotice('Image name and alt text saved.'); setEditing(null); setMutationPending(false);
  };
  const handleFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length || uploadLock.current || blocked) return;
    setNotice(''); setUploadResults([]);
    if (files.length > MAX_FILES) {
      setUploadResults([{ name: 'Selection', success: false, message: `Choose no more than ${MAX_FILES} images at once.` }]); return;
    }
    const results = []; const valid = [];
    for (const file of files) {
      if (!ALLOWED_TYPES.has(file.type)) results.push({ name: file.name, success: false, message: 'Use a JPEG, PNG or WebP image.' });
      else if (!file.size || file.size > MAX_FILE_SIZE) results.push({ name: file.name, success: false, message: 'Image must be larger than 0 and no more than 10 MB.' });
      else valid.push(file);
    }
    setUploadResults([...results]);
    if (!valid.length) return;
    uploadLock.current = true; setUploading(true); setSelectedIds([]);
    try {
      for (let index = 0; index < valid.length; index += 1) {
        if (!mounted.current) break;
        const file = valid[index];
        setUploadProgress({ current: index + 1, total: valid.length });
        try {
          await mediaApi.upload(file);
          results.push({ name: file.name, success: true, message: 'Uploaded successfully.' });
        } catch (failure) {
          results.push({ name: file.name, success: false, message: failure.message });
          if (failure.status === 401 || failure.status === 403) {
            for (const unprocessed of valid.slice(index + 1)) results.push({ name: unprocessed.name, success: false, message: 'Not uploaded. Check your session and access.' });
            break;
          }
        }
        if (mounted.current) setUploadResults([...results]);
      }
    } finally {
      uploadLock.current = false;
      if (mounted.current) {
        setUploadResults([...results]); setUploading(false);
        if (results.some((entry) => entry.success)) reload(1);
      }
    }
  };

  return <div className='media-library'>
    <PageHeading title='Media Library' description='Your images, ready for the website. Edit details or select images to remove.'>
      <Button variant='primary' disabled={blocked} onClick={() => inputRef.current?.click()}>+ Upload images</Button>
    </PageHeading>
    <input ref={inputRef} type='file' accept='image/jpeg,image/png,image/webp' multiple hidden onChange={handleFiles} disabled={blocked} aria-label='Select images to upload' />
    <div className='media-library__upload'>
      <div><h2>Build your image library</h2><p>JPG, PNG or WebP · Up to 10 MB each · Up to 10 images per upload</p></div>
      {uploading && <div className='media-library__progress' role='status'>
        <span>Uploading {uploadProgress.current} of {uploadProgress.total}…</span>
        <progress value={Math.max(0, uploadProgress.current - 1)} max={Math.max(1, uploadProgress.total)} aria-label='Images uploaded' />
      </div>}
    </div>
    {uploadResults.length > 0 && <div className='media-library__results' aria-live='polite'>
      <p>{uploading ? 'Upload results' : `${uploadResults.filter((entry) => entry.success).length} uploaded · ${uploadResults.filter((entry) => !entry.success).length} not uploaded`}</p>
      <ul>{uploadResults.map((entry, index) => <li key={`${index}-${entry.name}`} className={entry.success ? 'is-success' : 'is-error'}><strong>{entry.name}</strong><span>{entry.message}</span></li>)}</ul>
    </div>}
    {notice && <Notice>{notice}</Notice>}
    <div className='media-library__toolbar'>
      <div className='media-library__selection'>
        <SelectPage checked={items.length > 0 && selectedItems.length === items.length} mixed={selectedItems.length > 0 && selectedItems.length < items.length}
          disabled={blocked || !items.length} onChange={(event) => setSelectedIds(event.target.checked ? items.map(({ id }) => id) : [])} />
        <span className='media-library__count' aria-live='polite'>{selectedItems.length} selected</span>
        {selectedItems.length > 0 && <button className='media-library__clear' type='button' disabled={blocked} onClick={() => setSelectedIds([])}>Clear</button>}
      </div>
      <Button variant='danger' disabled={blocked || !selectedItems.length} onClick={() => openDelete(selectedItems)}>Delete selected{selectedItems.length > 0 ? ` (${selectedItems.length})` : ''}</Button>
      <p className='media-library__scope'>Selection applies to this page only and clears when you change pages.</p>
    </div>
    {error && <Notice error><p>{error}</p><div className='admin-actions'><Button disabled={busy} onClick={() => reload()}>Try again</Button><Button to='/admin/login'>Sign in</Button></div></Notice>}
    {loading ? <Panel><p role='status'>Loading images…</p></Panel> : !error && (items.length ? <div className='media-library__grid'>
      {items.map((item) => <MediaCard key={item.id} item={item} selected={selectedIds.includes(item.id)} disabled={blocked}
        onSelect={select} onEdit={(image) => { if (!blocked) { setNotice(''); setEditing(image); } }} onDelete={openDelete} />)}
    </div> : <Empty title='No images yet.'><p>Upload your first image to get started.</p></Empty>)}
    {pagination && !error && <nav className='media-library__pagination' aria-label='Media pages'>
      <p>{pagination.total} images · Page {pagination.page} of {Math.max(1, pagination.totalPages)}</p>
      <div><Button disabled={blocked || query.page <= 1} onClick={() => changePage(query.page - 1)}>Previous</Button><Button disabled={blocked || query.page >= pagination.totalPages} onClick={() => changePage(query.page + 1)}>Next</Button></div>
    </nav>}
    {editing && <MediaEditDialog key={editing.id} item={editing} onSaved={handleSaved} onClose={() => setEditing(null)} onBusy={setMutationPending} />}
    {deleteTargets && <MediaDeleteDialog items={deleteTargets} onDeleted={handleDeleted} onClose={() => { setDeleteTargets(null); setMutationPending(false); }} onBusy={setMutationPending} />}
  </div>;
}
