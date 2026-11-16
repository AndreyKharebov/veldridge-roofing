import { useCallback, useEffect, useMemo, useState } from 'react';
import { settingsApi, SETTINGS_CHANNEL, SETTINGS_UPDATED } from '../lib/settings.js';
import { getOfficeLocation } from '../utils/officeLocation.js';
import { ContentContext, useContent } from './context.js';

const stateNames = { PA: 'Pennsylvania', NJ: 'New Jersey', DE: 'Delaware' };

export default function PublicSettingsProvider({ children }) {
  const defaults = useContent();
  const [result, setResult] = useState({ settings: null, status: 'loading', error: '' });
  const [retry, setRetry] = useState(0);
  const reloadSettings = useCallback(() => {
    setResult((previous) => ({
      ...previous, status: previous.settings ? 'ready' : 'loading', error: '',
    }));
    setRetry((value) => value + 1);
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
        const { settings } = await settingsApi.get({ signal: request.signal });
        if (active && !request.signal.aborted) {
          setResult({ settings, status: 'ready', error: '' });
        }
      } catch (error) {
        if (!active || request.signal.aborted || error.name === 'AbortError') return;
        // Keep the last good address on a transient refresh failure.
        setResult((previous) => ({
          ...previous,
          status: previous.settings ? 'ready' : 'error',
          error: 'Contact information could not be refreshed. Please try again.',
        }));
      }
    };
    const onVisible = () => { if (!document.hidden) void load(); };
    void load();
    window.addEventListener('focus', onVisible);
    window.addEventListener(SETTINGS_UPDATED, onVisible);
    document.addEventListener('visibilitychange', onVisible);
    try {
      if ('BroadcastChannel' in window) {
        channel = new BroadcastChannel(SETTINGS_CHANNEL);
        channel.onmessage = (event) => { if (event.data === 'updated') onVisible(); };
      }
    } catch {
      // Focus/visibility refresh remains available without BroadcastChannel.
    }
    return () => {
      active = false;
      controller?.abort();
      channel?.close();
      window.removeEventListener('focus', onVisible);
      window.removeEventListener(SETTINGS_UPDATED, onVisible);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [retry]);

  const content = useMemo(() => {
    // Use only supported fields. A cached response from an older API must not
    // bring back the removed map object.
    const settings = { ...defaults.settings };
    for (const key of Object.keys(defaults.settings)) {
      if (result.settings?.[key] != null) settings[key] = result.settings[key];
    }
    const phone = settings.phone || '';
    const serviceStates = Array.isArray(settings.serviceStates) ? settings.serviceStates : [];
    return {
      ...defaults,
      settingsStatus: result.status,
      settingsError: result.error,
      reloadSettings,
      settings: {
        ...settings,
        locality: getOfficeLocation(settings).locality,
        serviceStates,
        serviceArea: serviceStates.map((state) => stateNames[state]).filter(Boolean).join(', '),
        socials: { ...defaults.settings.socials, ...(result.settings?.socials ?? {}) },
        phoneHref: phone ? `tel:${phone.replace(/[^\d+]/g, '')}` : '',
      },
    };
  }, [defaults, result, reloadSettings]);

  return <ContentContext.Provider value={content}>{children}</ContentContext.Provider>;
}
