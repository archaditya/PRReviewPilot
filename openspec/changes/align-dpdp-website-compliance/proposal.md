# Proposal: Align ReviewPilot with DPDP 2023 & Indian Website Compliance Guidelines

## Why

Under India's **Digital Personal Data Protection Act, 2023 (DPDP Act)**, **DPDP Rules 2025**, **IT Rules 2011**, **Consumer Protection Rules 2020**, and **CERT-In Directions 2022**, any online business collecting personal data (names, emails, IP addresses, tracking tags, and code tokens) must implement transparent privacy notices, explicit informed consent, grievance redressal mechanisms, cookie preferences without dark patterns, children's data safeguards (18+), and user data erasure rights, backed by penalties up to ₹250 crore.

An audit of the ReviewPilot codebase against the *Rinisha Website Compliance Checklist (India 2026)* revealed critical compliance gaps:
1. Missing legal pages (`/privacy`, `/terms`, `/grievance`).
2. Footers on landing, auth, and dashboard pages lack mandatory compliance links.
3. Registration form lacks explicit terms/privacy notice and age declaration (18+).
4. No cookie consent banner or tracking opt-out mechanism.
5. Missing consent audit trail (`consentedAt`, `consentIp`, `termsVersion`) in the database.
6. No self-service user rights mechanism (Data Export / Right to Erasure) in workspace settings.

## What Changes

1. **Mandatory Legal & Compliance Routes**:
   - Create `/privacy` (Privacy Notice detailing data collected, LLM processors, AST caching, retention schedules, and grievance contacts).
   - Create `/terms` (Terms of Service covering automated code review liability limits, token quotas, and Indian court jurisdiction).
   - Create `/grievance` (Publishing the Grievance Officer's name, email, official designation, and 48-hour SLA).
2. **Universal Footer & Navigation Integration**:
   - Update landing page (`/`), login/auth (`/login`), and dashboard layout footers with links to Privacy Policy, Terms, Grievance, and Cookie Preferences.
3. **Cookie Consent Banner (No Dark Patterns)**:
   - Floating cookie banner on first visit with equal prominence for `Accept All`, `Reject Non-Essential`, and `Customize`.
   - Cookie preference persistence in `localStorage`.
   - "Cookie Preferences" modal triggered from any page footer.
4. **Registration Consent & 18+ Verification**:
   - Un-ticked, explicit consent notice on `/login` (Register tab) linking to `/terms` and `/privacy`.
   - Declaration confirming the user is at least 18 years of age.
   - Database migration and backend audit logging storing `consentedAt`, `consentIp`, and `termsVersion` in `User`.
5. **Self-Service User Privacy Rights (DPDP s.11–14)**:
   - "Data Privacy & Governance" section in `/dashboard/settings`.
   - **Download Personal Data**: `GET /api/users/me/export` delivering an immutable JSON export of the user's profile, organizations, and review history.
   - **Delete Account (Right to Erasure)**: `DELETE /api/users/me` with password/email confirmation that purges personal data, revokes tokens, and wipes user organizations and repositories.

## Capabilities Affected

- `website-compliance`: New capability covering legal notices, grievance redressal, cookie consent banners, and age verification.
- `user-auth`: Updated to capture consent metadata and age confirmation upon registration.
- `user-settings`: Extended with self-service data export and account erasure endpoints.

## Out of Scope

- Integrating external legal CRM or third-party cookie consent platforms (e.g. OneTrust / CookieBot); a lightweight, zero-dependency, ChaiUI-styled banner is implemented directly.
- Children's verifiable parental consent workflows (ReviewPilot is strictly a B2B developer tool requiring 18+).

## Risks & Mitigations

- **Risk**: User accidentally deletes account and loses active PR reviews.
  - **Mitigation**: Require explicit email confirmation and password verification before executing account erasure, with cascade cleanup in PostgreSQL and Neo4j.
- **Risk**: Cookie banner obstructs mobile or terminal preview screens.
  - **Mitigation**: Style with compact ChaiUI responsive components and dismiss immediately upon choice.
