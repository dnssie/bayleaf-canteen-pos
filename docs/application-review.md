# Application review before Phase 4

> Archive update — 4 November 2026: This is a historical phase report. Preview paths mentioned below now refer to [the external preview archive](<../../Bayleaf POS preview archive 2026-11-04/>), not active application files. Start the working application at [index.html](../index.html). The original version of this report is preserved in [the archive documentation snapshot](<../../Bayleaf POS preview archive 2026-11-04/_archive-records/documentation-before-archive/docs/application-review.md>).

## Corrections

- Root index.html is the real demo login interface, not a specimen gallery. login/index.html is also a login entry; cashier/index.html opens Take Order.
- Successful simulated login now navigates automatically to Cashier Take Order or Admin Dashboard. Role-specific frontend navigation guards and Log out use a browser-local demo session.
- Passwords are not stored. This is public, simulated authentication only; local JavaScript and localStorage provide no secure authentication or authorization. A real backend remains necessary for production security.
- Live Cashier starts empty and saves its draft, meal selections, quantities, order type, category/search, and sample discount locally. Reloading and returning after logout/sign-in restore that draft. Clear order removes its contents. Prices always come from the canonical menu and bundle definitions, not stored totals.
- Existing bundles can be edited by clicking their MEAL label; Save Meal replaces the original line and preserves its quantity. Cancel keeps the existing cart. Identical edited bundles merge correctly.
- All live navigation excludes design-system/specimen boards and static fixture hubs. Internal reference files remain accessible from development/index.html only; they are not linked from application pages.

## What currently works

Demo sign-in and all four validation outcomes; role navigation and logout; local session restoration; item/category search; category selection; cart add, merge, quantity adjustment and removal; all three meal builders; edit/cancel/save meal; integer-centavo totals; order type; demo-only flat ₱10 discount; browser-local draft restoration; independent menu/cart scrolling.

Public credentials: Cashier mia.santos / BayleafDemo1!; Admin ana.reyes / BayleafDemo1!.

## Static or pending

The Admin Dashboard remains the designed read-only zero-data screen. It has no completed sales because payment and transaction creation are not implemented. Menu management, Admin forms, reports, transaction history, payment, and receipts are pending; their controls explain that they are unavailable rather than opening previews. No Phase 4 workflows were added.

Internal login and ordering fixture pages remain static HTML/CSS reference states (with optional local interactions) for visual QA. The specimen boards remain development references. None is an application destination.

## Storage and running

Open the project root index.html with VS Code Live Server. Browser storage belongs to that origin/device; changing the hostname or port uses a different data store. File URLs may have browser-specific localStorage behavior, so use Live Server for reliable cross-page persistence. If storage is blocked or invalid, the app handles it without throwing and displays a storage-unavailable message when appropriate. Data can be modified or cleared by the browser user; it is not a secure database.

Without JavaScript, HTML/CSS still render the interfaces. Simulated sign-in, live interactions, client-side navigation guards, and persistence require JavaScript.

## Verification

Passed at 1440 × 900: actual root login and four validation cases; automatic Cashier/Admin navigation; logout and frontend role handling; item, meal, quantity and discount persistence across reload; bundle edit/cancel/replace/merge accounting; draft restoration after logout/sign-in; Clear order; malformed and unavailable local storage; no specimen/fixture navigation from live screens; local assets; no-JavaScript presentation. No uncaught JavaScript exceptions or failed asset requests were found. Hash checks confirm the existing shared and view stylesheets are unchanged. Browser navigation cancellations are excluded from failed requests. Full results are in application-review-validation.json. Phase 4 has not started.
