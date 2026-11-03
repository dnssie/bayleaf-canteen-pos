# Take Order clock and newly active item visibility

Only two application files changed: cashier/script.js and cashier/take-order.html. No pages were rebuilt and no Admin, Cashier payment, receipt, transaction-storage or business-rule implementation was changed.

## Current clock

The Take Order header was still literal Figma date/time text. It now displays the current date and time in Asia/Manila, using the same formatting/time zone as Recent Transactions. It updates on load, each minute, focus and return to a visible tab. Only the live header time elements are updated; historical transaction timestamps remain untouched.

## New Admin items

The issue was reproduced by saving Cashier's Rice category and fried search, then creating an active Ulam item named Hotdog in Admin. The item existed in the shared catalog but was hidden by the restored filters.

Cashier now remembers the active item IDs it last displayed as draft UI state. If an addition/reactivation would be hidden by stale filters, it selects All, clears the search and scrolls the new item into the menu viewport while retaining the valid unpaid cart. When the catalog has not changed, saved category/search behavior is preserved. The menu also refreshes for same-page catalog-change events and visible-tab returns, in addition to existing load/focus/storage refreshes. Inactive entries remain excluded.

This continues using the existing browser-local source and requires Admin/Cashier to use the same application origin. No backend, endpoint, database schema, pricing rule or discount policy was added.

## Focused verification

Tests ran at 1440 × 900 in an isolated browser profile:

- Created active Hotdog through the actual Admin form, then returned to Cashier with stale filters.
- Confirmed new-item visibility, search, cart addition and unit price.
- Confirmed cart preservation and normal filter persistence when no active items were added.
- Checked same-page, storage and tab-visibility refresh paths, inactive hiding and reactivation.
- Checked the current header against the other screens' Manila formatting and exercised its minute callback with a controlled two-minute time advance.
- Confirmed a completed receipt's stored JSON, original date/time, item information and total remained unchanged.
- Found no runtime/console errors or failed HTTP requests.

[Focused results](take-order-focused-validation.json)

Final system-wide integration has not started. Awaiting user approval.
