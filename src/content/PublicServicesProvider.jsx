import { useCallback, useEffect, useMemo, useState } from 'react';
import { servicesApi, SERVICES_CHANNEL, SERVICES_UPDATED } from '../lib/services.js';
import { ContentContext, useContent } from './context.js';

export default function PublicServicesProvider({ children }) {
  const parent = useContent();
  const [result, setResult] = useState({ services: [], status: 'loading', error: '' });
  const [retry, setRetry] = useState(0);
  const reloadServices = useCallback(() => setRetry((value) => value + 1), []);
  useEffect(() => {
    let active = true;
    let controller;
    let channel;
    const load = async () => {
      controller?.abort();
      const request = new AbortController();
      controller = request;
      try {
        const response = await servicesApi.getPublic({ signal: request.signal });
        if (active && !request.signal.aborted) {
          setResult({ services: response.services, status: 'ready', error: '' });
        }
      } catch (error) {
        if (active && !request.signal.aborted && error.name !== 'AbortError') {
          // Do not keep advertising an archived service after a failed refresh.
          setResult({ services: [], status: 'error', error: 'Services could not be loaded. Please try again.' });
        }
      }
    };
    const visible = () => { if (!document.hidden) void load(); };
    void load();
    window.addEventListener('focus', visible);
    window.addEventListener(SERVICES_UPDATED, visible);
    document.addEventListener('visibilitychange', visible);
    try {
      if ('BroadcastChannel' in window) {
        channel = new BroadcastChannel(SERVICES_CHANNEL);
        channel.onmessage = (event) => { if (event.data === 'updated') visible(); };
      }
    } catch { /* The focus and visibility listeners still refresh data. */ }
    return () => {
      active = false;
      controller?.abort();
      channel?.close();
      window.removeEventListener('focus', visible);
      window.removeEventListener(SERVICES_UPDATED, visible);
      document.removeEventListener('visibilitychange', visible);
    };
  }, [retry]);
  const content = useMemo(() => ({
    ...parent, services: result.services, servicesStatus: result.status,
    servicesError: result.error, reloadServices,
  }), [parent, result, reloadServices]);
  return <ContentContext.Provider value={content}>{children}</ContentContext.Provider>;
}
