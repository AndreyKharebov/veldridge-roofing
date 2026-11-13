import UnsavedChanges from './UnsavedChanges.jsx';
import { Notice } from './UI.jsx';
export default function EditorFeedback({ editor }) {
  return <>
    <UnsavedChanges dirty={editor.dirty} />
    {editor.mutation.isError && <div tabIndex={-1} role='alert' className='admin-notice admin-notice--error'>{editor.mutation.error.message}</div>}
    {editor.saved && <Notice>Saved locally. Your changes are stored in this browser.</Notice>}
    {editor.dirty && <p className='admin-hint'>Unsaved changes</p>}
  </>;
}
