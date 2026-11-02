# Spec Delta

## Purpose

Establishes strict multi-tenant boundaries and object-level access controls so that no user can discover, inspect, configure, or interact with repositories or reviews belonging to another user or organization.

## ADDED Requirements

### Requirement: Scoped Repository Listing
The system SHALL only return repositories belonging to organizations where the authenticated user has an active membership.

#### Scenario: User requests repository list without organization filter
- **WHEN** an authenticated user calls `GET /api/repositories`
- **THEN** the response includes only repositories whose `organizationId` matches one of the user's active organization memberships
- **AND** repositories belonging to other organizations are excluded

#### Scenario: User requests repository list with foreign organization ID
- **WHEN** an authenticated user calls `GET /api/repositories?orgId=<foreign-org-id>`
- **THEN** the system denies access with HTTP 403 Forbidden
- **AND** returns an error indicating the user does not belong to the requested organization

#### Scenario: User with no organization memberships
- **WHEN** an authenticated user with no active organization memberships calls `GET /api/repositories`
- **THEN** the response returns HTTP 200 with an empty list (`repositories: []`)

---

### Requirement: Repository Object-Level Access Control (IDOR Prevention)
The system SHALL prevent any user from reading, configuring, reindexing, or querying repositories they do not have explicit access to.

#### Scenario: Accessing repository details of another user
- **WHEN** an authenticated user calls `GET /api/repositories/:id` for a repository belonging to another organization
- **THEN** the system returns HTTP 404 Not Found or Access Denied
- **AND** leaks no repository metadata, pull requests, review jobs, or findings

#### Scenario: Modifying repository configuration of another user
- **WHEN** an authenticated user calls `PATCH /api/repositories/:id/config` for a foreign repository
- **THEN** the system returns HTTP 404 Not Found or Access Denied
- **AND** the repository configuration and status remain unchanged

#### Scenario: Triggering re-index or AI chat on a foreign repository
- **WHEN** an authenticated user calls `POST /api/repositories/:id/reindex` or `POST /api/repositories/:id/chat` for a foreign repository
- **THEN** the system returns HTTP 404 Not Found or Access Denied
- **AND** no background indexing job is scheduled and no source code is processed

---

### Requirement: Isolated GitHub App Installation and Repository Sync
The system SHALL bind GitHub App installations exclusively to the installing user's organization and prevent syncing foreign installations.

#### Scenario: Handling GitHub App setup callback
- **WHEN** GitHub redirects the user to `/api/integrations/github/setup` with `installation_id` and `state` containing the user's organization ID
- **THEN** the system binds the installation and its repositories specifically to that organization
- **AND** under no circumstances falls back to assigning the installation to an arbitrary or first-created organization in the database

#### Scenario: Manual synchronization of GitHub repositories
- **WHEN** an authenticated user calls `POST /api/integrations/github/sync`
- **THEN** the system synchronizes only repositories from installations owned by the calling user's active organizations
- **AND** does not import or reassign installations from other platform users

---

### Requirement: Scoped Review Job Discovery
The system SHALL restrict review job listings and findings to repositories within the authenticated user's organizations.

#### Scenario: Querying review jobs without repository filter
- **WHEN** an authenticated user calls `GET /api/reviews`
- **THEN** the returned review jobs are filtered exclusively to repositories belonging to the user's active organizations
- **AND** review jobs and code findings from other organizations are never returned

