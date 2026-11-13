import { useEffect } from 'react';
import { useBlocker } from 'react-router';
import { ConfirmDialog } from './Dialog.jsx';

export default function UnsavedChanges({ dirty }) {
  const blocker = useBlocker(dirty);
  useEffect(() => {
    if (!dirty) return;
    const beforeUnload = (event) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload',beforeUnload);
    return () => window.removeEventListener('beforeunload',beforeUnload);
  },[dirty]);
  return blocker.state === 'blocked' ? <ConfirmDialog title='Discard unsaved changes?' action='Discard changes' danger
    onConfirm={() => blocker.proceed()} onClose={() => blocker.reset()}>
    <p>Your edits have not been saved. Stay on this page to keep editing.</p>
  </ConfirmDialog> : null;
}
