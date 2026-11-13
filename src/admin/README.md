# Veldridge demo admin

Open `/admin`. Demo username: **admin**. Demo password: **demo-admin**.

This is a local prototype, **not real authentication or a multi-user CMS**. The
credentials are public and the route guard is only a convenience. Never enter
real customer data. There is no server, email transport or shared database.

## Run

```sh
npm ci
npm run dev
```

Use the same browser profile and origin for the public site and `/admin`.
`localhost`, a LAN IP and a deployed hostname have separate browser databases.
Closing a tab ends its demo session; saved data remains in IndexedDB until reset
or cleared/evicted by the browser. Same-origin tabs refresh via BroadcastChannel.

## Workspace

- **Overview**: actual local counts and recent inquiries, not mock analytics.
- **Services**: service categories, independent Residential/Commercial flags,
  title/summary/detail, image/alt, work points, order, Home placement and archive.
  The same records feed Services, Home, the project category selector and Contact.
- **News**: categories, draft/published/archived articles, date, cover, excerpt,
  heading + paragraph sections with reordering, optional source link. Preview uses
  the site's existing article dialog. Dates control sorting, not scheduled jobs.
  Home's Latest News shows the three newest published records.
- **Projects**: up to 20 photographs, individual captions/alt text, one cover,
  reordering, service/property type, summary, materials, duration and work items.
  Existing demonstration photographs/crops remain clearly marked as examples.
  Gallery and Home use published projects; archived records remain editable.
- **Inquiries**: Contact creates a local inbox record, optionally with up to five
  photos. New / In progress / Closed / Spam, internal notes, source context and
  attachment viewing. No email is sent. Customer attachments never enter the
  public media picker or content backup.
- **Settings**: company/contact information, hours, service area and social links
  shared with Contact and Footer. The map remains illustrative; saved coordinates
  are for a future live-map adapter, not directions. Demo phone/email values are
  displayed but deliberately do not initiate calls or email.

**No Hero controls exist. All Hero content, pictures and carousel configuration
remain static.** Public page layout and the user's animation timing values are
preserved. Admin controls use the existing shared color-transition timing.

## Data and API

`src/data/seed.js` adapts the original public data modules to one durable schema.
They remain seed inputs, not live editing locations. First opening seeds once;
refreshing does not overwrite edits. Existing 9 services, 10 articles and 18
projects remain available. Eight fictional inquiries demonstrate statuses.

`src/api/workspace.js` is the asynchronous adapter. `src/api/database.js` commits
IndexedDB transactions before reporting success. `src/content/` owns TanStack
Query and invalidation; `src/api/media.js` resolves stable bundled asset IDs and
local Blob URLs. Uploaded files are persisted as byte buffers for WebKit compatibility;
Blob URLs are rebuilt when records are read, never saved as durable addresses. Original Vite build hashes are not stored in the database.

Records have stable IDs and revision numbers. Saving a stale record is rejected
rather than overwriting another tab's changes. Invalid data leaves the editor
intact. Pending buttons are disabled, and navigation prompts before discarding
unsaved edits. Image batches are validated and committed atomically.

### Mock failures

Settings → Demo data → Demo testing → **Simulate next save error**. The next write
fails without changing saved data; retry verifies recovery. `mockConfig.latencyMs`
in `src/api/workspace.js` controls the local request delay. No random failures. The failure switch applies within the current page session;
use admin navigation after enabling it. A full page reload clears the switch.

### Backups

**Export content backup** writes a versioned JSON with content/settings and public
images. Uploaded image bytes are embedded as base64; original bundled images use
stable source keys and require a compatible website build. Import validates all
records, references and images before atomically replacing content/media.

Content backups **exclude inquiries and their attachments**. Import preserves the
inbox, including service-name snapshots. Reset restores all seed data, including
the fictional inbox, only after confirmation. Export before resetting. A browser
quota error is reported, not silently treated as a successful save.

## Replacing the mock adapter

Keep the UI query keys and record contracts; implement real HTTP endpoints behind
the workspace methods. Add server authentication and authorization, server-side
validation, secure uploads/storage, email delivery, spam controls, access logs,
backups and data-retention policy. IndexedDB is not production infrastructure.
The demo password/session flag must not be reused as real protection.

## Design / structure

Approved Figma page: `Admin — Veldridge` in file `nVOT2zebEqfrt2HqQZIDmm`.
`components/` contains shared panels, controls, dialogs, tables, media picker and
unsaved guards; `pages/` contains feature editors and lists. `Admin.sass` is scoped
and lazily loaded. Public `PageHero` and marketing Header/Footer are not used in
admin. Figma navigation SVGs are stored locally in `assets/`.

Desktop uses the 240px sidebar, 80px toolbar and two-column editors. Tablet/mobile
use a modal navigation menu and stacked forms. Lists become readable cards on
phones. Native dialogs handle focus, Escape, scrolling and restoration; a shared
body lock supports nested preview and confirmation windows.
