import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '../lib/http.js';
import { NEWS_CHANNEL, NEWS_UPDATED } from '../lib/news.js';

// Lists and readers share abort/race handling. Admin editors do not refresh over drafts.
export function useNewsResource(path, live = false) {
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState({ path: '', data: null, loading: true, error: '' });
  const reload = useCallback(() => {
    setResult((previous) => ({ ...previous, loading: true, error: '' }));
    setRevision((value) => value + 1);
  }, []);
  useEffect(() => {
    let active = true;
    let controller;
    let channel;
    const load = async () => {
      controller?.abort();
      const request = new AbortController();
      controller = request;
      try {
        const data = await apiRequest(path, { signal: request.signal });
        if (active && !request.signal.aborted) setResult({ path, data, loading: false, error: '' });
      } catch (failure) {
        if (!active || request.signal.aborted) return;
        // Do not retain potentially unpublished content after a failed refresh.
        setResult({ path, data: null, loading: false, error: failure.status === 401
          ? 'Your session expired. Sign in again.' : failure.message });
      }
    };
    const refresh = () => { if (!document.hidden) void load(); };
    void load();
    if (live) {
      window.addEventListener('focus', refresh);
      window.addEventListener(NEWS_UPDATED, refresh);
      document.addEventListener('visibilitychange', refresh);
      try {
        channel = new BroadcastChannel(NEWS_CHANNEL);
        channel.onmessage = (event) => { if (event.data === 'updated') refresh(); };
      } catch { /* Not all browser contexts provide BroadcastChannel. */ }
    }
    return () => {
      active = false;
      controller?.abort();
      channel?.close();
      window.removeEventListener('focus', refresh);
      window.removeEventListener(NEWS_UPDATED, refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [path, live, revision]);
  return { ...(result.path === path ? result : { data: null, loading: true, error: '' }), reload };
}
