# Tasks: DPDP Website Compliance & Privacy Infrastructure

## 1. Legal Notice & Policy Pages

- [x] 1.1 Create `apps/web/app/privacy/page.tsx` containing comprehensive DPDP-compliant Privacy Notice (data types, AI AST extraction, LLM processors, retention schedules, user rights, and last updated date).
- [x] 1.2 Create `apps/web/app/terms/page.tsx` detailing Terms of Service, SaaS usage rules, AI code review advisory disclaimers, liability caps, and Indian governing jurisdiction.
- [x] 1.3 Create `apps/web/app/grievance/page.tsx` displaying Grievance Officer designation, official email (`grievance@reviewpilot.archadi.dev`), physical address, and 48-hr acknowledgment / 30-day resolution SLA.

## 2. Universal Footer Compliance Links

- [x] 2.1 Update `apps/web/app/page.tsx` footer to include links to `/privacy`, `/terms`, `/grievance`, and "Cookie Preferences".
- [x] 2.2 Update `apps/web/app/login/page.tsx` footer with legal policy links.
- [x] 2.3 Update `apps/web/app/dashboard/layout.tsx` (or sidebar footer) with compliance links and cookie preferences.

## 3. Cookie Consent Banner & Preferences Controller

- [x] 3.1 Create `apps/web/components/cookie-banner.tsx` with non-dark-pattern visual balance (`Accept All`, `Reject Non-Essential`, `Customize`) and `localStorage` persistence.
- [x] 3.2 Create `apps/web/components/cookie-modal.tsx` to allow visitors to toggle analytical and functional cookie categories.
- [x] 3.3 Mount `CookieBanner` globally in `apps/web/app/layout.tsx`.

## 4. Registration Consent & 18+ Affirmation

- [x] 4.1 Update `apps/web/app/login/page.tsx` (Register tab) to include an explicit 18+ age affirmation and legal notice linking to `/terms` and `/privacy`.
- [x] 4.2 In `apps/api/src/models/user.model.js`, add `consentedAt`, `consentIp`, `termsVersion`, and `isOver18` attributes.
- [x] 4.3 In `apps/api/src/controllers/auth.controller.js`, capture client IP, timestamp, and version during user registration and save to database.

## 5. Self-Service User Privacy Rights (Export & Erasure)

- [x] 5.1 In `apps/api/src/controllers/user.controller.js` (and `apps/api/src/routes/user.routes.js`), implement `GET /api/users/me/export` returning the user's downloadable personal data JSON.
- [x] 5.2 In `apps/api/src/controllers/user.controller.js`, implement `DELETE /api/users/me` (Right to Erasure) verifying confirmation email/password and cascading deletion across DB and Neo4j.
- [x] 5.3 In `apps/web/app/dashboard/settings/page.tsx`, add a "Data Privacy & Governance" section with "Export Personal Data" and "Delete My Account" controls.

## 6. Verification & Quality Review

- [x] 6.1 Verify that `/privacy`, `/terms`, and `/grievance` render cleanly on desktop and mobile matching the ChaiUI aesthetic.
- [x] 6.2 Verify that the Cookie Banner appears on clean browser session, correctly stores preferences upon action, and does not flash on reload.
- [x] 6.3 Verify registration persists `consentedAt` and `consentIp` in PostgreSQL.
- [x] 6.4 Verify self-service data export generates valid JSON and account deletion properly removes data.
