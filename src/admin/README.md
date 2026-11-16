# Frontend while the MERN API is under development

The Express server already handles administrator authentication through `/api/auth/login`, `/api/auth/me` and `/api/auth/logout`.

**All other endpoints are pending.** Services, News, Categories, Projects, Settings, image upload and Contact submissions currently call a development-only adapter in `src/api/workspace.js`.

- Submit to validate and print each request payload in DevTools Console (`[Veldridge API TODO]`).
- Mock records and uploaded-image previews exist only in JavaScript memory. They disappear on a page refresh. No IndexedDB, localStorage or MongoDB writes occur.
- Uploaded media is held in memory as File/Blob with temporary object URLs; it is never uploaded.
- Contact form logs fictional test data. Do not enter real personal information: browser console is not an appropriate storage or transmission destination.
- Temporary in-memory records are only for wiring dependent forms (for example, creating a Service before a Project).
- Import/export/reset from the old browser database were removed.
- The real backend will replace the development adapter one endpoint at a time while the React forms and data-model contracts remain.

Start Express at `http://localhost:5000` and Vite at `http://localhost:5173`; set `VITE_API_URL` if needed. Use the MongoDB administrator account to sign in.

See `docs/data-model.md` for the complete entity field contracts.
