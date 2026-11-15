# Veldridge admin — backend transition

The admin login now uses the **Express** API and server-side HttpOnly sessions.
Set `VITE_API_URL` in the frontend environment (default: `http://localhost:5000`).
The backend must allow the frontend origin with credentials and have an administrator created with `npm run admin:create`.

**Content migration is not complete.** Services, News, Projects, Settings, Media and Inquiries still use a browser-only IndexedDB adapter until their corresponding Express routes exist. Editing this content does **not** write to MongoDB or deliver visitor inquiries. Do not use real customer data yet.

The browser data should be backed up before future migration. The local export excludes private inquiries and attachments. Settings still offers local import/export/clear solely for that transition.

Existing design and data contracts: [data model](../../docs/data-model.md) and [backend handoff](../../docs/backend-handoff.md). Hero remains static. The public site and admin content editors retain their existing layout and animations.
