import { createContext, useContext } from 'react';
export const ContentContext = createContext(null);
export function useContent() {
  const content = useContext(ContentContext);
  if (!content) throw new Error('useContent must be used inside ContentProvider.');
  return content;
}
