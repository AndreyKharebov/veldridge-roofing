// Admin-only examples. Placeholders never become form values or API payloads.
const byLabel = {
  'service name': 'e.g. Roof Replacement',
  'short description': 'e.g. Replace aging roofing with a new system that complements your home.',
  'full description': 'e.g. We assess the existing roof, discuss material options, and plan installation and finishing details.',
  'eyebrow': 'e.g. A FRESH START FOR YOUR HOME',
  'contact button label': 'e.g. Discuss Your Project',
  'project title': 'e.g. Standing-Seam Roof Upgrade',
  'project summary': 'e.g. A charcoal metal roof with coordinated flashing and a finish designed around the home.',
  'property description': 'e.g. Two-story single-family home',
  'on-site duration': 'e.g. 4 working days',
  'main material': 'e.g. Architectural asphalt shingles',
  'finish / color': 'e.g. Charcoal Gray',
  'photo caption': 'e.g. Completed roof — front view',
  'alt text override': 'e.g. Gray shingle roof on a two-story home',
  'title': 'e.g. Getting Your Roof Ready for Winter',
  'introduction / card excerpt': 'e.g. Learn which roof and drainage details to check before cold weather arrives.',
  'section heading': 'e.g. Start With a Ground-Level Inspection',
  'paragraphs': 'e.g. Look for missing shingles and visible drainage problems from a safe location. Describe what readers should notice and when to seek advice.',
  'source label': 'e.g. Further reading: roof maintenance',
  'source url': 'e.g. example.com/roof-maintenance',
  'category name': 'e.g. Roof Maintenance',
  'description': 'e.g. Practical advice on inspections, routine care, and seasonal roof maintenance.',
  'author name': 'e.g. Alex Morgan',
  'location / description': 'e.g. Philadelphia, PA',
  'rating': undefined,
  'review text': 'e.g. The team explained the work clearly, kept us informed, and left the property tidy.',
  'company name': 'e.g. Veldridge Roofing',
  'phone': 'e.g. (215) 555-0100',
  'email': 'e.g. hello@example.com',
  'street address': 'e.g. 123 Example Street, Suite 200',
  'city': 'e.g. Philadelphia',
  'state': 'e.g. PA',
  'zip code': 'e.g. 19103',
  'business hours': 'e.g. Mon–Fri, 8:00 AM–5:00 PM',
  'additional hours note': 'e.g. Saturday appointments available on request',
  'add an internal note': 'e.g. Spoke with the customer. Follow up Friday to confirm an inspection time.',
  'username': 'e.g. site-admin',
  'password': 'Enter your administrator password',
};
const byName = {
  company: byLabel['company name'], phone: byLabel.phone, email: byLabel.email,
  street: byLabel['street address'], city: byLabel.city, state: byLabel.state,
  zip: byLabel['zip code'], hours: byLabel['business hours'], hoursNote: byLabel['additional hours note'],
  imageAlt: byLabel['alt text override'], photoAlt: byLabel['alt text override'],
  photoCaption: byLabel['photo caption'], note: byLabel['add an internal note'],
  username: byLabel.username, password: byLabel.password,
  facebook: 'e.g. facebook.com/your-company', instagram: 'e.g. instagram.com/your-company',
  linkedin: 'e.g. linkedin.com/company/your-company', youtube: 'e.g. youtube.com/@your-company',
};
const textTypes = new Set(['text', 'search', 'email', 'tel', 'url', 'password']);

export function adminFieldPlaceholder({ placeholder, label, name, children, type = 'text' }) {
  if (placeholder !== undefined) return placeholder;
  // Selects and native date/number controls already provide their own affordances.
  if (children || !textTypes.has(type)) return undefined;
  const key = typeof label === 'string' ? label.replace(/\s*\*\s*$/, '').trim().toLowerCase() : '';
  if (Object.hasOwn(byLabel, key)) return byLabel[key];
  if (Object.hasOwn(byName, name)) return byName[name];
  if (/^point-\d+$/.test(name ?? '') || /^point \d+$/.test(key)) return 'e.g. Roof condition and visible concerns';
  if (/^work-\d+$/.test(name ?? '') || /^work item \d+$/.test(key)) return 'e.g. Installed underlayment and finished roof flashing';
  return undefined;
}
