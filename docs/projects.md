# Projects and Gallery

Pull the matching API changes and restart both apps. No npm or .env changes.
Run npm run lint and npm run build locally. No mock portfolio records are added.

/admin/projects now lists real records with status filters and 12/page paging.
/admin/projects/new creates a draft; /admin/projects/:id loads the existing editor.
Use Position in gallery or Arrange projects (automatic saving, drag handles,
keyboard arrows/Home/End, and arrow buttons). Positions include drafts/archives;
the public site shows the published subsequence. Stale saves/order snapshots
return 409 rather than overwrite another tab.

The editor includes multi-select from the Media Library and direct uploads
(10 files/batch, JPEG/PNG/WebP up to 10 MB). Selection is retained between library
pages and excludes already attached images. Up to 20 images per project.
Cancel does not delete uploaded files. Use Add photos then save the project.
Photo drag order and arrow controls update the form; save to persist them.
Cover is independent of the first photo. Captions and alt overrides are local to
the project. Removing a photo does not delete the original library image.

Required for draft: title. Required to publish: title, summary, service category,
property type, photos and cover. Display counters and limits preserve readable
layouts: title 150, summary 500, five work items of 150 characters. Photo caption
250; alt override 300. Detail fields are optional and empty facts are hidden.

Save controls are sticky with visible progress/success/error feedback. Creation
keeps its notification across navigation to the new editor. Unchanged forms do
not resubmit. Back to projects asks before discarding changes; tab reload/close
warns about unsaved values. Other sidebar navigation does not persist drafts.

Preview uses the existing gallery viewer, with photo arrows/thumbnails/swipes,
and is labelled unsaved. No CTA navigation is offered from the editor preview.
Drafts/archives are never public. Demo labels default on; disable only for verified
work. No customer files or sample projects are uploaded automatically.

Home shows the first four published projects with Show on Home. Gallery uses
all published projects, service/property filters, the existing Load More batches,
and the existing dialog. Home links use /gallery?project=ID#projects so the dialog
opens after asynchronous data arrives and can be linked directly. An unavailable
or private project is not displayed. Contact receives project context; inquiry
submission is still console-only (this update does not implement Inquiries).

Public content refreshes on focus/visibility and cross-tab project/service events.
Hero, Google Maps, Settings, Services editing and animation timing are unchanged.
Media and service deletions return 409 while any project refers to them. Deleting
a project leaves images in R2/Media Library. No broad automatic cleanup is run.

Manual check: draft → add images/metadata → preview → publish → Home/Gallery →
edit/reorder → archive → delete. Verify mobile layouts, failed requests, retry,
last-page deletion, expired session and the regression checks in the delivery note.
