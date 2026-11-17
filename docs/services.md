# Services integration

Pull the matching backend update and restart both apps. No new packages are needed.
`/admin/services` lists real MongoDB records, with status filtering and pagination.
`/admin/services/new` creates a draft; the existing editor supports main/supporting
placement, Residential/Commercial, work items, order and Show on Home.

Choose from the existing Media Library. Open it in a separate tab to upload, then
Refresh images in the picker. Images are not duplicated or uploaded by service Save.
Alt override is optional; an empty override uses the library alt text.

Only active/published services are returned publicly. Home honors Show on Home;
Services shows both groups; Contact uses the real service list. Home Read More
anchors wait for asynchronous loading without changing motion durations. Service
contact links preselect the service, but the Inquiry submit still logs to console:
this does not implement actual inquiry delivery, Projects, Blog or Overview metrics.

Public services refresh after saves in the same origin, across tabs through
BroadcastChannel, and on focus. No local/session storage or mock records are added.
Settings, Maps, Footer, Hero and their configuration remain unchanged.

Image deletion is blocked by the backend for any linked service, even draft/archive.
Deleting a service does not delete its image. Update conflicts return 409; reload
before overwriting a record changed in another tab. Do not publish demo records as
real services. Check `npm run lint` and `npm run build` after pulling.
