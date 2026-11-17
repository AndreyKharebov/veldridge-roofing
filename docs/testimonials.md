# Testimonials / Homepage reviews

Pull the matching API changes. No new packages or .env changes. Restart both apps,
run npm run lint and npm run build locally, then test against your API/Atlas/R2.

New navigation: Testimonials. Routes /admin/testimonials, /new and /:id.
The list supports status filters, 12/page pagination, Refresh, Edit and confirmed
Delete. New review fields: author name, optional location, rating 1..5, text up to
600 characters, optional library photo, status and Demonstration review.
Draft needs a name. Published also needs text. IsDemo defaults on; public demo
cards are labelled. No reviews or fictitious people are seeded automatically.

Author photo uses the existing media picker with direct upload. Cancelling the
picker does not delete uploaded images. Without a photo (or on image failure),
the card displays initials. Removing a selection does not delete the library file.
An image referenced by any review cannot be deleted, including in bulk Media
operations, until that reference is removed/saved or the review is deleted.

The editor has a live card preview, counters, unchanged-save protection, sticky
save controls and viewport feedback. Creation preserves its success notice across
navigation and clears the temporary route state. Failed saves retain input.
Version conflicts offer Reload saved review (confirms discarding local changes).
Back and tab reload/close warn about unsaved changes. Other sidebar navigation
does not automatically save drafts. Delete is available in the list and editor.

Home reads published reviews only, newest first by first publication date;
republishing an archived review retains that date. Admin list is newest created
first. No arbitrary position field/manual sorting is introduced in this module.
Desktop shows two cards, mobile one. Previous/Next, an explicit pause/play control,
hover/focus pausing and reduced-motion support retain the existing carousel timing.
Only visible cards enter the DOM; shrinking/empty data cannot leave a stale card.
Public content refreshes on focus, visibility and same-origin review changes.

This is manually managed content, not Google/Facebook reviews or verified badges.
Photo URLs are public Media URLs; private Inquiry attachments are never used.
Overview metrics, existing modules, Hero, Maps and animation configuration are unchanged.

Smoke checks: name-only draft; publish with/without photo; upload; F5; edit;
archive hides Home; carousel controls and reduced motion; two-tab 409; linked-image
409; delete preserves photo; failed API/expired session; mobile layout/regressions.
