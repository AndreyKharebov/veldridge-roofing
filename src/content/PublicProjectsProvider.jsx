import { useCallback, useEffect, useMemo, useState } from 'react';
import { projectsApi, PROJECTS_UPDATED, PROJECTS_CHANNEL } from '../lib/projects.js';
import { SERVICES_UPDATED, SERVICES_CHANNEL } from '../lib/services.js';
import { ContentContext, useContent } from './context.js';

export default function PublicProjectsProvider({ children }) {
  const inherited = useContent();
  const [result, setResult] = useState({ projects: [], status: 'loading', error: '' });
  const [retry, setRetry] = useState(0);
  const reloadProjects = useCallback(() => setRetry((value) => value + 1), []);
  useEffect(() => {
    let active = true;
    let controller;
    const channels = [];
    const load = async () => {
      controller?.abort();
      const request = new AbortController(); controller = request;
      try {
        const { projects } = await projectsApi.getPublic({ signal: request.signal });
        if (active && !request.signal.aborted) setResult({ projects, status: 'ready', error: '' });
      } catch (error) {
        if (active && !request.signal.aborted) {
          // Do not leave archived/deleted content visible after a failed refresh.
          setResult({ projects: [], status: 'error', error: error.message || 'Projects are temporarily unavailable.' });
        }
      }
    };
    const refresh = () => { if (!document.hidden) void load(); };
    void load();
    window.addEventListener('focus', refresh);
    window.addEventListener(PROJECTS_UPDATED, refresh);
    window.addEventListener(SERVICES_UPDATED, refresh);
    document.addEventListener('visibilitychange', refresh);
    try {
      if ('BroadcastChannel' in window) for (const name of [PROJECTS_CHANNEL, SERVICES_CHANNEL]) {
        const channel = new BroadcastChannel(name);
        channel.onmessage = (event) => { if (event.data === 'updated') refresh(); };
        channels.push(channel);
      }
    } catch { /* Focus refresh remains available. */ }
    return () => {
      active = false; controller?.abort(); channels.forEach((channel) => channel.close());
      window.removeEventListener('focus', refresh);
      window.removeEventListener(PROJECTS_UPDATED, refresh);
      window.removeEventListener(SERVICES_UPDATED, refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [retry]);
  const content = useMemo(() => ({ ...inherited, projects: result.projects,
    projectsStatus: result.status, projectsError: result.error, reloadProjects,
  }), [inherited, result, reloadProjects]);
  return <ContentContext.Provider value={content}>{children}</ContentContext.Provider>;
}
