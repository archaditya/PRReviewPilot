# Tasks

## 1. Repository Access Control & Multi-Tenant Scoping

- [x] 1.1 In `apps/api/src/controllers/repo.controller.js`, add `getUserOrgIds(userId, requestedOrgId)` to resolve active organization memberships and reject foreign `orgId` parameters with 403.
- [x] 1.2 In `apps/api/src/controllers/repo.controller.js`, add `getAuthorizedRepo(repoId, userId)` helper that verifies the repository belongs to one of the user's active organizations.
- [x] 1.3 Update `listConnectedRepositories` in `apps/api/src/controllers/repo.controller.js` to enforce `organizationId: { [Op.in]: allowedOrgIds }`.
- [x] 1.4 Update all single-repository endpoints in `apps/api/src/controllers/repo.controller.js` (`getRepositoryDetails`, `updateRepositoryConfig`, `reindexRepository`, `resetIndexRepository`, `chatWithRepo`, `getGraphOverview`) to use `getAuthorizedRepo`, returning 404/Access Denied on unauthorized access.

## 2. GitHub App Integration & Callback Scoping

- [x] 2.1 Update `GET /api/integrations/github/setup` in `apps/api/src/routes/integration.routes.js` to extract `state: orgId` and pass it to `syncInstallation`.
- [x] 2.2 In `apps/api/src/services/github-app.service.js`, completely remove the `db.Organization.findOne({ order: [['createdAt', 'ASC']] })` fallback.
- [x] 2.3 In `apps/api/src/services/github-app.service.js`, update `syncInstallation` to bind newly installed organizations/repositories to the verified `orgId` / installing user's personal organization.
- [x] 2.4 In `apps/api/src/services/github-app.service.js`, refactor `syncAllInstallations` to only sync installations belonging to the calling user's active organizations rather than all global app installations.

## 3. Review Jobs & Findings Multi-Tenant Scoping

- [x] 3.1 In `apps/api/src/controllers/review.controller.js`, update `listReviews` to join and filter `Repository` by `organizationId IN (:allowedOrgIds)`.
- [x] 3.2 In `apps/api/src/controllers/review.controller.js`, update `getReviewDetails` to ensure the review job's repository belongs to the user's active organizations before returning findings.

## 4. Multi-Tenant Verification & Security Testing

- [x] 4.1 Verify with two separate user accounts: User B calling `GET /api/repositories` sees zero repositories owned by User A.
- [x] 4.2 Verify IDOR protection: User B calling `GET /api/repositories/<user-A-repo-id>` receives 404 / Access Denied.
- [x] 4.3 Verify config protection: User B calling `PATCH /api/repositories/<user-A-repo-id>/config` receives 404 / Access Denied and config is untouched.
- [x] 4.4 Verify review isolation: User B calling `GET /api/reviews` receives only their own reviews.

