# News CRUD

Pull the matching backend and restart. No npm install or .env changes are needed.
Run npm run lint and npm run build, then test with your local API/Atlas/R2.

/admin/news now has status/category filters, 12-per-page pagination, editing and
deleting. /admin/news/new creates a draft; /admin/news/:id edits persisted data.
/admin/news/categories, /new and /:id support category CRUD with usage counts.
Categories are optional. Duplicate names (ignoring case/spaces) and deleting used
categories are rejected by the API, including draft/archived references.

The editor retains title, introduction, ordered heading/paragraph sections,
optional source link, publication date and status. Select or directly upload a
cover using the existing picker; uploads stay in Media Library if cancelled.
Alt override is article-local; empty uses Media.alt. Preview uses the same public
reader without the Contact CTA and does not save. Content is text, not HTML.

A draft needs a title. Publication also needs an introduction, cover and at least
one complete section. Blank publication date becomes today (UTC). Future dates
cannot be published: scheduled publishing is not implemented. Newest dates appear
first; Home shows the three latest published articles.

Title 150, introduction 300, alt 300; 20 sections, heading 200, body 5000 and 16000
section characters total. Source label 150/URL 2000; category name 80/description
500. Counters and server limits agree. Bare source domains accept automatic https.

Existing unchanged articles do not resubmit. Saving/creation feedback is visible
in a sticky action bar and a viewport notification. Creation carries its result
across navigation and clears the temporary route state. Failed saves keep input.
Back/refresh/close warn about unsaved article data; sidebar navigation does not
silently save drafts. Stale editors receive 409 instead of overwriting updates.

Blog uses server paging/category filtering; full article text loads on opening.
Home links use /blog?article=ID#articles, including after a fresh load. Reader
query changes preserve background scroll. Errors/404 are shown inside the reader;
closing, Escape, backdrop and focus return are retained. Public data refreshes on
focus, visibility, and article/category changes across same-origin tabs.

Hero, existing public styling/assets and reveal timing are retained. Only News
styles and small reader overflow/paragraph rules are added. The image picker gains
optional title/entity labels; its default Services behavior stays unchanged.
Inquiries remains console-only and Overview metrics are still a later module.

Manual checklist: create category; reject duplicate; title-only draft; add cover
and sections; preview; publish; Home/Blog/direct reader link; source/Contact link;
edit and F5; archive hides content; test two-tab conflict; used category/image
cannot be deleted; delete article keeps cover; delete now-unused category. Check
12+ article paging, failed requests, mobile layout and existing modules.
