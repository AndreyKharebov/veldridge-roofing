const text = (value) => typeof value === 'string' ? value.trim() : '';

// One address feeds the embedded map, the address preview and directions.
// This project serves US addresses; no coordinates or geolocation are used.
export function getOfficeLocation(settings = {}, apiKey = '') {
  const street = text(settings.street);
  const city = text(settings.city);
  const state = text(settings.state);
  const zip = text(settings.zip);
  const locality = [city, [state, zip].filter(Boolean).join(' ')]
    .filter(Boolean).join(', ');
  const hasAddress = Boolean(street && city && state);
  const address = hasAddress ? [street, locality, 'USA'].join(', ') : '';
  const key = text(apiKey);

  return {
    street,
    locality,
    address,
    hasAddress,
    searchUrl: hasAddress
      ? `https://www.google.com/maps/search/?${new URLSearchParams({ api: '1', query: address })}`
      : '',
    directionsUrl: hasAddress
      ? `https://www.google.com/maps/dir/?${new URLSearchParams({ api: '1', destination: address })}`
      : '',
    embedUrl: hasAddress && key
      ? `https://www.google.com/maps/embed/v1/place?${new URLSearchParams({ key, q: address, zoom: '15', language: 'en', region: 'US' })}`
      : '',
  };
}
