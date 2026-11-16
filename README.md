# Veldridge Roofing — Static Frontend

React + Vite layouts for the public website and admin panel. This branch is a **static starting point** for reconnecting the separate Express backend one feature at a time.

## Run locally

Use Node.js 24 and npm. No backend, MongoDB or environment variables are required.

```bash
npm ci
npm run dev
```

To check the code and create a production bundle:

```bash
npm run lint
npm run build
```

## Current behaviour

- Public pages, admin JSX layouts, Sass styles, illustrations, navigation, modals and motion settings remain.
- Hero stays static. Animation timings remain in `src/config/motion.js` and the existing motion modules.
- Services, articles, projects, categories, customer inquiries and testimonials have **no sample records**. Lists are empty; company contact fields are blank until real data is connected.
- `src/content/context.js` supplies only immutable empty values to existing layouts. It is not a store, mock API, React context provider or request layer.
- All form submissions call `console.log` through `src/utils/logForm.js`. Nothing is sent, saved, published or inserted into lists, including temporary in-memory lists.
- Forms retain only their own input state. File selections and image previews live only while their form is mounted. No media library or upload exists. Object URLs are released when no longer needed.
- Login logs a redacted password and does not create a session. Sign out logs the action and navigates to the login layout.
- `/admin` is deliberately **unprotected and contains no real data**. This is a UI preview, not a production admin system. Do not enter real passwords or customer details into console-only forms.
- No `src/api`, `src/auth`, `src/dev`, IndexedDB, local/session storage, TanStack Query or automated test suite is used.

The backend repository is unchanged: `AndreyKharebov/veldridge-roofing-api`.

## Layouts to check

Public: `/`, `/about`, `/services`, `/gallery`, `/blog`, `/contact`, plus a nonexistent URL for the 404 layout.

Admin: `/admin`, `/admin/login`, `/admin/services/new`, `/admin/news/new`, `/admin/news/categories`, `/admin/projects/new`, `/admin/settings` and `/admin/inquiries`.

`/admin/inquiries/preview` opens an empty inquiry-detail layout so its note and status forms can be inspected without inventing a customer record. Unknown record IDs still show the 404 layout.

Open browser DevTools -> Console before submitting a form. Check that the payload is logged, no API request is made, lists remain empty and reloading does not restore edits. The project form is available even before service categories are connected.

## Update an existing checkout

Stop the frontend server and inspect local changes first:

```bash
git status
git pull --ff-only origin main
npm ci
npm run dev
```

Do not discard uncommitted work to force a pull. Untracked files created locally (for example an old `src/api/client.js`) are not automatically removed by pulling; inspect them rather than running a blanket `git clean`.

Old browser storage is no longer read or written. This code does not delete browser databases or backend records. Old local API environment files are unused and can be removed manually after checking their contents.

## Next integration steps

Reconnect authentication, then one content module at a time. Keep the current layouts and replace console-only handlers with real requests only when that endpoint is ready. Do not add another mock API or sample database.

Pre-cleanup snapshot: branch `backup/pre-static-reset-a8d0969`, commit `a8d0969432921ceb1d891c711500f0c99e1ab237`.
