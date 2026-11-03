# The Bayleaf Canteen POS

HTML5, CSS3, and separate vanilla JavaScript. No framework, package install, or build is needed.

## Run

In VS Code, open the project root index.html with Live Server. The entry point is the actual login interface. Use the public demo credentials:

- Cashier: mia.santos / BayleafDemo1!
- Admin: ana.reyes / BayleafDemo1!

Sign-in is simulated locally and navigates automatically. Log out clears the local demo session. Cashier drafts are saved in this browser and retained for the same demo account; Clear order empties the draft.

## Functionality

Login validation, role navigation, logout, interactive Cashier catalog/search/cart, all meal bundles, bundle editing, quantities/totals, sample discount, and browser-local persistence are implemented. Phase 4 Cashier cash payment, insufficient-cash validation, completion, printable receipts, searchable/date-filtered local history, and order details are implemented. Phase 5 Admin Dashboard, Menu Management (create/edit/activate/deactivate), Transactions/details, Daily/Weekly/Monthly reports, filters and CSV export are implemented. Admin and Cashier share the temporary local catalog and receipt data.

This is a frontend simulation. There is no secure authentication, server-side access control, backend, or shared database. Passwords are never saved. The ₱10 discount is demonstrative, not a final policy.

## Organization

- css/: shared tokens, base styles, components and layouts.
- assets/: local original Figma images/icons and Inter font.
- app/script.js: browser-local demo session/storage and navigation helpers.
- app/catalog/script.js: replaceable shared local catalog adapter.
- login/script.js: input validation and successful sign-in navigation.
- cashier/script.js: interactive order state, shared pricing model, and local drafts.
- cashier/data/script.js: replaceable asynchronous local payment/receipt data adapter.
- cashier/payment/script.js and styles.css: payment, receipt, history, and details controllers/styles.
- docs/frontend-integration.md: mock boundaries, backend handoff points, limitations, and test instructions.
- docs/phase4-validation.json: Cashier browser verification at 1440 × 900.
- admin/: interactive Dashboard, Menu Management, Transactions/details, and report interfaces.
- admin/data/script.js: Admin view adapter over the shared catalog and receipt source.
- admin/script.js and styles.css: Admin interactions and Figma layouts.
- docs/phase-5-admin.md: completed features, preview steps, backend handoff and limitations.
- docs/phase5-validation.json and phase5-cashier-regression.json: Phase 5 and Cashier verification.
- docs/application-review.md: review findings and current limitations.
- [Archived visual-reference hub](<../Bayleaf POS preview archive 2026-11-04/development/index.html>): moved outside this project after approval.
- [Archived design-system source](<../Bayleaf POS preview archive 2026-11-04/design-system/>): retained outside the application.

Static login/Cashier states and preview galleries were archived with their relative paths under [Bayleaf POS preview archive 2026-11-04](<../Bayleaf POS preview archive 2026-11-04/>). They are not part of the active application. See docs/cleanup-audit.md for the approved inventory and restore guidance. JavaScript is required for functional interactions; HTML/CSS remain visually complete without it. Use 1440 × 900 at 100% zoom for the Figma reference layout.

Admin demo: log out before switching roles. Use the same Live Server origin/port to share local menu changes and transactions. Final system-wide integration remains paused for approval.

Admin date controls now use explicit accessible calendar popovers. Dashboard and Transactions support single dates/ranges and presets; Daily/Weekly/Monthly reports retain their existing period rules. See docs/admin-date-controls.md for behavior and new mouse/keyboard validation.
