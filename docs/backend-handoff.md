# Backend handoff — MERN, JavaScript only

## References

- Frontend: https://github.com/AndreyKharebov/veldridge-roofing
- Figma website: https://www.figma.com/design/nVOT2zebEqfrt2HqQZIDmm/?node-id=0-1
- Figma admin: https://www.figma.com/design/nVOT2zebEqfrt2HqQZIDmm/?node-id=188-1644
- Planned separate backend: `AndreyKharebov/veldridge-roofing-api`. This cleanup does not create it.
- Before cleanup: `backup/pre-content-cleanup-20261115`, commit `921ae21f305dc1517d957776432bd9e9ae6e745f`.

## Agreed stack and scope

MongoDB + Express + Node.js + existing React frontend. JavaScript ES Modules, **no TypeScript**. Mongoose planned. Do not substitute PostgreSQL, Prisma or Fastify. Keep TanStack Query and existing UI; replace the local API adapter gradually.

One admin, English UI, no public registration. Hero remains static. Service is its own category with independent Residential/Commercial flags. News has separate categories and ordered heading/plain-text sections matching ArticleDialog. Projects have multiple photos and one cover. Contact accepts optional private photos. Inquiries have statuses and internal notes. Contact settings feed Contact/Footer. No live map yet.

## Read first

1. [Data model](data-model.md): inspected persisted/derived fields, relationships, limits and current adapter contracts.
2. `src/dev/validation.js` and `src/pages/ContactPage/data/inquiry.js`: actual validation; compare with current main.
3. `src/dev/workspace.js`, `src/dev/media.js` (browser persistence and backups have been removed): persistence, media, revisions and operations.
4. `src/content/` and `src/admin/pages/`: query keys and actual editor submission/preview behavior.
5. [Cleanup/recovery](content-cleanup.md): empty startup and existing browser data.

Original examples remain on the backup branch/history, not as runtime seed. Forms and normalizers preserve creation contracts. Do not restore fictitious inquiries to production.

## Planned implementation order

Start with the separate backend repository and one foundation commit: Express app/server separation, validated environment, Mongoose connection, centralized errors/404s, logging, .env.example, .gitignore, health endpoint and tests. No real secrets in Git.

Then single-admin server authentication: password hash, secure session/cookie strategy, rate limits and authorization. Public demo credentials and browser flags are not protection.

Then Media + Services end-to-end, News categories/articles, Projects, Settings and Inquiries. A draft project still requires a service. Display numbers are independent of stored order. Preserve both property-type flags and existing frontend layouts/animation timings.

Separate public published-content reads from authenticated admin reads. Decide string ID/slug mapping for MongoDB and explicit revision/concurrency behavior. Preserve historical source/service labels. Validate fields and source context on the server; protect uploads and private attachments. Do not copy local-only security assumptions.

Storage provider, hosting, URLs, notifications, live map, retention policy and deployment secrets are not selected/provisioned here. Private inquiry files must be separate from public media. Do not store browser Blob URLs or Vite hashes as durable file addresses. Define file deletion around references.

Switch each feature to one source of truth. Never silently fall back to old IndexedDB records when HTTP fails. Keep loading/empty/error/conflict/retry states. Retire the corresponding mock adapter only after integration tests.

## Initial integration checks

Empty database → login → upload image → create service → Home/Services/Contact agree → archive → continuous display numbering → restore. Then category/draft article/publish/reader/Home; project photos/cover/reordering/gallery; optional Contact photo/inbox/status/note. Test refresh, second tab, mobile, failed saves, imports and unauthorized access.

Work in small verified commits, not one all-or-nothing rewrite. The frontend source and data-model document are the handoff; no need to reconstruct entities from chat memory.
