import { normalizeSocialUrl } from './socialUrl.js';
export const socialFields = [['facebook', 'Facebook'], ['instagram', 'Instagram'], ['linkedin', 'LinkedIn'], ['youtube', 'YouTube']];
const fields = ['company', 'phone', 'email', 'street', 'city', 'state', 'zip', 'hours', 'hoursNote', 'timeZone'];
export const readSettings = (settings = {}) => ({
  ...Object.fromEntries(fields.map((key) => [key, settings[key] ?? ''])),
  serviceStates: Array.isArray(settings.serviceStates) ? [...settings.serviceStates] : [],
  socials: Object.fromEntries(socialFields.map(([key]) => [key, settings.socials?.[key] ?? ''])),
});
export function settingsPayload(settings) {
  const result = readSettings(settings);
  for (const key of fields) result[key] = result[key].trim();
  result.email = result.email.toLowerCase();
  if (result.timeZone) {
    try { result.timeZone = new Intl.DateTimeFormat('en-US', { timeZone: result.timeZone }).resolvedOptions().timeZone; }
    catch { throw new Error('Choose a valid time zone from the list.'); }
  }
  result.serviceStates.sort();
  for (const [key, label] of socialFields) {
    try { result.socials[key] = normalizeSocialUrl(result.socials[key]); }
    catch { throw new Error(`${label}: enter a website address, for example ${key}.com/your-page.`); }
  }
  return result;
}
export function settingsSignature(settings) {
  try { return JSON.stringify(settingsPayload(settings)); }
  catch { return JSON.stringify(readSettings(settings)); }
}
export const commonTimeZones = [
  ['America/New_York', 'Eastern — New York (recommended)'],
  ['America/Chicago', 'Central — Chicago'], ['America/Denver', 'Mountain — Denver'],
  ['America/Phoenix', 'Arizona — Phoenix'], ['America/Los_Angeles', 'Pacific — Los Angeles'],
  ['America/Anchorage', 'Alaska — Anchorage'], ['Pacific/Honolulu', 'Hawaii — Honolulu'], ['UTC', 'UTC'],
];
export const otherTimeZones = typeof Intl.supportedValuesOf === 'function'
  ? Intl.supportedValuesOf('timeZone').filter((zone) => !commonTimeZones.some(([value]) => value === zone)) : [];
