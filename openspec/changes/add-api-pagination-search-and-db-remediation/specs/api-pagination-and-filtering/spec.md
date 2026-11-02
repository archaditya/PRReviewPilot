# Spec Delta

## Purpose

Defines standard pagination, multi-field search, attribute filtering, and global response envelope specifications across all API endpoints, alongside database remediation for historical multi-tenant installations.

## ADDED Requirements

### Requirement: Standardized Paginated API Response Envelope
The system SHALL return a consistent response envelope for all paginated GET API endpoints containing data items, pagination metadata, and status.

#### Scenario: Paginated repository query response
- **WHEN** a client calls a paginated GET endpoint (e.g. `GET /api/repositories?page=1&limit=10`)
- **THEN** the response status is HTTP 200
- **AND** the payload contains:
  - `success`: boolean (`true`)
  - `data`: array of matching records
  - `pagination`: object with `page`, `limit`, `total`, `totalPages`, `hasNext`, and `hasPrev`

---

### Requirement: Multi-Field Search in Resource Listings
The system SHALL support keyword search across multiple textual columns using case-insensitive matching.

#### Scenario: Searching repositories by keyword
- **WHEN** an authenticated user calls `GET /api/repositories?search=bot`
- **THEN** the system returns repositories where `name`, `providerFullName`, `description`, or `language` contains the substring `bot` (case-insensitive)
- **AND** respects tenant organization boundaries

#### Scenario: Searching admin users by email or username
- **WHEN** an administrator calls `GET /api/admin/users?search=spire`
- **THEN** the system returns users where `name`, `email`, `githubUsername`, or `bitbucketUsername` contains `spire`

---

### Requirement: Attribute Filtering in GET APIs
The system SHALL allow filtering records by exact attribute values combined with search and pagination.

#### Scenario: Filtering repositories by provider and status
- **WHEN** an authenticated user calls `GET /api/repositories?provider=github&status=active`
- **THEN** only repositories with `provider = 'github'` and `status = 'active'` belonging to the user's organizations are returned

#### Scenario: Filtering review jobs by status and risk level
- **WHEN** an authenticated user calls `GET /api/reviews?status=completed&riskLevel=high`
- **THEN** only review jobs with matching status and risk level are returned

---

### Requirement: Historical Tenant Data Disentanglement
The system SHALL provide an automated remediation utility that untangles mixed installations and reassigns repositories to distinct organizations per GitHub account.

#### Scenario: Remediation of multi-account installation data
- **WHEN** the remediation script is executed against the database
- **THEN** distinct organizations are created or resolved for `archaditya` and `adityaSpire10`
- **AND** `archaditya` installations and repositories are linked exclusively to the `archaditya` organization
- **AND** `adityaSpire10` installations and repositories are linked exclusively to the `adityaSpire10` organization
- **AND** neither user sees the other account's repositories in their dashboard or admin inspection modal
