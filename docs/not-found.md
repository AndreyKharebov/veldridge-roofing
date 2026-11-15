# 404 / not-found behavior

## Public website

The `*` child of `SiteLayout` in `src/App.jsx` renders the shared `NotFound`
component. Unknown URLs, including nested paths and `/404`, keep their address;
they are not redirected to Home. The normal Header/Footer remain available.
Back to Home, Contact us, and links to Services/Gallery/Blog provide explicit exits.
No browser-history-based Back button is used, so a direct visit has a safe exit.

## Admin workspace

The protected `*` route inside `AdminLayout` renders the admin version. A signed-out
visitor is still sent to Login first; after signing in, the original unknown admin
path shows 404. Public and admin layouts are not mixed.

Missing services, articles, projects, news categories and inquiries use the same
component with a link to the corresponding list. An empty list is not a 404;
`/new` forms, existing drafts and archived records remain accessible. Record
checks run after data is available. Storage/query errors retain their retry UI
and are not misreported as missing records. Non-404 route errors still use the
existing error boundary. The boundary also recognizes a genuine router 404.

## Accessibility and metadata

The heading receives focus and the viewport returns to the top on a not-found
pathname change. The document title contains 404 and the context. A component-owned
`robots: noindex, follow` meta tag exists only while the error screen is mounted;
existing metadata is not removed. On exit, the tag is removed and the previous
page title is restored unless another page already changed it. Home explicitly
sets its own title so returning from the admin cannot retain an admin/error title.
The page has no entrance animation; focus targets and links are available immediately.

## HTTP status / deployment

This is a client-rendered React/Vite application. Rendering the 404 component or a
router error does NOT change the HTTP status of an already served HTML document.
Vite's SPA fallback may return `index.html` with HTTP 200 for unknown paths. Configure
SPA deep-link handling on the chosen host; none is assumed or modified here.

When the Express backend/hosting layer is added, return real HTTP 404 responses
for unknown API endpoints and absent API records. A true document-level HTTP 404
for unknown frontend URLs additionally needs route-aware hosting or server-side
rendering. Never send the SPA HTML fallback for unknown API or asset requests.

## Checks

Run `npm run lint`, `node --test tests/*.test.js`, and `npm run build`.
Browser checks should cover direct unknown URLs, refresh, nested admin paths,
signed-out/signed-in recovery, missing records, valid list/new/detail routes,
heading focus, title/robots cleanup, mobile navigation and responsive overflow.
No data reset, seed changes, dependencies or Hero/motion settings are involved.

Browser regression suite (separate test environment, not an application dependency):

```sh
python -m pip install playwright
python -m playwright install --with-deps chromium webkit
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
# In another terminal:
python tests/not-found.browser.py
```

`QA_BROWSERS=chromium` or `QA_BROWSERS=webkit` selects one engine;
`QA_OUTPUT` controls the reports/screenshots directory. The suite uses fresh,
isolated browser profiles, not your existing IndexedDB workspace.
