# Veldridge Roofing — Frontend

React + Vite, JavaScript ES Modules and indented Sass. The separate Express API
handles administrator sessions and company settings. The remaining content
modules are still empty layouts with console-only submissions. Hero and existing
animation timings remain static; no client database or mock API is used.

## Run locally

Use Node.js 24 and npm. Start `veldridge-roofing-api` on port 5000.
For a fresh checkout, run `npm ci`. Create or update `.env.local` (do not overwrite
an existing file containing your local key):

```dotenv
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_MAPS_KEY=YOUR_RESTRICTED_EMBED_KEY
VITE_DEMO_MODE=true
```

Then `npm run dev`. Use `http://localhost:5173`; backend `CLIENT_ORIGIN` must match.
Restart Vite after editing environment variables. Deployment variables must be
present when building, not only when serving the finished bundle.

```bash
npm run lint
npm run build
```

## Google Maps and directions

- Enable **Maps Embed API** and restrict the browser key to that API and allowed
  website referrers, for example `http://localhost:5173/*` and the deployed domain.
- `VITE_` variables are visible in the browser; they are not server secrets.
  Never put MongoDB credentials or a session secret here. Do not commit `.env.local`.
- Edit Street, City, State and ZIP in `/admin/settings`. The first three must be
  nonempty to display a location. ZIP is optional but improves address matching.
- The map, preview and Get directions button use the same saved US address.
  No latitude, longitude, marker label or separate geocoding service is used.
- Maps Embed uses `place` mode and a restricted key. Directions/search are ordinary
  Google Maps URLs without a key. The starting point is chosen inside Google Maps;
  this site does not request the visitor's geolocation.
- Public settings refresh on mount, on return to a tab and after a save in another
  same-origin tab via BroadcastChannel when supported. The API remains the source
  of truth. No records are stored in browser storage.
- Missing address: no iframe or invented location. Missing key: the saved address
  and external links still work. Google key/billing/referrer errors may appear
  inside Google's iframe; cross-origin content cannot be inspected by React.
- Google's map UI and attribution are not covered, cropped or restyled. The card,
  frame and responsive layout use the site's existing typography and orange accent.

Demo labels are enabled by default. Keep `VITE_DEMO_MODE=true` while using an
example public location. Set it to `false` only for a confirmed real company
address. No sample address is inserted automatically.

Google documentation:
- https://developers.google.com/maps/documentation/embed/embedding-map
- https://developers.google.com/maps/documentation/urls/get-started

## Updating

Stop the local server, inspect `git status`, preserve any local work, then:

```bash
git pull --ff-only origin main
npm run dev
```

This map update adds no packages and does not change the lockfile. Pull the backend
as well, restart it, reload the frontend and save Settings once. That save removes
only the legacy `map` object from the settings document. Existing addresses and
other settings are preserved. Public GET never writes to the database.

## Manual checks

Verify login/logout still work; edit an address, save, open Contact and confirm
that the iframe `q` and directions `destination` match it. Repeat with a public tab
already open. Test mobile layout, a missing key, an empty address, unavailable API,
and clearing social links. Directions should open Google Maps in a new tab/app.

The Contact inquiry form and content CRUD remain console-only until their separate
backend modules are connected. Do not enter real customer data there.

Backend: `AndreyKharebov/veldridge-roofing-api`.
