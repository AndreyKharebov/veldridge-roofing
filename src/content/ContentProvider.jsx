import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ContentContext } from './context.js';
import { workspaceApi, subscribeWorkspace } from '../api/workspace.js';
import './ContentProvider.sass';

export default function ContentProvider({ children }) {
  const client = useQueryClient();
  const query = useQuery({ queryKey:['workspace','content'], queryFn:workspaceApi.getContent });
  useEffect(() => subscribeWorkspace(() => {
    client.invalidateQueries({queryKey:['workspace']});
  }),[client]);
  if (!query.data) return <main className='content-status' aria-live='polite'>
    <h1>{query.isError ? 'Local content is unavailable.' : 'Loading Veldridge…'}</h1>
    <p>{query.isError ? query.error.message : 'Opening this browser’s demo workspace.'}</p>
    {query.isError && <button type='button' onClick={() => query.refetch()}>Try again</button>}
  </main>;
  return <ContentContext.Provider value={query.data}>{children}</ContentContext.Provider>;
}
