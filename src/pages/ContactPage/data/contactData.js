// All contact details are intentionally illustrative. Replace together before launch.
export const contactData = {
  isDemo: true,
  company: 'Veldridge Roofing',
  phone: '(215) 555-0148',
  phoneHref: 'tel:+12155550148',
  email: 'hello@veldridge.example',
  street: '123 Example Street',
  locality: 'Philadelphia, PA 19103',
  hours: 'Mon–Fri, 8:00 AM–5:00 PM',
  hoursNote: 'Saturday by appointment',
  serviceArea: 'Pennsylvania · New Jersey · Delaware',
};

export const serviceOptions = [
  { id: 'not-sure', label: 'Not sure yet' },
  { id: 'free-inspection', label: 'Free Inspection' },
  { id: 'roof-replacement', label: 'Roof Replacement' },
  { id: 'damage-repairs', label: 'Damage Repairs' },
  { id: 'roof-renovation', label: 'Roof Renovation' },
  { id: 'commercial-roofing', label: 'Commercial Roofing' },
  { id: 'solar-panels', label: 'Solar Panels' },
  { id: 'roof-maintenance', label: 'Roof Maintenance' },
  { id: 'storm-damage-restoration', label: 'Storm Damage Restoration' },
  { id: 'gutters-drainage', label: 'Gutters & Drainage' },
];

export const photoRules = {
  maxCount: 5,
  maxBytes: 10 * 1024 * 1024,
  accept: '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp',
  mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
};
