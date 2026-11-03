# Bayleaf POS cleanup audit — 4 November 2026

**Approved archive completed — 4 November 2026.** Exactly the 41 files listed below were moved to [Bayleaf POS preview archive 2026-11-04](<../../Bayleaf POS preview archive 2026-11-04/>). Original relative paths and SHA-256 hashes are preserved. Nothing was permanently deleted. All 15 operational pages and all three optional aliases remain. Active project: **145 files — 18 HTML, 11 CSS, 9 JavaScript, 107 other**.

The archive contains those 41 original files plus an _archive-records folder with the manifest, original documentation snapshots and verification evidence. The original pre-archive audit is preserved in [the documentation snapshot](<../../Bayleaf POS preview archive 2026-11-04/_archive-records/documentation-before-archive/docs/cleanup-audit.md>). Archive previews rely on shared assets/styles retained in the active project; the archive is a restorable source set, not an independent runnable application.

To restore, copy the 41 manifest-listed paths from the archive into the same relative locations under the project root, checking for existing files before overwriting. Do not copy _archive-records into the application. No restoration is performed by this task.

The figures and alternatives below record the original cleanup proposal; only the 41-file option was approved. Original inventory was 184 files: 57 HTML, 12 CSS, 10 JavaScript, 105 other files. This report and its verification JSON add two files, so the pre-archive inventory was **186 files** (57 HTML, 12 CSS, 10 JavaScript, 107 other).

## Recommendation and estimated counts

| Option | Files | HTML | CSS | JavaScript | Other |
| --- | ---: | ---: | ---: | ---: | ---: |
| Before archive, including this report and validation | 186 | 57 | 12 | 10 | 107 |
| Archive/remove the 41 preview/gallery files below | 145 | 18 | 11 | 9 | 107 |
| Additionally remove three optional entry aliases | 142 | 15 | 11 | 9 | 107 |

Counts describe files remaining inside the project if candidates are removed or archived outside it. Moving them to an archive folder within the project would not reduce its total. The original 184-file baseline would become 143 after the gallery-only cleanup, before adding these two documents. Prefer archiving the gallery as one set, to preserve its internal references and Figma review history. No technical documentation or assets need to be removed to achieve the recommended 145-file result.

## Keep: working application

The 15 operational HTML pages are:

- `index.html`
- `cashier/login.html`
- `admin/login.html`
- `cashier/take-order.html`
- `cashier/payment.html`
- `cashier/payment-complete.html`
- `cashier/transactions.html`
- `cashier/order-details.html`
- `admin/dashboard.html`
- `admin/menu.html`
- `admin/transactions.html`
- `admin/transaction-details.html`
- `admin/reports.html`
- `admin/reports-weekly.html`
- `admin/reports-monthly.html`

Keep all shared application code under app/, login/, cashier/ and admin/, including catalog/data/date/payment adapters and styles; all five css/ stylesheets; all assets and their font license/manifest. The single exceptions are the explicitly listed fixture folders and gallery-only root script.js below. Keep README.md and all backend handoff notes. In particular:

- `README.md`
- `docs/frontend-integration.md`
- `docs/implementation-status.md`
- `docs/phase-5-admin.md`
- `docs/admin-date-controls.md`
- `docs/take-order-fixes.md`

Keep all documentation/evidence by default. Prior validation JSON, screenshots and phase notes are development history, not runtime dependencies. They have not been moved; they may be archived separately later, but handoff notes link to that evidence; update those references or preserve the archive as a complete bundle. They are not classified as expendable solely because the application does not load them.

## Approved archived files: 41 files

These comprise 39 fixture/gallery HTML documents, one Design System stylesheet and the root gallery script. None is reached from live HTML/script/style dependencies or current dynamic application routes. These were moved together after explicit approval. Development gallery navigation and documentation referring to those fixtures must then be updated or retained inside the archive. The operational entry point is root index.html; do not confuse its required login/script.js with the gallery-only root script.js.

- `cashier/states/default.html`
- `cashier/states/discount.html`
- `cashier/states/empty.html`
- `cashier/states/meal-added.html`
- `cashier/states/meal-dropdown.html`
- `cashier/states/multiple-meals.html`
- `cashier/states/rice.html`
- `cashier/states/u1r1.html`
- `cashier/states/u2r1.html`
- `cashier/states/v1r1.html`
- `design-system/index.html`
- `design-system/styles.css`
- `development/cashier-previews.html`
- `development/index.html`
- `development/login-previews.html`
- `development/phase4/index.html`
- `development/phase4/order-details.html`
- `development/phase4/payment-complete.html`
- `development/phase4/payment-insufficient.html`
- `development/phase4/payment.html`
- `development/phase4/transactions.html`
- `development/phase5/add-menu-item.html`
- `development/phase5/dashboard.html`
- `development/phase5/deactivate-item.html`
- `development/phase5/edit-menu-item.html`
- `development/phase5/index.html`
- `development/phase5/menu.html`
- `development/phase5/reports-monthly.html`
- `development/phase5/reports-weekly.html`
- `development/phase5/reports.html`
- `development/phase5/transaction-details.html`
- `development/phase5/transactions.html`
- `login/states/admin-empty-fields.html`
- `login/states/admin-incorrect-password.html`
- `login/states/admin-incorrect-username.html`
- `login/states/admin-invalid-credentials.html`
- `login/states/cashier-empty-fields.html`
- `login/states/cashier-incorrect-password.html`
- `login/states/cashier-incorrect-username.html`
- `login/states/cashier-invalid-credentials.html`
- `script.js`

## Optional aliases: 3 files, retained

- `login/index.html`
- `admin/index.html`
- `cashier/index.html`

login/index.html duplicates the Cashier login. admin/index.html and cashier/index.html redirect folder URLs to their operational screens. Live application links do not require these aliases, but external bookmarks/folder URLs may; removing them is a separate choice, not part of the recommended gallery cleanup.

## Dependency checks and limits

The audit followed HTML href/src and CSS url() references transitively from all 15 application roots, reviewed JavaScript-built navigation and catalog/icon mappings, and checked live asset requests in the browser. No missing live file references were found. No preview candidate is reachable from the operational roots. All 10 JavaScript files passed syntax checks. There are no package/build dependencies to remove.

Keep all assets: a filename-only scan missed the dynamically constructed payment icon assets/icons/7eb9d.svg, demonstrating why text searches alone cannot justify asset deletion. The remaining source-unmentioned files (3abb3.svg, 77bd9.svg and bd102.png) may belong to internal reference layouts; retain their original Figma provenance and avoid deleting them in this cleanup. Shared CSS can also be used by both fixtures and live pages; no CSS rules were broadly pruned.

## UI changes and modified files

Removed entire credential help sections, their demo links/results and dangling help descriptions from all 12 login documents (four entry/role variants and eight internal validation fixtures). Login fields, error messages, role navigation, password toggle and mock credential checks remain. On operational Cashier/Admin pages, removed developer footer notices, sample/demo badges and receipt notes. Kept Clear order, cash-only information, and the employee discount control. Dynamic receipt, CSV and error text uses operational language. The discount amount/calculation is unchanged. Technical caveats and developer credentials remain internal, not an assertion of secure authentication.

Existing files modified (33):

- `index.html`
- `cashier/login.html`
- `admin/login.html`
- `login/index.html`
- `login/states/admin-empty-fields.html`
- `login/states/admin-incorrect-password.html`
- `login/states/admin-incorrect-username.html`
- `login/states/admin-invalid-credentials.html`
- `login/states/cashier-empty-fields.html`
- `login/states/cashier-incorrect-password.html`
- `login/states/cashier-incorrect-username.html`
- `login/states/cashier-invalid-credentials.html`
- `cashier/take-order.html`
- `cashier/payment.html`
- `cashier/payment-complete.html`
- `cashier/transactions.html`
- `cashier/order-details.html`
- `admin/dashboard.html`
- `admin/menu.html`
- `admin/transactions.html`
- `admin/transaction-details.html`
- `admin/reports.html`
- `admin/reports-weekly.html`
- `admin/reports-monthly.html`
- `login/script.js`
- `app/script.js`
- `app/catalog/script.js`
- `cashier/script.js`
- `cashier/payment/script.js`
- `admin/script.js`
- `admin/data/script.js`
- `cashier/data/script.js`
- `docs/frontend-integration.md`

Added only docs/cleanup-audit.md and docs/notice-cleanup-validation.json. No CSS, images, icons, fonts, business calculations, storage keys or historical data were changed. Scratch tooling/backups are outside the application project.

## Focused verification

51 checks passed at 1440 × 900, using an isolated Chrome profile. All four login validation states, password visibility, both role logins, logout/role links, quantity adjustment, Clear order, unchanged discount, insufficient cash, successful payment, receipt print invocation, history/details, shared Admin transaction reads, report/CSV amounts and storage-failure sign-in were verified. Each affected live page loaded without broken images, horizontal overflow or dangling ARIA descriptions. No JavaScript exceptions, browser console errors, or failed HTTP requests were observed. Print verification invokes a stub of the browser print function; physical printer output was not retested. This is scoped notice-cleanup verification, not final system-wide integration or a new pixel-level Figma comparison.

The calculation checked was Chicken Adobo ₱55 − ₱10 = ₱45; cash ₱100 produces ₱55 change. The recorded receipt remained identical when read through the Admin adapter. Test data does not alter the user's usual browser storage. See notice-cleanup-validation.json for evidence.

## Backend decisions still required

Real authentication/session lifecycle and authorization; agreed API contracts and adapter replacement; authoritative active catalog, bundle rules/prices and server totals; durable transaction IDs/timestamps and atomic/idempotent payment recording; final employee discount eligibility/amount/limits/tax treatment; and reporting/date-boundary/error handling contracts. No endpoints, schemas or final policies were invented. Local storage and mock role markers remain temporary and editable by the browser user. Removing their visible descriptions does not make them secure. Backend implementation and final integration remain outside this task.

## Post-archive verification

Completed 60 focused browser checks at 1440 × 900 after archiving. Login validation and role navigation; Cashier ordering, quantity, discount, payment, receipt print action and history; Admin menu validation/create/edit/search/deactivation; active/inactive menu visibility in Cashier; shared transactions; and report/CSV calculations passed. The three optional aliases are retained and their navigation works. Tests used an isolated Chrome profile, leaving normal browser records untouched.

File verification confirmed exactly 41 approved files moved with matching SHA-256 hashes, all 138 retained non-documentation files unchanged, and seven documentation files updated with archive references. All 9 remaining JavaScript files pass syntax checks. No missing live HTML/CSS dependencies or broken Markdown links were found. There were no JavaScript errors or failed application dependency requests. An existing automatic request for an optional favicon.ico can return HTTP 404; no favicon was present in the pre-archive inventory and no unrelated fix was made.

Evidence: [file verification](<../../Bayleaf POS preview archive 2026-11-04/_archive-records/archive-file-verification.json>) and [browser verification](<../../Bayleaf POS preview archive 2026-11-04/_archive-records/archive-verification.json>). The receipt print button was exercised with a print-function stub; physical printing was not retested. Final active counts remain 145 total: 18 HTML, 11 CSS, 9 JavaScript and 107 other files. No additional integration, redesign or cleanup was performed.