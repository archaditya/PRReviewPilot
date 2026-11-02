# Design

## Context

ReviewPilot is designed around a multi-tenant relational model in PostgreSQL:
- A `User` has one or more `OrganizationMember` records linking them to `Organization` records.
- Each `Repository` belongs strictly to one `Organization` (`organization_id`).
- Each `ReviewJob` and `PullRequest` belongs to one `Repository`.

However, the repository controller and integration sync endpoints currently query the database without filtering by user organization memberships, causing global repository leaks and allowing users to perform operations on repositories they do not own.

## Goals / Non-Goals

**Goals:**
- Guarantee that no user can see or access repositories belonging to other users or organizations.
- Eliminate IDOR vulnerabilities across all repository routes (`GET`, `PATCH`, `POST`).
- Fix the GitHub App installation flow so installations are deterministically bound to the correct organization using the `state` parameter.
- Remove the insecure fallback (`Organization.findOne({ order: [['createdAt', 'ASC']] })`) that dumps strangers' repositories into the first organization in the database.
- Scope `POST /api/integrations/github/sync` to only sync the calling user's installations.
- Scope `GET /api/reviews` to prevent leaking pull request titles, findings, and review jobs.

**Non-Goals:**
- Building a complex organization switcher UI or team member invitation system at this stage (deferred per user directive: user workspace management will be addressed in a future iteration).
- Changing database schemas or running database migrations; existing relational structures (`Organization`, `OrganizationMember`, `Repository`, `Installation`) are sufficient.

## Decisions

### 1. Centralized Authorization Helper in `repo.controller.js`
- **Decision**: Introduce `getUserOrgIds(userId, requestedOrgId = null)` and `getAuthorizedRepo(repoId, userId)` helpers in `RepoController`.
- **Rationale**: Keeps authorization checks cohesive, uniform, and testable without duplicating raw SQL queries across endpoints. Any attempt to access a non-existent or foreign repository fails closed with a 404/403.
- **Alternatives Considered**:
  - *Route-level middleware for `:id`*: Would require fetching the repo twice (once in middleware, once in controller) or attaching it to `req.repo`. The controller helper keeps method context clear and reuses existing Sequelize include patterns.

### 2. Elimination of First-Organization Fallback in `github-app.service.js`
- **Decision**: Completely delete `db.Organization.findOne({ order: [['createdAt', 'ASC']] })`.
- **Rationale**: A multi-tenant system must fail safe. If an incoming installation cannot be matched to a verified user or organization, it must create a dedicated personal organization or fail, rather than polluting an existing tenant's workspace.

### 3. State Preservation in `/api/integrations/github/install` and `/setup`
- **Decision**: Pass `orgId` via GitHub's `state` parameter during installation initiation, and read `req.query.state` in `/api/integrations/github/setup`.
- **Rationale**: GitHub App installation flow is an asynchronous browser redirect that drops user cookie context if cross-site lax cookie policies apply. The `state` parameter is GitHub's standard, RFC-compliant mechanism to preserve tenant identity through the installation handshake.

### 4. Scoped Sync in `syncAllInstallations`
- **Decision**: Instead of calling `GET /app/installations` (which returns all installations across all GitHub accounts where the app is installed), look up installations in the database where `organization_id IN (:userOrgIds)` and sync only those.
- **Rationale**: Prevents any user from triggering a global re-sync that mutates other tenants' installations.

## Risks / Trade-offs

- **[Existing Misallocated Repositories]** → Repositories that were previously dumped into the first organization during testing will remain in that organization until re-synced or reassigned. Mitigated by isolating all future installations and scoping queries so other users cannot see them.
- **[Direct API access without active session]** → Unauthenticated or expired requests already receive 401; adding membership checks ensures authenticated users cannot escalate privilege across tenants.

## Migration Plan

1. Update `apps/api/src/controllers/repo.controller.js` with `getUserOrgIds` and `getAuthorizedRepo` to scope repository listings and single-repo endpoints.
2. Update `apps/api/src/services/github-app.service.js` to remove the first-org fallback and scope `syncAllInstallations` to user-owned installations.
3. Update `apps/api/src/routes/integration.routes.js` to process `state` in `/github/setup`.
4. Update `apps/api/src/controllers/review.controller.js` to scope `listReviews` and `getReviewDetails` to the user's organizations.
5. Verify multi-tenant isolation with two distinct user sessions.

