import { useEffect, useRef, useState } from 'react';

import { mediaApi } from '../../lib/media.js';

import { ConfirmDialog } from '../components/Dialog.jsx';

import {
  Button,
  Empty,
  Notice,
  PageHeading,
  Panel,
} from '../components/UI.jsx';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_FILES = 10;
const MAX_ALT_LENGTH = 300;

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const formatSize = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

function MediaCard({ item, onUpdated, onDelete }) {
  const [alt, setAlt] = useState(item.alt ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const savedAlt = item.alt ?? '';
  const changed = alt.trim() !== savedAlt;

  const saveAlt = async (event) => {
    event.preventDefault();

    if (saving || !changed) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await mediaApi.update(item.id, alt);

      setAlt(response.media.alt);
      onUpdated(response.media);
      setSuccess('Alt text saved successfully.');
    } catch (failure) {
      setError(failure.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Panel className='admin-media-card'>
      <a
        href={item.url}
        target='_blank'
        rel='noopener noreferrer'
        aria-label={`Open ${item.filename}`}
      >
        <img
          src={item.url}
          alt={savedAlt || item.filename}
          loading='lazy'
          style={{
            display: 'block',
            width: '100%',
            aspectRatio: '3 / 2',
            objectFit: 'cover',
            borderRadius: '8px',
          }}
        />
      </a>

      <div style={{ minWidth: 0 }}>
        <strong style={{ overflowWrap: 'anywhere' }}>{item.filename}</strong>

        <p className='admin-hint'>
          {formatSize(item.size)}
          {' · '}
          {formatDate(item.createdAt)}
        </p>
      </div>

      <form
        onSubmit={saveAlt}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <label htmlFor={`media-alt-${item.id}`} style={{ fontWeight: 600 }}>
          Alt text
        </label>

        <textarea
          id={`media-alt-${item.id}`}
          className='admin__control'
          value={alt}
          onChange={(event) => {
            setAlt(event.target.value);
            setError('');
            setSuccess('');
          }}
          maxLength={MAX_ALT_LENGTH}
          rows={3}
          disabled={saving}
          placeholder='Describe what is shown in this image'
        />

        <p className='admin-hint'>
          {alt.length}/{MAX_ALT_LENGTH} characters
        </p>

        {error && <Notice error>{error}</Notice>}
        {success && <Notice>{success}</Notice>}

        <Button variant='primary' type='submit' disabled={saving || !changed}>
          {saving ? 'Saving…' : 'Save alt text'}
        </Button>
      </form>

      <div className='admin-actions'>
        <a
          href={item.url}
          target='_blank'
          rel='noopener noreferrer'
          className='admin-link'
        >
          View original ↗
        </a>

        <span className='admin-spacer' />

        <Button
          variant='danger'
          disabled={saving}
          onClick={() => onDelete(item)}
        >
          Delete
        </Button>
      </div>
    </Panel>
  );
}

export default function Media() {
  const inputRef = useRef(null);
  const uploadingRef = useRef(false);

  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({
    current: 0,
    total: 0,
  });

  const [selectedForDelete, setSelectedForDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const refresh = () => {
    setRetry((value) => value + 1);
  };

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await mediaApi.getAll(page);

        if (!active) return;

        setItems(response.media);
        setPagination(response.pagination);
      } catch (failure) {
        if (!active) return;

        setItems([]);
        setPagination(null);
        setError(failure.message);
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [page, retry]);

  const handleUpdated = (updatedMedia) => {
    setItems((previous) =>
      previous.map((item) =>
        item.id === updatedMedia.id ? { ...item, ...updatedMedia } : item,
      ),
    );
  };

  const handleFiles = async (event) => {
    const files = Array.from(event.target.files || []);

    event.target.value = '';

    if (!files.length || uploadingRef.current) return;

    setUploadResults([]);

    if (files.length > MAX_FILES) {
      setUploadResults([
        {
          name: 'Selection',
          success: false,
          message: `Select no more than ${MAX_FILES} files at once.`,
        },
      ]);
      return;
    }

    const results = [];
    const validFiles = [];

    for (const file of files) {
      if (!ALLOWED_TYPES.has(file.type)) {
        results.push({
          name: file.name,
          success: false,
          message: 'Unsupported format. Use JPG, PNG or WebP.',
        });
      } else if (file.size === 0 || file.size > MAX_FILE_SIZE) {
        results.push({
          name: file.name,
          success: false,
          message: 'File must be larger than 0 and no more than 10 MB.',
        });
      } else {
        validFiles.push(file);
      }
    }

    if (!validFiles.length) {
      setUploadResults(results);
      return;
    }

    uploadingRef.current = true;
    setUploading(true);

    setUploadProgress({
      current: 0,
      total: validFiles.length,
    });

    for (let index = 0; index < validFiles.length; index += 1) {
      const file = validFiles[index];

      setUploadProgress({
        current: index + 1,
        total: validFiles.length,
      });

      try {
        const response = await mediaApi.upload(file);

        results.push({
          name: file.name,
          success: true,
          message: 'Uploaded successfully.',
          id: response.media.id,
        });
      } catch (failure) {
        results.push({
          name: file.name,
          success: false,
          message: failure.message,
        });
      }

      setUploadResults([...results]);
    }

    uploadingRef.current = false;
    setUploading(false);
    setUploadProgress({ current: 0, total: 0 });

    if (results.some((result) => result.success)) {
      if (page === 1) {
        refresh();
      } else {
        setPage(1);
      }
    }
  };

  const openDeleteDialog = (item) => {
    setDeleteError('');
    setSelectedForDelete(item);
  };

  const closeDeleteDialog = () => {
    if (deleting) return;

    setDeleteError('');
    setSelectedForDelete(null);
  };

  const confirmDelete = async () => {
    if (!selectedForDelete || deleting) return;

    setDeleting(true);
    setDeleteError('');

    try {
      await mediaApi.remove(selectedForDelete.id);

      setSelectedForDelete(null);

      // If the current page becomes empty,
      // move back to the preceding page.
      if (items.length === 1 && page > 1) {
        setPage((value) => value - 1);
      } else {
        refresh();
      }
    } catch (failure) {
      // Keep the dialog open so the administrator
      // can see the error and retry.
      setDeleteError(failure.message);
    } finally {
      setDeleting(false);
    }
  };

  const successfulUploads = uploadResults.filter(
    (result) => result.success,
  ).length;

  const failedUploads = uploadResults.filter(
    (result) => !result.success,
  ).length;

  return (
    <>
      <PageHeading
        title='Media Library'
        description='Upload, edit and manage images in Cloudflare R2.'
      >
        <Button
          variant='primary'
          disabled={uploading || deleting}
          onClick={() => inputRef.current?.click()}
        >
          + Upload images
        </Button>
      </PageHeading>

      <input
        ref={inputRef}
        type='file'
        accept='image/jpeg,image/png,image/webp'
        multiple
        onChange={handleFiles}
        disabled={uploading || deleting}
        aria-label='Select images to upload'
        style={{ display: 'none' }}
      />

      <Panel title='Upload images'>
        <p className='admin-hint'>
          JPG, PNG or WebP. Maximum 10 MB per file. Select up to 10 images at
          once.
        </p>

        <div className='admin-actions'>
          <Button
            disabled={uploading || deleting}
            onClick={() => inputRef.current?.click()}
          >
            Choose files
          </Button>

          {uploading && (
            <span role='status'>
              Uploading {uploadProgress.current} of {uploadProgress.total}…
            </span>
          )}
        </div>

        {uploadResults.length > 0 && (
          <div aria-live='polite'>
            {!uploading && (
              <p className='admin-hint'>
                Uploaded: {successfulUploads}
                {' · '}
                Failed: {failedUploads}
              </p>
            )}

            <ul>
              {uploadResults.map((result, index) => (
                <li key={`${result.name}-${index}`}>
                  <strong>{result.name}</strong>
                  {' — '}
                  <span
                    style={{
                      color: result.success ? '#226549' : '#b42318',
                    }}
                  >
                    {result.message}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Panel>

      {error && (
        <Notice error>
          {error}

          <div className='admin-actions'>
            <Button onClick={refresh}>Try again</Button>
          </div>
        </Notice>
      )}

      {loading ? (
        <Panel>
          <p>Loading images…</p>
        </Panel>
      ) : (
        <>
          {!error && items.length === 0 && (
            <Empty title='No images yet.'>
              Uploaded images will appear here.
            </Empty>
          )}

          {!error && (
            <div className='admin-media-grid'>
              {items.map((item) => (
                <MediaCard
                  key={item.id}
                  item={item}
                  onUpdated={handleUpdated}
                  onDelete={openDeleteDialog}
                />
              ))}
            </div>
          )}

          {pagination && (
            <div className='admin-actions'>
              <p className='admin-hint'>
                {pagination.total} images · Page {pagination.page} of{' '}
                {Math.max(1, pagination.totalPages)}
              </p>

              <span className='admin-spacer' />

              <Button
                disabled={page <= 1 || uploading || deleting}
                onClick={() => setPage((value) => value - 1)}
              >
                Previous
              </Button>

              <Button
                disabled={
                  page >= pagination.totalPages || uploading || deleting
                }
                onClick={() => setPage((value) => value + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {selectedForDelete && (
        <ConfirmDialog
          title='Delete image?'
          action='Delete image'
          danger
          pending={deleting}
          onClose={closeDeleteDialog}
          onConfirm={confirmDelete}
        >
          <p>
            Are you sure you want to permanently delete{' '}
            <strong>{selectedForDelete.filename}</strong>?
          </p>

          <p className='admin-hint'>
            The image will be removed from Cloudflare R2 and MongoDB. This
            action cannot be undone.
          </p>

          {deleteError && <Notice error>{deleteError}</Notice>}
        </ConfirmDialog>
      )}
    </>
  );
}
