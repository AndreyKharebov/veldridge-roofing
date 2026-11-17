import { useCallback, useEffect, useState } from 'react';
import { apiRequest } from '../lib/http.js';
import { TESTIMONIALS_CHANNEL, TESTIMONIALS_UPDATED } from '../lib/testimonials.js';

export function useTestimonialResource(path, live = false) {
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
        if (active && !request.signal.aborted) setResult({ path, data: null, loading: false,
          error: failure.status === 401 ? 'Your session expired. Sign in again.' : failure.message });
      }
    };
    const refresh = () => { if (!document.hidden) void load(); };
    void load();
    if (live) {
      window.addEventListener('focus', refresh);
      window.addEventListener(TESTIMONIALS_UPDATED, refresh);
      document.addEventListener('visibilitychange', refresh);
      try {
        channel = new BroadcastChannel(TESTIMONIALS_CHANNEL);
        channel.onmessage = (event) => { if (event.data === 'updated') refresh(); };
      } catch { /* Focus/visibility refresh works without BroadcastChannel. */ }
    }
    return () => {
      active = false; controller?.abort(); channel?.close();
      window.removeEventListener('focus', refresh);
      window.removeEventListener(TESTIMONIALS_UPDATED, refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [path, live, revision]);
  return { ...(result.path === path ? result : { data: null, loading: true, error: '' }), reload };
}
