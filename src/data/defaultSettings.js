// Empty editable settings; the company name is the existing site identity.
// Keep every field available for the admin forms and the future API contract.
export function createDefaultSettings() {
  return {
    company: 'Veldridge Roofing',
    phone: '', phoneHref: '', email: '', street: '', locality: '',
    city: '', state: '', zip: '', hours: '', hoursNote: '',
    timeZone: 'America/New_York', serviceStates: [], serviceArea: '',
    map: { latitude: '', longitude: '', label: '' },
    socials: { facebook: '', instagram: '', linkedin: '', youtube: '' },
    isDemo: true, revision: 1,
  };
}
