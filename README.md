# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Backend preparation / empty content

Dynamic content starts empty. Existing browser data is preserved until Settings → Workspace data → **Clear workspace** is confirmed. Hero, static site sections, assets and animation timings are unchanged.

- [Entity fields, validation and relationships](docs/data-model.md)
- [Approved MERN backend handoff](docs/backend-handoff.md)
- [Cleanup, local reset and recovery](docs/content-cleanup.md)

The pre-cleanup source is on `backup/pre-content-cleanup-20261115`. Run `node --test tests/content-baseline.test.js` for data-contract tests.

## MERN transition status

Admin authentication now calls the Express API at `VITE_API_URL` (default `http://localhost:5000`) using an HttpOnly-cookie session. Start the backend and create an administrator before signing in. **Content still uses IndexedDB** until the backend exposes content CRUD, media and inquiry endpoints. Browser-edited records are not in MongoDB. See `src/admin/README.md` and `docs/backend-handoff.md`.

## Frontend directories

`src/auth/session.js` handles Express administrator sessions. `src/dev/` contains temporary console-only form submission, validation and media previews for endpoints still being developed. There is no frontend `src/api/` directory or IndexedDB persistence.
