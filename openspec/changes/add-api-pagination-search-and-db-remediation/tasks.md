# Tasks

## 1. Shared Utilities: Global Response Handler & Query Parser

- [x] 1.1 Create `apps/api/src/utils/api-response.js` providing `ApiResponse.success`, `ApiResponse.paginated`, and `ApiResponse.error` with standard metadata.
- [x] 1.2 Create `apps/api/src/utils/query-parser.js` to extract `page`, `limit`, `offset` and build dynamic `Op.iLike` search clauses.

## 2. Database Remediation Script

- [x] 2.1 Create `apps/api/src/scripts/remediate-org-repos.js` that scans all installations, resolves distinct organizations per GitHub account (`archaditya` vs `adityaSpire10`), and updates `organization_id` on installations and repositories.
- [x] 2.2 Execute remediation script and verify that `archaditya` repos and `adityaSpire10` repos reside in separate organizations in PostgreSQL.

## 3. Backend Controllers Upgrade (Pagination, Search & Filtering)

- [x] 3.1 In `apps/api/src/controllers/repo.controller.js`, update `listConnectedRepositories` to use `findAndCountAll` with `search`, `provider`, `status`, `indexStatus`, and `ApiResponse.paginated`.
- [x] 3.2 In `apps/api/src/controllers/review.controller.js`, update `listReviews` to support pagination, search (PR title/author/repo), and status/risk filters.
- [x] 3.3 In `apps/api/src/controllers/admin.controller.js`, update `listUsersWithUsage` with pagination, search, and role/status filtering.
- [x] 3.4 In `apps/api/src/controllers/admin.controller.js`, update `getJobsAudit` with pagination and search.
- [x] 3.5 In `apps/api/src/controllers/admin.controller.js`, update `getUserDetails` to support paginated repository listing.

## 4. Frontend UI Controls (Search, Filters & Pagination)

- [x] 4.1 In `apps/web/app/dashboard/repositories/page.tsx`, add search input, provider/status filter selects, and pagination bar (`Previous`, `Page X of Y`, `Next`).
- [x] 4.2 In `apps/web/app/dashboard/admin/page.tsx`, add search input and pagination controls inside the User Details inspection modal (Connected Repos tab).

## 5. Verification & Testing

- [x] 5.1 Verify that User B (`adityaSpire10`) only sees their 3 repos in both the Repositories page and Admin modal.
- [x] 5.2 Verify that search query `?search=bot` returns only matching repositories.
- [x] 5.3 Verify that pagination controls correctly transition pages and calculate `total` / `totalPages`.
