# Frontend integration notes — Phases 1–5

This project is an interactive HTML5/CSS3/vanilla JavaScript frontend. No backend, database, network API contract, or secure authentication has been implemented. The public demo credentials and browser records must be replaced before production.

## Current boundaries

| Responsibility | Frontend seam | Current development implementation |
| --- | --- | --- |
| Sign-in, session, role navigation, logout | `window.BayleafDemo` in `app/script.js`; consumed by `login/script.js` | Public demo credentials and a browser-local role marker. Role checks only control this demonstration UI. |
| Unpaid ordering draft | `BayleafDemo.getOrder()` / `saveOrder(value)` | Browser-local draft, retained when payment is cancelled and cleared after a durable demo receipt is saved. |
| Menu, meal validation, arithmetic | `window.BayleafOrder` in `cashier/script.js` | Existing Figma menu/meal constants and integer-cent calculations, reused by ordering and checkout. No duplicate price list in payment code. |
| Payment and receipt data | `window.BayleafCashierData` in `cashier/data/script.js` | Asynchronous local adapter; the payment UI contains no direct storage calls. |
| Payment, completion, history, details presentation | `cashier/payment/script.js` | Inputs/events, loading local view data, validation, navigation, filtering, browser printing. |

`BayleafCashierData` currently exposes these **internal JavaScript operations**, not proposed HTTP endpoints or backend request/response contracts:

- `getCheckout()` reads and validates the current draft and supplies the checkout view.
- `completeCash(checkoutId, cashInCents)` validates and records one demo cash payment and returns its receipt view.
- `listTransactions()` supplies completed receipt views for the current browser.
- `getTransaction(id)` supplies one saved receipt or `null`.
- `dayKey(date)` formats a date for Asia/Manila history filtering.

The controller awaits the first four operations and catches failures. Replace their adapter implementation after the backend team agrees on authentication, endpoints, payloads, validation, error handling, and authorization. Map agreed backend responses into the frontend display values required by the UI. No URLs or database schemas have been assumed.

The current objects are disposable frontend mock/view data, **not a database schema or a proposed backend contract**. Money in the demo is integer Philippine centavos; formatting is presentation-only. Receipts snapshot names, quantities, included meal components, bundle unit prices, cashier, order type, subtotal, demonstration discount, total, cash, change, and completion time so history does not recalculate old receipts against a later menu.

## Backend responsibilities to coordinate

The backend teammate must provide real identity/session management, authorization, authoritative active catalog/prices and meal rules, the final discount policy, server-validated totals, authoritative transaction IDs/timestamps, durable persistence, and atomic/idempotent payment recording. Browser checks and demo role markers provide no security. Confirm the agreed error/loading/retry behavior together; then replace demo sign-in and storage with the agreed integration. No backend work was added in this phase.

The frontend disables duplicate submissions and reuses a checkout token; the local adapter also checks prior receipts and uses Web Locks where supported to coordinate this browser origin. This is useful for testing, but is not a substitute for server-side transaction guarantees. Local data can be edited or cleared by the browser user. Cash completion records the Cashier's simulated action; it does not contact a payment processor or validate actual cash collection.

## Demo storage and failure behavior

Existing keys remain `bayleaf.demo.session.v1` and `bayleaf.demo.order.v1`. Phase 4 adds `bayleaf.demo.transactions.v1`. No password is saved. Clearing site data removes the demonstration session, draft, and receipts. Use one local HTTP origin (for example VS Code Live Server) for all screens. Browser-private sessions or changing the host/port use different data.

A receipt is written before the paid draft is cleared. Quota/storage errors leave the unpaid order available and show an error; no success is shown for a failed receipt write. Invalid local history is reported rather than silently overwritten. Missing receipt IDs show a not-found message. Empty orders and unfinished meal builders cannot be paid. Changed orders require review before confirmation.

The ₱10 employee discount remains a Figma demonstration, documented internally rather than labeled as a demo in the operational UI. No final policy, eligibility, tax treatment, or additional fee was invented. Included meal components appear beneath the bundle on receipts and do not add charges.

## Routes and development fixtures

Application: root `index.html` → Cashier login → `cashier/take-order.html` → `cashier/payment.html` → `cashier/payment-complete.html?id=…`. Recent Transactions is `cashier/transactions.html`; its View receipt links open `cashier/order-details.html?id=…`. Cancel/Back preserves the unpaid order; a completed order is saved in history and its draft cleared. Print Receipt invokes the browser dialog with receipt-only thermal styling; choose an 80 mm paper/printer or Save as PDF. Printer hardware and system dialog options remain controlled by the operating system.

All five Figma reference states were archived outside the active project in [development/phase4](<../../Bayleaf POS preview archive 2026-11-04/development/phase4/>), including [payment-insufficient.html](<../../Bayleaf POS preview archive 2026-11-04/development/phase4/payment-insufficient.html>). These contain clearly labeled Figma sample values and no live scripts. They are internal review fixtures, not application data or user navigation. Actual application HTML remains visually complete without JavaScript; its noscript message explains that JavaScript is needed to use the application. Design System/Foundation boards remain internal and absent from user-facing navigation.

## Testing

Open the root `index.html` using VS Code Live Server. Cashier demo username: `mia.santos`; password: `BayleafDemo1!`.

1. Add Chicken Adobo once, Pork Menudo once, and Steamed Rice three times. Continue to Payment; total is ₱150.00.
2. Enter `120`: shortage is ₱30.00, change is zero, and confirmation is disabled. Enter `200`: change is ₱50.00. Empty, negative, exponent, nonnumeric, and more-than-two-decimal inputs cannot confirm.
3. Confirm payment once. Check the receipt, Print Receipt, and New Order. Reload the receipt and open Recent Transactions → View receipt; saved values must match.
4. Create a U2R1 meal, enable the demonstration discount, choose Takeout, and pay ₱100 exactly. Bundle subtotal is ₱110; demo discount is ₱10; change is zero. Included dishes are described but not separately charged.
5. Search history by order number, select a date, clear filters, and exercise no-results. History starts empty until a demo payment is completed; the five Figma sample orders are not seeded into the live app.

Automated browser validation evidence is in `docs/phase4-validation.json`. The test checks the full workflow, amounts, navigation, receipts, filtering, printing, storage failures, stale checkout, duplicate confirmation, role guards, local assets, and all five reference layouts at 1440 × 900. A printed PDF and screenshots are retained with the delivery evidence.

Phase 5 Admin functionality is complete. See [Phase 5 Admin handoff](phase-5-admin.md) for the full frame inventory, shared catalog and receipt adapters, report definitions, testing instructions, and remaining backend decisions. Final system-wide integration remains paused for approval.


## Phase 5 integration additions

- `app/catalog/script.js` supplies the shared browser-only menu. Cashier reads the same item names, categories, prices and active flags that Admin creates/edits. Meal bundle prices remain the existing Figma constants; included components are not separately charged.
- `cashier/data/script.js` retains Cashier-only payment creation while allowing both demo roles to read saved receipt snapshots. Admin does not rewrite or recalculate historical receipts.
- `admin/data/script.js` delegates catalog/receipt access and builds report views. `admin/script.js` handles UI interactions without direct storage access.
- The catalog adds `bayleaf.demo.menu.v1` to the existing mock keys. These are disposable frontend records, not a database schema or API request/response format.
- Replace the local adapters after endpoint/authentication/validation/reporting details are agreed with the backend team. The current local catalog bootstrap is synchronous; authoritative API catalog loading should be awaited during application initialization. No endpoints or backend contracts have been assumed.


## Admin date control correction

The visible controls now use native HTML buttons with a shared vanilla-JavaScript calendar in admin/dates/. Dashboard and Transactions accept inclusive custom ranges; report calendars select existing daily, Sunday–Saturday weekly, or monthly periods. The Admin report view adapter accepts an optional internal custom range for Dashboard filtering; it does not define a server payload or endpoint. Asia/Manila date filtering, saved receipt totals and current demonstration policies remain unchanged. See admin-date-controls.md for the implementation and actual mouse/keyboard tests.


## UI notice cleanup — 4 November 2026

Public credential/help panels, developer footers, demo/sample badges, receipt disclaimers and storage implementation instructions were removed from operational pages. Authentication and persistence remain the same temporary frontend simulation; hiding notices does not provide security or a database connection. Demo credentials remain in internal source/documentation for development. Neutral operational errors still report failed sign-in or failed saves, without exposing implementation instructions.

The employee discount still subtracts up to ₱10 from a nonempty order; no calculation, eligibility or tax policy was changed. Final eligibility, amount, limits, approval/audit requirements and tax treatment must be agreed with the backend team before production. Historical receipts retain their recorded values.

See [cleanup audit](cleanup-audit.md) and [focused verification](notice-cleanup-validation.json). No backend contract, endpoint, database schema or integration was added. The approved 41 preview/gallery files have now been archived outside the active project; see cleanup-audit.md.
