# Inquiries / Contact integration

Pull the matching backend and restart both apps. No new dependencies or environment
variables. Run npm run lint and npm run build locally. Overview metrics are unchanged.

Contact now sends a real inquiry (not console.log), optionally with 5 private roof
photos, JPEG/PNG/WebP up to 10 MiB each. Only name and phone or email are required.
Service is optional. Context from Services/Projects/News is resolved by the server.
No customer fields, photos or internal notes are logged or placed in localStorage.

Send Message disables during upload; errors retain text and file selections.
Retry unchanged data uses the same UUID key to prevent duplicates after a lost
response. Successful receipt clears form data and shows a reference. Send another
inquiry starts fresh. Closing/reloading while sending warns; sidebar/navigation
away does not guarantee keeping the form. Do not use real customer data in a demo.
There are no email notifications or automatic email confirmations in this module.

/admin/inquiries shows real data: status counts, status filtering, literal search,
20/page pagination, newest first, Refresh inbox and delete with confirmation.
The list refreshes after local/cross-tab inquiry events; only an 'updated' signal
is broadcast, never customer information. Status counts represent the whole inbox.
/admin/inquiries/:id shows original contact details, message/source, private photos,
internal notes, status update and deletion. Original customer data is read-only.
Notes record the administrator and date. Blank notes/unchanged status do not save.
Stale updates return 409; Reload details preserves the unsaved note.
Back to inquiries and tab close/refresh warn for unsaved notes/status; other sidebar
navigation does not save drafts. Success/errors use the fixed viewport notification.

Customer photos are deliberately NOT in public Cloudflare R2 / Media Library.
Backend GridFS stores them privately in your existing MongoDB; no new keys needed.
The viewer fetches authenticated blobs, uses temporary object URLs, revokes them
on close/unmount, and offers an explicit download. Logout prevents new requests;
already downloaded files cannot be revoked. Do not share customer downloads.

Delete removes the inquiry, notes and its private files. Interrupted deletion
shows a retry state; status/attachment access is blocked during cleanup. Closing
or marking Spam does not delete. Backend docs describe dry-run maintenance for
old interrupted uploads. No automatic cleanup, sample data or retention timer.

Checklist: minimal phone/email submission; validation; photos; unchanged retry;
list/search/filter/F5; private viewer and 401 without session; source snapshot;
status/note persistence; two-tab 409; delete/cancel; GridFS files removed; public
Media untouched; mobile layouts; News/Projects/Services/Settings regressions.
Real database and end-to-end checks must be run locally after pulling.
