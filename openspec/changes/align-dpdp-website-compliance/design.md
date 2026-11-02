# Design: DPDP Website Compliance & Privacy Infrastructure

## Architecture Overview

This design addresses all 8 compliance requirements of the *Rinisha Website Compliance Checklist* within ReviewPilot's existing architecture:
- Next.js 14 App Router frontend (`apps/web`) using ChaiUI / Tailwind styling.
- Express.js API backend (`apps/api`) with Sequelize (PostgreSQL) and Neo4j AST knowledge graph.

```
+---------------------------------------------------------------------------------+
|                               WEB CLIENT (NEXT.JS)                              |
+---------------------------------------------------------------------------------+
|                                                                                 |
|  [ Public Routes ]           [ Legal Pages ]             [ Components ]         |
|  * / (Landing)               * /privacy                  * CookieBanner         |
|  * /login (18+ Consent)      * /terms                    * CookieModal          |
|  * /dashboard/settings       * /grievance                * ComplianceFooter     |
|                                                                                 |
+---------------------------------------+-----------------------------------------+
                                        |
                             REST APIs  | (credentials: 'include')
                                        v
+---------------------------------------------------------------------------------+
|                               BACKEND (EXPRESS)                                 |
+---------------------------------------------------------------------------------+
|                                                                                 |
|  [ Auth & Audit ]                    [ User Privacy Rights ]                    |
|  * Register: saves consent metadata  * GET /api/users/me/export                 |
|    (consentedAt, consentIp, version) * DELETE /api/users/me (Right to Erasure)  |
|                                                                                 |
+---------------------------------------+-----------------------------------------+
                                        |
                       +----------------+----------------+
                       v                                 v
         [ PostgreSQL (Sequelize) ]             [ Neo4j AST Database ]
         * Users, Orgs, Repositories,           * Code knowledge graph nodes
           Installations, Audit Logs              purged on account deletion
```

---

## 1. Database Schema Changes

Extend the `User` model (`apps/api/src/models/user.model.js`) with consent audit columns:

```javascript
// Add to User model definition:
consentedAt: {
  type: DataTypes.DATE,
  allowNull: true,
  comment: 'Timestamp when user accepted Terms & Privacy Policy'
},
consentIp: {
  type: DataTypes.STRING(45),
  allowNull: true,
  comment: 'IP address from which consent was given'
},
termsVersion: {
  type: DataTypes.STRING(20),
  allowNull: true,
  defaultValue: '2026.1',
  comment: 'Version of Terms & Privacy Policy consented to'
},
isOver18: {
  type: DataTypes.BOOLEAN,
  allowNull: false,
  defaultValue: true,
  comment: 'Affirmation that user is at least 18 years old (DPDP s.9)'
}
```

---

## 2. Cookie Banner & State Management

- **Storage**: Store cookie preferences in `localStorage` under key `reviewpilot_cookie_consent`:
  ```typescript
  interface CookiePreferences {
    essential: boolean; // always true
    analytics: boolean;
    functional: boolean;
    updatedAt: string;
  }
  ```
- **UI Architecture**:
  - `apps/web/components/cookie-banner.tsx`: Fixed at viewport bottom with backdrop blur, styled in near-black ChaiUI warmth (`#0c0e12`, `border-white/10`).
  - Contains three balanced action buttons:
    1. `btn-asym` with orange accent: **"Accept All"**
    2. `border-white/10 bg-white/5`: **"Reject Non-Essential"**
    3. `text-xs text-neutral-400 hover:text-white underline`: **"Customize"**
  - Triggered globally from `apps/web/app/layout.tsx`.
  - Footer provides a button to re-open the preferences modal anytime.

---

## 3. Dedicated Legal Pages (ChaiUI Design System)

All pages follow the ChaiUI / ReviewPilot theme:
- Deep near-black background (`#0c0e12`), header glow, Montserrat headlines, monospace code/section labels.
- **`/privacy` (`apps/web/app/privacy/page.tsx`)**:
  - Clear sections: Types of Personal Data Collected, Purposes of Processing, AI Review Processing (AST extraction + LLM token usage), Third-Party Service Providers (GitHub, Bitbucket, Neo4j, OpenAI/Anthropic), Data Retention Policies, Security Safeguards, and Your DPDP Rights.
  - "Last Updated: November 2026".
- **`/terms` (`apps/web/app/terms/page.tsx`)**:
  - Acceptance of Terms, Permitted SaaS Usage, Developer API Keys, Disclaimer on AI Code Review Outputs (advisory only, no warranty for code compilation or security), Limitation of Liability, Account Termination, and Indian Law Governing Jurisdiction.
- **`/grievance` (`apps/web/app/grievance/page.tsx`)**:
  - Designated Grievance Officer details:
    - Officer: Data Protection & Redressal Officer
    - Email: `grievance@reviewpilot.archadi.dev`
    - Organization: Spire Hubs / ReviewPilot
    - Physical Address: India
    - SLA: Acknowledgment within 48 hours, resolution within 30 days (DPDP s.8(9), s.8(10)).

---

## 4. Universal Compliance Footer

Create a shared component `apps/web/components/compliance-footer.tsx` or update existing footers:
- Links:
  - `Privacy Policy` -> `/privacy`
  - `Terms of Service` -> `/terms`
  - `Grievance Officer` -> `/grievance`
  - `Cookie Preferences` -> Opens `CookiePreferencesModal`
- Applied to:
  - Landing page (`apps/web/app/page.tsx`)
  - Login / Register page (`apps/web/app/login/page.tsx`)
  - Dashboard layout (`apps/web/app/dashboard/layout.tsx`)

---

## 5. User Rights: Self-Service Data Export & Account Deletion

### `GET /api/users/me/export`
- Controller: `apps/api/src/controllers/user.controller.js`
- Response: JSON payload including user profile, organization memberships, installations list, connected repository names, review history summaries, and consent audit timestamps. Set header `Content-Disposition: attachment; filename="reviewpilot-user-data.json"`.

### `DELETE /api/users/me`
- Controller: `apps/api/src/controllers/user.controller.js`
- Requires body: `{ confirmationEmail: string, password?: string }`
- Logic:
  1. Verify credentials and ensure `confirmationEmail === user.email`.
  2. If user is sole owner of an organization, remove or cascade organization repositories and clean up Neo4j graph nodes matching `repoId`.
  3. Delete user record and revoke active session cookies.
  4. Return `ApiResponse.success(res, { message: 'Account permanently deleted' })`.
