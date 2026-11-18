# Admin and Contact follow-up

Pull the matching backend address update and restart both apps. No package or
environment changes. Existing database records and uploaded images are untouched.

- Admin desktop/login wordmarks, mobile wordmark and View website open `/` in a
  separate tab with noopener/noreferrer. Existing layout and keyboard focus remain.
- Shared admin fields supply examples for Services, Projects/photos, News,
  categories, Testimonials, Settings, notes and login. Explicit placeholders win;
  values, labels, hints and native selects/date controls are not replaced.
  Media Edit has filename/alt examples as well.
- Additional care cards on Services render `summary` (Short description), not the
  full description. Main service details keep their existing behavior.
- Contact adds Property address (optional), max 300 characters, sent to the private
  inquiry API and displayed in admin details. Empty/old addresses remain valid.
- Inquiry search runs 300 ms after typing pauses, resets to page one, keeps the
  status filter, cancels superseded requests and supports immediate Enter/Clear.
  Search now includes property address and ZIP. No additional Search click needed.
- The Home-only Portfolio preview sentence is removed. Gallery demo badges and
  project isDemo flags are unchanged.

Run `node --test tests/adminFieldExamples.test.js`, `npm run lint`, and
`npm run build`. Test each item above on desktop/mobile with the running API.
No full-project build or live Atlas/GridFS/R2 checks were possible in the editing
environment. Unit/isolated checks do not replace those integration checks.
