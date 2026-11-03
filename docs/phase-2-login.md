# Phase 2 — Shared Login Interfaces

> Archive update — 4 November 2026: This is a historical phase report. Preview paths mentioned below now refer to [the external preview archive](<../../Bayleaf POS preview archive 2026-11-04/>), not active application files. Start the working application at [index.html](../index.html). The original version of this report is preserved in [the archive documentation snapshot](<../../Bayleaf POS preview archive 2026-11-04/_archive-records/documentation-before-archive/docs/phase-2-login.md>).

## Preview

Open login/index.html with VS Code Live Server or directly in a browser. It links to both roles and all four static validation previews per role. Default pages: cashier/login.html and admin/login.html. State previews: login/states/{role}-{state}.html.

At a 1440 × 900 viewport, the branding panel is 660px wide and the form is 400px wide at x=850, y=220. The original login-size logo is reused without resizing its SVG. Shared tokens, font, input styling, and buttons come from Phase 1. Role-specific colors and spacing are scoped in login/styles.css; no shared CSS was changed.

## Demo credentials

| Role | Username | Password |
| --- | --- | --- |
| Cashier | mia.santos | BayleafDemo1! |
| Admin | ana.reyes | BayleafDemo1! |

These values are intentionally public. Validation compares them locally in login/script.js. It makes no network request, stores nothing, and creates no authenticated session. Success displays a demo confirmation and an optional link to the existing layout preview.

## Test cases (both roles)

- Incorrect Username: unknown username + BayleafDemo1!
- Incorrect Password: selected role's listed username + any incorrect password.
- Invalid Credentials: unknown username + incorrect password.
- Empty Fields: either or both fields blank; whitespace-only usernames also count as blank.
- Success: selected role's listed username + BayleafDemo1!.
- Change a field after an error: clears the previous feedback.
- Switch role: opens that role's default page with blank fields.
- Eye button: toggles password visibility and its accessible label.

Static error pages intentionally reproduce Figma's illustrative field values, including unknown.cashier / unknown.admin. These fixture passwords are not demo credentials. Field-specific errors use a 16px message; combined errors use a 20px feedback row. The username error keeps 24px action padding; password and combined errors use 16px, matching Figma.

## Without JavaScript

The complete markup and static feedback are in each HTML file. Role and state navigation uses ordinary links. Password visibility and live validation require JavaScript. Form inputs deliberately have no name attributes: a native submit sends no entered values and navigates to the on-page demo explanation. No sign-in is implied.

## Scope

Delivered: both login roles, eight static error previews, a review index, isolated CSS and script.js, original login logo, accessible labels/feedback and keyboard role navigation.

Phase 3 ordering and other POS workflows have not started. Existing Phase 1 presentation files are unchanged except for the login review links in the gallery.

## Verification

Passed at 1440 × 900: 10 static previews; all 10 without JavaScript; seven simulated validation cases per role; role navigation; password visibility; 11 review links; direct file preview; no credentials serialized by native form submission; no browser exceptions or failed requests. Original SVG dimensions and state-specific form/button geometry were checked. SHA-256 checks confirm all shared Phase 1 CSS, script.js, and application layout previews remain unchanged. Full measurements are in phase-2-validation.json.
