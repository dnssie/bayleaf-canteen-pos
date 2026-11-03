# Phase 5 — Admin frontend

The Admin interface is implemented with HTML5, CSS3, and separate vanilla JavaScript. It uses the existing design tokens, shared controls/sidebar/receipt patterns, original Figma SVG assets, and local Inter font. No backend, database, or server-side authentication was added. Final system-wide integration and unrelated features have not started.

## Figma coverage

| Exact frame name | Node | Application implementation |
| --- | --- | --- |
| Admin / 13 — Dashboard | 2004:32862 | `admin/dashboard.html`, empty and local-data states |
| Admin / 14 — Menu Management | 2004:32943 | `admin/menu.html`, all 19 original entries including the inactive entry |
| Admin / 15 — Add Menu Item | 2004:33195 | Add dialog in Menu Management |
| Admin / 16 — Edit Menu Item | 2004:33475 | Edit dialog in Menu Management |
| Admin / 17 — Deactivate Item Confirmation | 2004:33758 | Status confirmation dialog |
| Admin / 18 — Transactions | 2004:34026 | `admin/transactions.html` |
| Admin / 19 — Transaction Details | 2004:34118 | `admin/transaction-details.html?id=…` |
| Admin / 20 — Daily Sales Report | 2004:34238 | `admin/reports.html` |
| Admin / 21 — Weekly Sales Report | 2004:34350 | `admin/reports-weekly.html` |
| Admin / 22 — Monthly Sales Report | 2004:34485 | `admin/reports-monthly.html` |

The operational Admin login is retained. Its static validation fixtures are in [the external login-state archive](<../../Bayleaf POS preview archive 2026-11-04/login/states/>). All ten reviewed Admin reference states have standalone HTML/CSS fixtures in [the external development/phase5 archive](<../../Bayleaf POS preview archive 2026-11-04/development/phase5/>), using Figma's sample figures without seeding them into live transaction storage. These fixtures and the Design System/Foundation boards are excluded from application navigation. Application HTML remains visually complete when JavaScript is disabled; JavaScript is required for interaction.

## Working features

- Dashboard date and period selection, net-sales/transaction-count/average metrics, sales overview, and recent-transaction detail links. The original empty dashboard appears until there are completed payments for the selected period.
- Menu search and category filtering, no-results state, item counts, add/edit forms, required-field and decimal price validation, status display, deactivation/reactivation, close/Cancel/Escape, keyboard focus containment and return, save-error feedback, and stale-edit protection.
- Transactions read the same completed Cashier receipts, with order-number search, date filtering, clear filters, empty/no-match states, original receipt details, and browser printing.
- Daily/weekly/monthly report navigation, date/month selection, gross/discount/net totals, transaction counts, rounded average, period charts, daily detail links, and CSV download for the selected period.
- Original U1R1 ₱70, U2R1 ₱110, and V1R1 ₱45 prices remain fixed. Included components are never added as separate charges. Admin edits only individual menu entries; Figma provides no meal-price configuration screen.

## Shared data and precise behavior

`app/catalog/script.js` is a replaceable browser-only catalog adapter. It exposes asynchronous `listMenu`, `saveItem`, and `setAvailability` operations, plus local bootstrap/refresh helpers. The original menu seeds only a missing catalog; edits persist under `bayleaf.demo.menu.v1`. New items start active as Figma specifies. Items can be inactive without being deleted. The form rejects blank names, unlisted categories, malformed/negative prices, and more than two decimal places; additional business constraints remain for the backend team to define.

Cashier ordering and payment use this same catalog. On page load, focus, or a catalog storage event, active menu choices and prices refresh. Unavailable or invalid unpaid cart selections are removed and incomplete meal choices require reselection. A payment screen rejects an order whose current values differ from those originally displayed. These are frontend draft checks, not server reservation or concurrency guarantees. Completed receipts are immutable display snapshots: renaming, repricing, deactivating, or reactivating an item does not recalculate old receipts or reports.

Figma's add/edit form has no image upload field. New items, and an activated original item without an image, preserve the Cashier photo slot with a neutral “No image” label. No substitute photographs or upload workflow were invented.

`cashier/data/script.js` retains Cashier-only payment creation and now permits both signed-in demo roles to read the existing receipt history. `admin/data/script.js` delegates catalog operations and receipt reads, then builds Admin display summaries. `admin/script.js` handles events and rendering; it does not directly read or write localStorage.

Reports use Asia/Manila calendar dates. The weekly display is Sunday–Saturday, matching Figma's 25–31 Oct 2026 example. Monthly chart periods are 01–07, 08–14, 15–21, and 22–month end, matching the Figma chart; they are display groupings, not a new accounting policy. Gross sales sum saved subtotals, discounts sum saved demonstration discounts, and net sales sum saved totals. Average is net sales divided by completed transaction count, rounded to the nearest centavo for display. No taxes, fees, refunds, voids, or new discount policy were introduced.

CSV is a frontend download of the selected period's completed transactions with transaction number, Manila completion date/time, cashier, order type, gross amount, demonstration discount, net amount, and cash payment method. It includes no proposed backend payload. Text cells are escaped and formula-like leading characters are neutralized. Empty periods export headers only. The ₱10 employee discount remains a clearly identified Figma demonstration, including on receipts/report labels and export headers.

## Backend handoff

These are JavaScript view/data seams, not proposed HTTP endpoints, request formats, or database schemas:

| Seam | Current role | Future coordination |
| --- | --- | --- |
| `BayleafDemo` | Existing public demo identity, local draft, navigation | Replace with agreed secure sign-in/session/authorization and draft handling. |
| `BayleafCatalogData` | Menu reads, add/edit/status writes, mock bootstrap/refresh | Replace browser persistence with the agreed catalog API; await the authoritative catalog during Cashier initialization instead of the current synchronous mock bootstrap. |
| `BayleafCashierData` | Existing payment creation and immutable receipt reads | Replace with authoritative server validation, atomic/idempotent transaction creation, transaction IDs/timestamps and durable reads. |
| `BayleafAdminData` | Admin catalog access, receipt views, report aggregation and CSV display data | Map agreed responses into view data; move authoritative aggregation/report definitions to the backend as coordinated. |

The backend team must agree on authentication/roles, catalog identifiers and asset handling, allowed prices and validation, availability rules, discount eligibility, authoritative monetary calculations, report date boundaries and aggregation, transaction authorization, concurrency and error/retry semantics. No server contract was invented. Browser Web Locks and record signatures help test local duplicate/stale edits; they provide no security or production transaction guarantees.

## Preview and test

Open the project root login page in VS Code Live Server. Use the same host/port for both roles so browser data is shared. Admin demo credentials are **ana.reyes / BayleafDemo1!**; Cashier credentials remain **mia.santos / BayleafDemo1!**. The existing simulated session has one role per browser origin: log out before switching roles.

1. Sign in as Admin. Navigate through Dashboard, Menu Management, Transactions, and Sales Reports. Existing Cashier receipts should appear for the selected date. Clear the Transactions date filter to see all dates.
2. Add an item with a name/category/price; try submitting empty fields or invalid prices. Edit it, cancel an edit, deactivate it, and activate it again.
3. Log out and sign in as Cashier. Confirm that inactive items are absent from cards and meal builders, active/new items appear, and edited unit prices are used. Meal bundle prices remain unchanged.
4. Complete a Cashier payment, log out, and return as Admin. Check its transaction details and the Dashboard/report totals for the same Manila date.
5. Switch Daily/Weekly/Monthly, choose another date/month, open a daily transaction, return, and export CSV. A period with no completed payments must show zero totals rather than Figma sample sales.

Automated scoped browser evidence is in `docs/phase5-validation.json`; existing Cashier regression evidence is in `docs/phase5-cashier-regression.json`. Screenshots cover every corresponding Admin frame at 1440 × 900. Tests run in an isolated Chrome profile rather than changing the user's normal browser records.

## Remaining limitations

All identities and persistence remain temporary browser simulations, with data isolated by origin and editable/clearable by the browser user. Backend authentication, shared multi-device persistence, authoritative reporting/payment/catalog validation, production image handling, and final policies are pending coordination. Figma supplies only an empty Dashboard; its populated chart and recent rows reuse the report/table patterns. Physical printer hardware is not tested. There is no delete, refund/void, account-management, or meal-price-management workflow because these are not shown in the requested Figma frames. Final system-wide integration remains paused for approval.


## Date controls follow-up

The original transparent-input opening issue has been corrected with explicit accessible date buttons and body-portal calendar popovers. Dashboard/Transactions now support single dates and custom inclusive ranges; Daily/Weekly/Monthly report rules are unchanged. Reset/preset actions and keyboard controls are documented and tested in admin-date-controls.md and admin-date-validation.json. The original Phase 5 tests changed values directly; new tests also open the calendars with trusted mouse/keyboard events.
