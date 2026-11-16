import { useEffect, useMemo, useState } from 'react';

import { settingsApi } from '../lib/settings.js';

import { ContentContext, useContent } from './context.js';

const stateNames = {
  PA: 'Pennsylvania',
  NJ: 'New Jersey',
  DE: 'Delaware',
};

const emptyMap = {
  latitude: '',
  longitude: '',
  label: '',
};

export default function PublicSettingsProvider({ children }) {
  const defaults = useContent();

  const [settings, setSettings] = useState(null);

  useEffect(() => {
    let active = true;

    settingsApi
      .get()
      .then((response) => {
        if (active) {
          setSettings(response.settings);
        }
      })
      .catch((error) => {
        if (active) {
          console.error('Failed to load public settings:', error);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const content = useMemo(() => {
    const merged = {
      ...defaults.settings,
      ...(settings ?? {}),
    };

    const phone = merged.phone || '';
    const city = merged.city || '';
    const state = merged.state || '';
    const zip = merged.zip || '';

    const locality = [city, [state, zip].filter(Boolean).join(' ')]
      .filter(Boolean)
      .join(', ');

    const serviceStates = Array.isArray(merged.serviceStates)
      ? merged.serviceStates
      : [];

    const serviceArea = serviceStates
      .map((state) => stateNames[state])
      .filter(Boolean)
      .join(', ');

    const socials = {
      ...defaults.settings.socials,
      ...(settings?.socials ?? {}),
    };

    const map = {
      ...emptyMap,
      ...defaults.settings.map,
      ...(settings?.map ?? {}),
    };

    return {
      ...defaults,

      settings: {
        ...merged,
        locality,
        serviceArea,
        socials,
        map,

        phoneHref: phone ? `tel:${phone.replace(/[^\d+]/g, '')}` : '',
      },
    };
  }, [defaults, settings]);

  return (
    <ContentContext.Provider value={content}>
      {children}
    </ContentContext.Provider>
  );
}
