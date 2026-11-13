> **Admin integration:** Live content now comes from the shared local workspace.
> Edit it through `/admin`; the original data modules below are seed inputs only.
> See `src/admin/README.md` for demo credentials, persistence and backend limitations.
> Contact submissions are now saved to this browser’s demo inbox, not just logged.

# Contact page

Implements the approved Contact — Desktop 1440 design (Figma node 170:1501) and form states (173:1389). All source is page-owned. Uses the existing route, layout, font, colors and interior-page Sass mixins; no new runtime dependencies.

## Structure

- `ContactPage.jsx` — page composition, title, #contact-form navigation and router-state context.
- `components/ContactIntro` — compact heading and breadcrumb.
- `components/ContactDetails` — sample contact details and local SVG icons.
- `components/InquiryForm` — validation, semantic inputs, demo result.
- `components/PhotoPicker` — local optional selection, drop, removal and errors.
- `components/ContactMap` — the approved illustrative street-map diagram, sample marker and address card.
- `data/contactData.js` — contacts, service options and file limits.
- `data/inquiry.js` — pure validation/normalization, context, photo selection and demo payload helpers.

## Current behavior — demo only

Name and at least one contact method are required. Non-empty phone/email values are checked for basic syntax, not reachability. A supplied ZIP must be five digits or ZIP+4. Service, message and photographs are optional. Errors are linked to inputs and the first invalid control receives focus. Entered values are preserved after validation errors and when returning from the result.

A valid submit logs exactly one `[Veldridge Contact demo — not sent]` object to the browser console. It includes trimmed fields, selected service label, source context and file metadata only. There is no fetch, email, server upload, analytics event or persistent storage. The feedback says explicitly that nothing was sent. The result receives focus; Back to Form returns to the existing values.

Photographs: JPG/JPEG, PNG or WebP; maximum five total, at most 10 × 1024 × 1024 bytes each. Selection appends, duplicates (name/size/type/lastModified) are ignored, and invalid batches are rejected atomically. Previous valid selections stay unchanged. File errors must be corrected or dismissed before submission; photos can always be omitted. MIME/extension checks are convenience checks, not server-side security. No image contents or object URLs are read or logged. Navigation/reload discards the local file selection.

The Gallery router state `{ projectId, projectTitle }` and Blog state `{ articleId, articleTitle }` prefill an editable message. A different source remounts the form; typing does not reapply the template. The original source context stays separately in the logged object. No Gallery/Blog changes are necessary.

## Before publication

1. Replace all fields in `contactData.js` with confirmed information. While `isDemo` is true, sample phone/email are text, not live call/email links.
2. Replace `ContactMap` with a real map provider and verified office coordinates. The current local map is deliberately schematic, has no geographic accuracy, directions, tiles, key or external requests. Changing `isDemo` alone does NOT turn this map into a live map.
3. Replace the console handler with a real endpoint only when ready. Add server-side validation and file inspection, storage limits, abuse protection and a suitable privacy notice. Do not show a delivery confirmation until the server accepts the request. Remove demo console logging before accepting genuine inquiries.
4. Keep service options synchronized with the published service catalog.

## Checks

Run `npm run lint` and `npm run build`. Verify name + email only, name + phone only, invalid optional values, zero files, duplicate/invalid/oversized/excess files, removal/reselection, keyboard access, mobile form layout, context from Gallery/Blog, and absence of network submissions. Assets are downloaded from Figma and stored locally; no temporary asset URLs are used at runtime.

## Animation settings

All timing and motion distances: `src/styles/motion/_settings.sass`.
Trigger/carousel configuration: `src/config/motion.js`.
Shared behavior: `src/hooks/useMotionReveal.js`. Page-specific target selectors
are in `motion/contactMotion.js`. See `src/styles/motion/README.md`.
