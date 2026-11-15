from pathlib import Path
r=Path('.')
def write(p,s):
 p=r/p;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(s)
def replace(p,a,b):
 p=r/p;s=p.read_text();assert a in s,(str(p),a[:80]);p.write_text(s.replace(a,b))
write('src/data/defaultSettings.js', '''// Empty editable settings; the company name is the existing site identity.
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
''')
write('src/data/seed.js', '''import { createDefaultSettings } from './defaultSettings.js';

// Retain stable keys for existing browser data and old content backups.
// This registry is NOT a populated media library: fresh media is empty.
// Static Hero / About assets and all existing asset paths remain unchanged.
export const bundledAssets = import.meta.glob('../pages/**/assets/**/*.{webp,png,jpg,jpeg,svg}', {
  eager: true, query: '?url', import: 'default',
});

// First use and explicit Clear workspace both start empty. Never overwrite
// an existing browser workspace during a reload or application update.
// Data contracts and recovery instructions: docs/data-model.md and docs/content-cleanup.md.
export function createSeed() {
  return {
    content: { services: [], articles: [], projects: [], categories: [], settings: createDefaultSettings() },
    media: [],
    inquiries: [],
  };
}
''')
for p in ['src/pages/ServicesPage/servicesData.js','src/pages/HomePage/components/Services/servicesData.js','src/pages/HomePage/components/LatestNews/latestNews.js','src/pages/BlogPage/data/blogArticles.js','src/pages/GalleryPage/data/galleryProjects.js']:
 (r/p).unlink()
write('src/pages/GalleryPage/data/galleryConfig.js', '''// Display configuration, independent of persisted project records.
export const INITIAL_PROJECT_COUNT = 12;
export const PROJECT_BATCH_SIZE = 6;
''')
p='src/pages/ContactPage/data/contactData.js';s=(r/p).read_text();rules=s[s.index('export const photoRules'):]
write(p,"// This fallback is valid even before the first service is created.\n// Live service choices come from the shared content API.\nexport const serviceOptions = [{ id: 'not-sure', label: 'Not sure yet' }];\n\n"+rules)
p='src/pages/GalleryPage/components/ProjectGallery/ProjectGallery.jsx'
replace(p,"../../data/galleryProjects.js","../../data/galleryConfig.js")
replace(p,"        <div className='project-gallery__filters'", "        {galleryProjects.length > 0 && <div className='project-gallery__filters'")
replace(p,"        </div>\n\n        {galleryProjects.some", "        </div>}\n\n        {galleryProjects.some")
replace(p,"        {filtered.length === 0 && <p>No projects in this category yet. Please choose another service.</p>}", "        {filtered.length === 0 && <p>{galleryProjects.length ? 'No projects in this category yet. Please choose another service.' : 'No projects have been published yet. Please check back soon.'}</p>}")
replace(p,"        <div className='project-gallery__more'>", "        {galleryProjects.length > 0 && <div className='project-gallery__more'>")
replace(p,"        </div>\n      </div>\n      {activeProject", "        </div>}\n      </div>\n      {activeProject")
p='src/pages/ServicesPage/components/ServiceFinder/ServiceFinder.jsx'
replace(p,"          Choose a service to jump to the details. Not sure where to start?\n          Begin with a free inspection.","          {services.length ? 'Choose a service to jump to the details. Not sure where to start? Begin with a free inspection.' : 'Service details will be added soon. Contact our team to discuss your project.'}")
replace(p,"      <nav aria-label='Find a roofing service'>", "      {services.length > 0 ? <nav aria-label='Find a roofing service'>")
replace(p,"      </nav>","      </nav> : <p className='services-page__text'>No services have been added yet.</p>}")
p='src/admin/components/MediaPicker.jsx'
replace(p,"      <div className='admin-media-grid'>", "      {!media.length && <p className='admin-hint' role='status'>No images yet. Upload your first image to continue.</p>}\n      <div className='admin-media-grid'>")
p='src/admin/pages/Projects.jsx'
replace(p,"const { id } = useParams(); const { projects } = useContent();","const { id } = useParams(); const { projects,services } = useContent();\n  if (!id && !services.some((service) => service.status === 'active')) return <>\n    <PageHeading title='New project' description='Projects need a service category.' />\n    <Empty title='Create a service first.'><p>Add an active service with Residential or Commercial selected, then create your project.</p><Button to='/admin/services/new'>Create a service</Button><Button to='/admin/projects'>Back to projects</Button></Empty>\n  </>;")
p='src/api/validation.js'
replace(p,'export function normalizeSettings(input) {','export function normalizeSettings(input, { allowUnconfigured = false } = {}) {')
replace(p,"  for (const key of ['company','phone','email','street','city','state','zip']) if (!result[key]) fields[key] = 'This field is required.';", """  const unconfigured = allowUnconfigured
    && ['phone','email','street','city','state','zip','hours','hoursNote'].every((key) => !result[key])
    && !result.serviceStates.length
    && ['latitude','longitude','label'].every((key) => !input.map?.[key])
    && ['facebook','instagram','linkedin','youtube'].every((key) => !input.socials?.[key]);
  if (!result.company) fields.company = 'This field is required.';
  for (const key of ['phone','email','street','city','state','zip']) if (!unconfigured && !result[key]) fields[key] = 'This field is required.';""")
replace(p,"  result.locality = `${result.city}, ${result.state} ${result.zip}`;", "  result.locality = [result.city, [result.state,result.zip].filter(Boolean).join(' ')].filter(Boolean).join(', ');")
replace(p,"  result.phoneHref = `tel:${result.phone.replace(/[^\\d+]/g,'')}`;", "  result.phoneHref = result.phone ? `tel:${result.phone.replace(/[^\\d+]/g,'')}` : '';")
replace('src/api/backup.js','normalizeSettings(data.content.settings)','normalizeSettings(data.content.settings, { allowUnconfigured: true })')
p='src/admin/pages/Settings.jsx'
replace(p,"'Demo data reset locally.'", "'Workspace cleared. You can now create content from scratch.'")
replace(p,"title='Demo data'", "title='Workspace data'")
replace(p,'Reset demo data','Clear workspace')
replace(p,'Reset all demo data?','Clear this local workspace?')
replace(p,'Reset replaces everything, including inquiries.','Clear workspace removes all content, contact details, public media and inquiries. It does not restore sample records.')
replace(p,'This removes local edits, uploaded images and inquiries and restores the original demo content. This action cannot be undone without a backup.', 'This permanently removes local services, news, projects, contact details, images, inquiries and private attachments. It starts an empty workspace; no sample records are restored. Content backups do not include inquiries. Cancel unless you are ready to lose those local messages.')
replace(p,'Demonstration values. Replace these with confirmed details before launch.','Add your company contact details. Required fields are checked when you save.')
replace(p,"Latitude (sample)","Latitude")
replace(p,"Longitude (sample)","Longitude")
replace(p,'Sample pin only. A live map is not connected in this demo.','A live map is not connected. No office marker is shown until an address is provided.')
replace(p,"<p className='admin-prose'>{values.phone}<br />{values.email}<br />{values.street}<br />{values.city}, {values.state} {values.zip}</p>","<p className='admin-prose'>{values.phone || 'Phone not provided'}<br />{values.email || 'Email not provided'}<br />{values.street || 'Address not provided'}<br />{[values.city, [values.state,values.zip].filter(Boolean).join(' ')].filter(Boolean).join(', ')}</p>")
p='src/pages/ContactPage/components/ContactDetails/ContactDetails.jsx'
replace(p,"  const rows = [", "  const hasContacts = Boolean(data.phone || data.email || data.street || data.hours);\n  const rows = [")
replace(p,"hint: `${data.locality}${data.isDemo ? ' · Sample address' : ''}`", "hint: [data.locality, data.street && data.isDemo ? 'Sample address' : ''].filter(Boolean).join(' · ')")
replace(p,"hint: `${data.hoursNote}${data.isDemo ? ' · Sample hours' : ''}`", "hint: [data.hoursNote, data.hours && data.isDemo ? 'Sample hours' : ''].filter(Boolean).join(' · ')")
replace(p,"<dd>{href ? <a href={href}>{value}</a> : value}<span>{hint}</span></dd>", "<dd>{value ? (href ? <a href={href}>{value}</a> : value) : 'Not provided yet'}{value && hint && <span>{hint}</span>}</dd>")
replace(p,"<p>{data.serviceArea}</p>","<p>{data.serviceArea || 'Service area will be added soon.'}</p>")
replace(p,"<h3>Sample contact details</h3>\n        <p>Phone, email, address, hours and map pin are placeholders for this design.</p>","<h3>{hasContacts ? 'Local demo workspace' : 'Contact details not added yet'}</h3>\n        <p>{hasContacts ? 'These details are stored in this browser only. Calls, email and live directions are not connected.' : 'Company contact information will appear here once it has been added.'}</p>")
p='src/pages/ContactPage/components/ContactMap/ContactMap.jsx'
replace(p,"  const { settings:contactData } = useContent();","  const { settings:contactData } = useContent();\n  const hasAddress = Boolean(contactData.street && contactData.locality);")
replace(p,"<p className='contact-map__description'>Serving homes and businesses across<br />{contactData.serviceArea}.</p>","<p className='contact-map__description'>{contactData.serviceArea ? <>Serving homes and businesses across<br />{contactData.serviceArea}.</> : 'Service area information will be added soon.'}</p>")
replace(p,"      <figure className='contact-map__figure'>", "      {hasAddress ? <figure className='contact-map__figure'>")
replace(p,"<span className='contact-map__area-label'>Philadelphia area</span>","<span className='contact-map__area-label'>{contactData.city ? `${contactData.city} area` : 'Office area'}</span>")
replace(p,"      </figure>","      </figure> : <p className='contact-map__description'>Office location has not been added yet. A map will be available after the address is configured.</p>}")
p='src/components/layout/Footer/Footer.jsx'
replace(p,"location:`${settings.street}, ${settings.locality}`", "location:[settings.street,settings.locality].filter(Boolean).join(', ')")
s=(r/p).read_text()
for key in ['phone','email','location']:
 start=s.index("            <div className='footer__contact'>",s.index("<div className='footer__contacts'>")) if key=='phone' else s.index("            <div className='footer__contact'>",start)
 end=s.index('            </div>',start)+len('            </div>')
 block=s[start:end];s=s[:start]+block.replace("<div className='footer__contact'>",f"{{contacts.{key} && <div className='footer__contact'>",1)+'}'+s[end:];start=end+len(f'{{contacts.{key} && ')+1
s=s.replace("{settings.isDemo && <p className='footer__demo-note'>Demo contact details · Not for calls or directions</p>}","{!contacts.phone && !contacts.email && !contacts.location ? <p className='footer__demo-note'>Contact details will be added soon.</p> : settings.isDemo && <p className='footer__demo-note'>Local demo contacts · Not for calls or directions</p>}")
(r/p).write_text(s)
p=r/'src/admin/README.md';s=p.read_text();start=s.index('`src/data/seed.js` adapts');end=s.index('`src/api/workspace.js`',start)
s=s[:start]+"`src/data/seed.js` creates an empty workspace. `src/data/defaultSettings.js` retains all settings fields with blank contacts. Existing browser data is not overwritten on refresh. Settings → Workspace data → Clear workspace explicitly clears it.\n\nSee [data model](../../docs/data-model.md), [cleanup/recovery](../../docs/content-cleanup.md), and [MERN handoff](../../docs/backend-handoff.md).\n\n"+s[end:]
s=s.replace('Settings → Demo data → Demo testing','Settings → Workspace data → Demo testing').replace('inbox, including service-name snapshots. Reset restores all seed data, including\nthe fictional inbox, only after confirmation. Export before resetting.', 'inbox, including service-name snapshots. Clear workspace explicitly removes all local data, including inquiries, and restores an empty baseline. Export content before clearing; that export does not preserve inquiries.').replace('Existing demonstration photographs/crops remain clearly marked as examples.', 'Imported illustrative projects remain flagged; no sample projects are seeded.')
p.write_text(s)
p=r/'README.md';s=p.read_text();s+='\n## Backend preparation / empty content\n\nDynamic content starts empty. Existing browser data is preserved until Settings → Workspace data → **Clear workspace** is confirmed. Hero, static site sections, assets and animation timings are unchanged.\n\n- [Entity fields, validation and relationships](docs/data-model.md)\n- [Approved MERN backend handoff](docs/backend-handoff.md)\n- [Cleanup, local reset and recovery](docs/content-cleanup.md)\n\nThe pre-cleanup source is on `backup/pre-content-cleanup-20261115`. Run `node --test tests/content-baseline.test.js` for data-contract tests.\n';p.write_text(s)
for name in ['BlogPage','GalleryPage','ServicesPage','ContactPage']:
 p=r/'src/pages'/name/'README.md';s=p.read_text();p.write_text('> **Current baseline (2026-11-15):** editable demo records/contact values were removed. Counts/examples below describe the original design, not records seeded by the app. See [data model](../../../docs/data-model.md) and [cleanup/recovery](../../../docs/content-cleanup.md).\n\n'+s)
