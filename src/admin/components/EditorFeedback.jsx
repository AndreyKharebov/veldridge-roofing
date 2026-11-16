import UnsavedChanges from './UnsavedChanges.jsx';
import { Notice } from './UI.jsx';
export default function EditorFeedback({ editor }) {
  return <>
    <UnsavedChanges dirty={editor.dirty} />
    {editor.mutation.isError && <div tabIndex={-1} role='alert' className='admin-notice admin-notice--error'>{editor.mutation.error.message}</div>}
    {editor.saved && editor.mutation.isSuccess && <Notice>Payload logged to DevTools. Temporary in-memory preview only; refresh clears it.</Notice>}
    {editor.dirty && <p className='admin-hint'>Unsaved changes</p>}
  </>;
}
