# Phase 3 — Cashier Ordering Interface

> Archive update — 4 November 2026: This is a historical phase report. Preview paths mentioned below now refer to [the external preview archive](<../../Bayleaf POS preview archive 2026-11-04/>), not active application files. Start the working application at [index.html](../index.html). The original version of this report is preserved in [the archive documentation snapshot](<../../Bayleaf POS preview archive 2026-11-04/_archive-records/documentation-before-archive/docs/phase-3-ordering.md>).

Open cashier/index.html with Live Server or directly in a browser. It links to all ten Figma states. cashier/take-order.html starts with the Figma sample order; cashier/states/empty.html starts empty. Every page contains full static HTML and fixture totals; cashier/script.js adds optional behavior.

## Delivered

Default, Rice category, empty order, open meal dropdown, U1R1/U2R1/V1R1 builders, meal added, multiple meals, and discount example. All 18 active menu items use their original Figma photographs; Rice uses its frame-specific assets. Inactive Pork Bicol Express exists only as an inactive data record and cannot be added or selected.

Working interactions: category filtering, case-insensitive search, no-results state, adding items, quantities, line removal, order type selection, native keyboard-accessible meal dropdown and select controls, required meal validation, add/cancel meal, bundle quantities, totals, and the sample discount toggle. Review controls let you clear the cart or reload a known fixture.

## Business rules

- Integer centavos for calculations; PHP formatting for display.
- U1R1: 1 active Ulam + 1 active Rice for ₱70.
- U2R1: 2 active Ulam selection slots + 1 active Rice for ₱110.
- V1R1: 1 active Gulay + 1 active Rice for ₱45.
- Required selections must match the specified categories. Add Meal stays disabled until complete.
- Included components remain descriptive children of one cart line, never separately billed.
- Identical bundles with the same slot selections merge into a quantity. Different choices remain separate lines.
- Minus stops at one; the remove control deletes the line. Item counts include the food portions inside each bundle, matching the Figma multiple-meals count.
- U2R1 has no documented distinct-dish restriction; both selection slots are required, but no additional restriction is invented.
- The flat ₱10 discount is a Figma demonstration only, shown with an explicit sample label. It never creates a negative total or applies a percentage. Empty orders stay zero.

## Preview fixtures

Default/Rice/dropdown: Adobo ×1 + Menudo ×1 + Steamed Rice ×3 = ₱150.
Meal added: U1R1 ×1 + Menudo ×1 + Steamed Rice ×2 = ₱150.
Multiple meals: U1R1 ₱70 + U2R1 ₱110 + V1R1 ₱45 + Chips ₱10 = ₱235, eight food items across four cart lines.
Discount: meal-added fixture ₱150 minus sample ₱10 = ₱140.
Meal-builder fixture pages start with an empty cart, as in Figma. Opening a builder from a working cart preserves that cart until Add Meal or Cancel.

## Limitations and boundaries

Frontend memory only; reloads and preview navigation reset to the selected fixture. No database, saved orders, payment, receipts, transaction history, or Admin management is implemented. Continue to Payment retains the design appearance but only announces that payment is unavailable. Static example clock and profile remain from Figma. Narrow displays preserve desktop layout with scrolling; mobile layouts were not supplied.

No unrelated shared CSS or login files were edited. The Cashier HTML/styles from Phase 1 were extended within their existing scope. Phase 4 requires approval.
