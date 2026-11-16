// Empty values for the existing JSX layouts. No React provider, API or storage.
// This accessor keeps presentation components independent from data loading.
const empty = Object.freeze([]);
const content = Object.freeze({
  services: empty,
  articles: empty,
  projects: empty,
  categories: empty,
  media: empty,
  inquiries: empty,
  settings: Object.freeze({
    company: 'Veldridge Roofing',
    phone: '', phoneHref: '', email: '', street: '', locality: '',
    city: '', state: '', zip: '', hours: '', hoursNote: '',
    timeZone: '', serviceStates: empty, serviceArea: '',
    map: Object.freeze({ latitude: '', longitude: '', label: '' }),
    socials: Object.freeze({ facebook: '', instagram: '', linkedin: '', youtube: '' }),
  }),
});

export function useContent() {
  return content;
}
