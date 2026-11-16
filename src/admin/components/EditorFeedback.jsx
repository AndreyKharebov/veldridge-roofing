import { Notice } from './UI.jsx';

export default function EditorFeedback({ editor }) {
  return editor.submitted
    ? <Notice>Form data logged to the browser console. Nothing was sent or saved.</Notice>
    : null;
}
