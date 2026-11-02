# website-compliance Specification

## Purpose

Enforces full legal compliance under the Digital Personal Data Protection Act, 2023 (DPDP Act), DPDP Rules 2025, IT Rules 2011, and CCPA Dark Patterns Guidelines 2023 across ReviewPilot's web pages, registration flows, and user settings.

## Requirements

### Requirement: Mandatory Legal Notice Pages
The system SHALL provide public, unauthenticated routes for Privacy Policy, Terms of Service, and Grievance Officer details.

#### Scenario: User visits Privacy Policy page
- **WHEN** a visitor navigates to `/privacy`
- **THEN** the system renders a readable Privacy Notice detailing data collection types (profile, Git metadata, AST symbols), processing purposes, third-party sub-processors (LLMs, Neo4j, Redis, Git providers), retention periods, and user DPDP rights
- **AND** displays the "Last Updated" timestamp

#### Scenario: User visits Terms of Service page
- **WHEN** a visitor navigates to `/terms`
- **THEN** the system renders Terms of Service covering service description, AI advisory disclaimers, liability limits, account responsibilities, and Indian court governing jurisdiction

#### Scenario: User visits Grievance Officer page
- **WHEN** a visitor navigates to `/grievance`
- **THEN** the system displays the Grievance Officer's full name, designation, official email, postal address, and complaint escalation SLA (48-hour acknowledgment, 30-day resolution)

---

### Requirement: Universal Footer Compliance Links
The system SHALL render links to Privacy Policy, Terms of Service, Grievance Officer, and Cookie Preferences on all public, auth, and dashboard footers.

#### Scenario: User views page footer
- **WHEN** a user or visitor scrolls to the footer of `/`, `/login`, `/dashboard`, or `/docs`
- **THEN** links to `/privacy`, `/terms`, `/grievance`, and a `"Cookie Preferences"` button are visible and accessible

---

### Requirement: Cookie Consent Banner Without Dark Patterns
The system SHALL present a first-visit cookie consent banner offering equal visual prominence to accepting, rejecting, or customizing non-essential cookies.

#### Scenario: First-time visitor lands on website
- **WHEN** a visitor visits any page for the first time without a saved cookie preference
- **THEN** a banner appears offering "Accept All", "Reject Non-Essential", and "Customize"
- **AND** no buttons use deceptive visual cues, hidden contrasts, or pre-selected choices

#### Scenario: Visitor rejects non-essential cookies
- **WHEN** a visitor clicks "Reject Non-Essential"
- **THEN** non-essential tracking and analytics scripts remain disabled
- **AND** the preference is stored in `localStorage` so the banner does not re-appear on refresh

#### Scenario: Visitor modifies cookie preferences later
- **WHEN** a user clicks "Cookie Preferences" in the page footer
- **THEN** a preferences modal opens allowing toggling of analytical and functional cookies

---

### Requirement: Registration Consent and 18+ Age Declaration
The system SHALL require explicit consent to Terms and Privacy Policy and confirmation that the user is at least 18 years old prior to account creation.

#### Scenario: User submits registration form
- **WHEN** a user fills out the registration form on `/login`
- **THEN** the form displays an explicit notice: "By creating an account, you confirm that you are at least 18 years of age and agree to our Terms of Service and Privacy Policy"
- **AND** submitting the registration persists `consentedAt` timestamp, `consentIp`, and `termsVersion` to the database `User` record

---

### Requirement: Self-Service Data Erasure and Export
The system SHALL enable authenticated users to export their personal data and exercise their Right to Erasure directly within their workspace settings.

#### Scenario: User exports personal data
- **WHEN** an authenticated user calls `GET /api/users/me/export`
- **THEN** the system returns a downloadable JSON containing profile details, organization memberships, installations, and audit logs

#### Scenario: User requests account deletion (Right to Erasure)
- **WHEN** an authenticated user submits an account deletion request on `/dashboard/settings` with confirmation
- **THEN** the system permanently removes the user's personal credentials, revokes sessions, cascades deletion of owned organizations and repositories, and wipes corresponding AST graph nodes from Neo4j
