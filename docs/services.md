# Services, Settings and Media usability update

Pull the matching backend update and restart both applications. No package or
configuration changes are required. Real API/Atlas/R2 checks must be done locally.

Settings Save is disabled until normalized values differ from the last loaded or
saved values. Time zone is a select with common US zones and other IANA zones.
Social domains can omit https://; server validation remains authoritative. Empty
or invalid social links are omitted from the Footer, including their icons.

Media Library has one Upload images action. Existing edit, bulk deletion and
paging remain. The service image picker supports direct uploads, a selection
preview and explicit Use image confirmation. Cancel does not delete an upload.

Services have no Residential/Commercial or background controls. Projects retains
its existing property-type input; this update does not implement Projects CRUD.
Service drafts need a name; publication also requires a summary and library image.
An inline message, fixed viewport notification and sticky save bar show creation,
save and validation outcomes even at the bottom of the form. Creation preserves
the response/notice across navigation and consumes the temporary history state.
The edit page includes Delete service with confirmation; images are retained.

Use the bounded Position select in a service form or Arrange services in the list.
Ordering is separate for main sections and supporting cards, across all pages and
statuses. Drag the handle, use its arrow keys/Home/End, or the arrow buttons.
Changes in Arrange services save automatically. Stale edits return 409: preserve
your text and reload, rather than silently overwriting another tab's changes.

Only visible detailed sections alternate white/warm, based on render order.
Hash links wait for asynchronous content then scroll smoothly, unless reduced
motion is requested. Existing Hero and reveal-animation timing settings are unchanged.

Editorial limits: summary 160, full description 300, up to 5 included items of
100 characters. Counters are shown. These are layout-informed choices, not values
specified by Figma. Existing longer values are displayed intact; shorten them
explicitly before saving. No migration truncates text or removes old work items.

Inquiries still logs to the console; Projects and Blog remain separate future modules.
Run `npm run lint`, `npm run build` and the manual checks after pulling.
