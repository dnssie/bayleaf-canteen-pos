# Admin date-control fix

The existing Phase 5 application was fixed in place. Figma specifies closed controls but has no prototype reactions or expanded picker designs for the affected frames. The original fields' dimensions, calendar icons and styling were retained, with explicit HTML buttons and accessible calendar popovers added.

- Dashboard: single dates, inclusive custom ranges, Today/This week/This month and reset.
- Transactions: single dates/ranges, combined search, All dates and clear/reset.
- Reports: date/week/month selection using the existing period rules; totals and CSV follow the selected period.
- Keyboard: Enter/Space opening, arrow navigation, selection, Escape/Cancel and focus return.
- Placement: fixed body portals with viewport collision handling and internal scrolling.

All three areas and all report variants passed at **1440 × 900**. Closed Figma field bounds were measured. Date-range tests include Asia/Manila midnight boundaries, empty ranges, reversed-range validation and unchanged applied data after cancellation. Trusted mouse clicks cover the visible calendar icon and the complete field, not only programmatic value changes.

Browser runtime/console and HTTP error checks passed. Admin and Cashier regression suites passed. No Cashier source files, backend, database or business policies were changed. Final system-wide integration has not started.

[Fix details and manual test steps](admin-date-controls.md) · [Date-control results](admin-date-validation.json) · [Admin regression](admin-date-admin-regression.json) · [Cashier regression](admin-date-cashier-regression.json)

## Open-picker captures

- [Dashboard](admin-date-screenshots/admin-dates-dashboard-open.png)
- [Transactions / All dates](admin-date-screenshots/admin-dates-transactions-open.png)
- [Daily report](admin-date-screenshots/admin-dates-reports-open.png)
- [Weekly report](admin-date-screenshots/admin-dates-reports-weekly-open.png)
- [Monthly report](admin-date-screenshots/admin-dates-reports-monthly-open.png)
