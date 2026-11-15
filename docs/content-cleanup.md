# Empty workspace, cleanup and recovery

## Preserved before cleanup

Branch `backup/pre-content-cleanup-20261115` points to commit `921ae21f305dc1517d957776432bd9e9ae6e745f`, including the complete original demo content and the service-numbering/Media-Picker fixes. [data-model.md](data-model.md) describes the fields, relations, validation and methods. [backend-handoff.md](backend-handoff.md) records the approved stack and project links.

Git backups do NOT contain changes/uploads/messages saved only in your browser. Content export includes public records/images/settings but EXCLUDES inquiries and private attachments. Do not clear local messages you need to keep.

## New empty baseline

A fresh browser starts with zero services, news categories, articles, projects, media and inquiries. Contact fields, address, hours, selected service states, coordinates and social URLs are blank. Only known site identity Veldridge Roofing, technical timezone America/New_York, demo safety flag and revision remain.

Runtime demo-record modules are removed. Gallery pagination and Contact upload limits remain configuration. Hero, About, testimonials, FAQ, static text, Sass and motion are unchanged. Image files/stable asset keys remain for static sections and existing browser/backup compatibility; the selectable media library starts empty.

Home hides empty dynamic sections. Services/Blog/Gallery show empty messages. Contact shows no fake address or marker while unconfigured. Admin shows zeros and empty lists. New project explains that an active service is required first. First image upload/content creation still work. Contact can create a local test inquiry with Not sure yet before services exist.

## Existing browser data is deliberately preserved

Pulling Git does not erase IndexedDB. Database name/version and seed-once behavior stay unchanged. To clear an existing browser:

1. Open /admin on the same origin and browser profile as the website.
2. Go to Settings → Workspace data.
3. Export a content backup when needed; it does NOT preserve inquiries/private photos.
4. Choose **Clear workspace** and read the destructive confirmation. Cancel preserves data. Confirm removes local services/categories/articles/projects/settings/public media/inquiries/private photos and starts empty, without restoring samples.
5. Reload public pages.

This is explicit confirmation, not an automatic startup wipe. Tabs use existing refresh events. New/private browser workspaces are already empty. No MongoDB/server records are touched.

## Refill and recover

Create a service first, with image and at least one property type. Projects use those services as categories. News categories are optional. Settings ordinary save requires complete contacts. Publish articles/projects to show them publicly. Demo login remains admin / demo-admin.

Export/import supports the fully unconfigured baseline as well as complete contact settings. Arbitrary partially configured settings still fail validation. Import replaces content/public media but preserves inbox. Old bundled assets remain resolvable. Normal reload/reset no longer seeds sample records.

Cleanup changes the current source, not Git history. No force push/history rewriting is required. Inspect originals in the backup branch; after fetching it, an example read-only command is `git show origin/backup/pre-content-cleanup-20261115:src/data/seed.js`.
