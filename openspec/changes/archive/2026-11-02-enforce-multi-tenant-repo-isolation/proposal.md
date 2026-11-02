# Proposal

## Why

ReviewPilot was designed as an enterprise multi-tenant code review platform, but several critical implementation gaps currently allow total cross-tenant repository leakage:
1. `GET /api/repositories` executes an unfiltered query (`status: 'active'`) whenever `orgId` is omitted, returning every repository in the database across all organizations and users.
2. Direct object endpoints (`GET /:id`, `PATCH /:id/config`, `POST /:id/reindex`, `POST /:id/chat`, `GET /:id/graph`) perform `findByPk(id)` without validating that the authenticated user belongs to the repository's organization (Insecure Direct Object Reference / IDOR).
3. The GitHub App setup redirect (`GET /api/integrations/github/setup`) discards the `state` parameter containing tenant context. When resolving the target organization, it falls back to `db.Organization.findOne({ order: [['createdAt', 'ASC']] })`, dumping new installations and repositories directly into the database's first organization (the admin workspace).
4. The manual sync endpoint (`POST /api/integrations/github/sync`) requests all global installations from GitHub (`GET /app/installations`) rather than installations scoped to the user, re-assigning foreign repositories to the calling user's account.

This change eliminates cross-user repository exposure, enforces fail-closed authorization, and establishes strict tenant isolation across all repository, integration, and review workflows.

## What Changes

- **Strict User-Scoped Organization Filter in `repo.controller.js`**:
  - Dynamically resolve the requesting user's active organization memberships via `OrganizationMember`.
  - Filter `listConnectedRepositories` strictly by `organizationId IN (:allowedOrgIds)`.
  - Reject queries specifying an unauthorized `orgId` with `403 Forbidden`.
- **Fail-Closed Repository Authorization Helper for All `:id` Endpoints**:
  - Implement an authorized repository lookup helper verifying both repository existence and membership in `repo.organizationId`.
  - Guard `getRepositoryDetails`, `updateRepositoryConfig`, `reindexRepository`, `resetIndexRepository`, `chatWithRepo`, and `getGraphOverview`.
- **Fix GitHub App Setup Redirect and Remove First-Org Fallback**:
  - Extract and validate the `state` (organization ID) query parameter on `/api/integrations/github/setup`.
  - Eliminate the dangerous `order: [['createdAt', 'ASC']]` fallback in `githubAppService.syncInstallation`.
  - If no organization matches, isolate repositories into the installing user's personal organization.
- **Scope GitHub App Synchronization**:
  - Restrict `syncAllInstallations` to installations associated with the caller's active organizations.
- **Multi-Tenant Scoping for Reviews**:
  - Update `review.controller.js` (`listReviews` and `getReviewDetails`) to restrict review jobs to repositories belonging to the user's active organizations.

## Capabilities

### New Capabilities
- `repo-isolation`: Enforces absolute multi-tenant repository isolation and object-level access control across all API endpoints, integration callbacks, and review job queries.

### Modified Capabilities
None.

## Impact

- **Affected Files**:
  - `apps/api/src/controllers/repo.controller.js`
  - `apps/api/src/controllers/review.controller.js`
  - `apps/api/src/services/github-app.service.js`
  - `apps/api/src/routes/integration.routes.js`
- **APIs & Data Models**:
  - No database migration or table schema changes required; leverages existing `Organization` and `OrganizationMember` models.
  - Endpoints now return `403 Forbidden` or `404 Not Found` when a user attempts to access an unauthorized repository.
- **User Experience**:
  - Users only see repositories they own or have been granted access to via their organization.
  - Cross-tenant data leaks and unauthorized configuration modifications are completely eliminated.

