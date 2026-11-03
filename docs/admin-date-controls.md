# Admin date controls correction

The existing Phase 5 application was repaired in place. This change is limited to Admin date selection and filtering. Final system-wide integration has not started.

## Cause and Figma reference

The previous calendar fields used transparent native date inputs covering the visible labels. The click handler returned when the input itself was clicked, so the field often never called `showPicker()`. The prior tests set input values directly and did not verify the calendar-opening interaction.

The Dashboard (2004:32862), Transactions (2004:34026), Daily report (2004:34238), Weekly report (2004:34350), and Monthly report (2004:34485) frames were inspected again. They show the closed date/period controls. Read-only inspection found no prototype reactions on these frames or their descendants, and no expanded date-picker frames in the Admin page. A minimal accessible picker was therefore implemented using existing colors, typography, radii and original calendar/close icons. The closed fields retain their Figma sizes and positions.

## Working behavior

- **Dashboard:** click the date field to choose a single date or inclusive date range. Today, This week and This month presets remain available. A custom selection updates sales, transaction count, average, the overview and recent receipts. Reset to today clears a custom selection. The existing period dropdown remains functional.
- **Transactions:** the All dates/calendar control opens a real calendar. Choose a single day, a start/end range, or Today/This week/This month/All dates. Date filtering combines with search. The picker’s All dates action clears only the date selection; the existing Clear filters control clears both search and dates. Date/range/All dates context is retained when returning from transaction details.
- **Daily Sales Report:** choose a specific reporting day, or reset to today.
- **Weekly Sales Report:** choose any day in the desired reporting week. The existing Sunday–Saturday grouping is highlighted and preserved. Reset to this week returns to the current week.
- **Monthly Sales Report:** choose a month/year, or reset to this month. The existing monthly chart groupings remain unchanged.
- Reports and CSV export use the selected report period. No new monetary or accounting rules were added.

Dates remain inclusive calendar dates in **Asia/Manila**. A payment at 15:59 UTC belongs to that Manila date; a payment at 16:00 UTC belongs to the following Manila date. Saved Cashier receipt amounts remain authoritative for the current mock frontend; date selection does not modify receipts, menu items, bundle prices or the demonstration discount.

## Accessibility and positioning

The trigger is an actual HTML button with an accessible selection label, `aria-expanded`, `aria-controls` and `aria-haspopup="dialog"`. The popover is appended directly to `document.body`, uses fixed positioning and collision handling, and scrolls internally when the viewport is too short. It cannot be clipped by the workspace or table containers.

- Enter/Space activate native buttons; Arrow Down also opens the trigger.
- Day-grid arrows move one day or week; Home/End move within the week; Page Up/Down change month (with Shift, year). Enter selects a focused day.
- Month-grid arrows move between months; Page Up/Down change year; Enter selects while retaining focus.
- Tab reaches fields and actions. Escape, Close and Cancel dismiss without applying draft changes and return focus to the trigger. Clicking or focusing outside dismisses without changing the filter.
- Invalid dates and reversed ranges show accessible validation feedback and leave the applied filter unchanged.

## Files and backend handoff

- `admin/dates/script.js` and `admin/dates/styles.css`: shared calendar UI and positioning.
- The five affected Admin HTML files: real date buttons plus the optional shared script/styles. Hidden native inputs remain as controller state; they no longer intercept clicks.
- `admin/script.js`: connects selections, presets and resets to the existing views and preserves selection context in detail navigation.
- `admin/data/script.js`: existing report operation accepts an optional frontend custom range for Dashboard filtering. Existing Daily/Weekly/Monthly behavior is unchanged.

These are internal frontend selection/view objects, not proposed HTTP endpoints, backend payloads or database schemas. The backend team still owns agreed authentication, durable persistence, authoritative validation and final reporting policies. The browser-only simulation and existing Figma demonstration discount remain unchanged. No Cashier source files were modified for this fix.

## Verification and manual testing

The new tests use trusted browser mouse events to click the actual visible date buttons, and keyboard events to open/select/close calendars. They cover all three affected areas (including all report variants) at 1440 × 900, plus reduced-height collision/scroll behavior. Test records are isolated from the user's normal browser data.

1. Sign in as Admin using the existing demo login and click the Dashboard date field. Select a day and Apply. Reopen, select Date range, choose both dates and Apply. Verify totals and reset to today.
2. Open Transactions, clear filters to All dates, and click its calendar field. Choose a range; combine it with a search. Use All dates or Clear filters to reset.
3. Open each Sales Report tab. Click the period field, select a date/week/month and Apply. Check totals and Export CSV. Reset to the current period.
4. Use Tab to reach a date button and press Enter or Space. Move through the calendar with arrows, select with Enter, and dismiss with Escape. Verify focus returns to the date button.

Evidence is saved in `docs/admin-date-validation.json` and the related regression reports. Screenshots show each open calendar. Browser checks include runtime/console errors and failed asset requests. The earlier Phase 5 date-value tests are supplemented by actual opening and keyboard tests.

The implementation remains an interactive local-data frontend. No backend or final integration was started.
