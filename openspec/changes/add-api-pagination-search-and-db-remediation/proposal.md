# Proposal

## Why

Two critical architectural and operational problems currently affect ReviewPilot:
1. **Historical Database Contamination**: Prior to the authorization fix, incoming GitHub App installations and sync events fell back to the first organization in the database (`Spire Adi's Workspace`). Consequently, 8 repositories from GitHub account `archaditya` and 3 repositories from GitHub account `adityaSpire10` are saved in PostgreSQL under the same organization ID. Both accounts' repositories appear mixed together under a single user in the User dashboard and in the Admin inspection modal.
2. **Absence of Pagination, Search, and Filtering**: All primary resource listing endpoints (`GET /api/repositories`, `GET /api/reviews`, `GET /api/admin/users`, `GET /api/admin/jobs`, `GET /api/admin/users/:id/details`) fetch flat, unpaginated arrays or rely on hardcoded limits without returning pagination metadata (`page`, `limit`, `total`, `totalPages`, `hasNext`, `hasPrev`). Neither users nor administrators can search resources by keywords or filter by status, provider, or language.
3. **Inconsistent Response Envelopes**: Controllers return varying JSON shapes (`{ success: true, repositories: [...] }`, `{ success: true, users: [...] }`, `{ data: [...] }`), lacking a unified global API response standard.

## What Changes

- **Database Remediation Script (`apps/api/src/scripts/remediate-org-repos.js`)**:
  - Scan all existing `Installation` and `Repository` records.
  - Separate distinct GitHub accounts (`archaditya` vs `adityaSpire10`) into their own dedicated organizations.
  - Reassign the `organization_id` on each `Installation` and `Repository` to its true owning organization, restoring physical isolation in PostgreSQL.
- **Global API Response Handler (`apps/api/src/utils/api-response.js`)**:
  - Implement a standardized response utility providing `ApiResponse.success`, `ApiResponse.paginated`, and `ApiResponse.error`.
- **Query Parser Utility (`apps/api/src/utils/query-parser.js`)**:
  - Extract and validate pagination parameters (`page`, `limit`, `offset`) with sensible defaults and maximum bounds.
  - Construct dynamic multi-field case-insensitive search clauses (`Op.iLike`) and filter conditions.
- **Backend GET Endpoints Upgraded**:
  - `GET /api/repositories`: Paginated with multi-field search (`name`, `providerFullName`, `description`, `language`) and filters (`provider`, `status`, `indexStatus`).
  - `GET /api/reviews`: Paginated with search (PR title, author, repo) and filters (`status`, `riskLevel`).
  - `GET /api/admin/users`: Paginated with search (name, email, githubUsername) and filters (`role`, `status`).
  - `GET /api/admin/jobs`: Paginated with search and filters (`status`, `riskLevel`).
  - `GET /api/admin/users/:id/details`: Paginated connected repository listing in the inspection modal.
- **Frontend UI Controls**:
  - Add search input, filter dropdowns, and pagination footer controls in `apps/web/app/dashboard/repositories/page.tsx`.
  - Add pagination and search to the Connected Repos tab in the Admin inspection modal (`apps/web/app/dashboard/admin/page.tsx`).

## Capabilities

### New Capabilities
- `api-pagination-and-filtering`: Standardized pagination envelopes, multi-field text search, and dynamic attribute filtering across all core listing endpoints.
- `data-remediation`: One-time executable script to untangle historical cross-tenant database records and bind repositories to separate isolated organizations.

### Modified Capabilities
None.

## Impact

- **Affected Files**:
  - `apps/api/src/utils/api-response.js` (new)
  - `apps/api/src/utils/query-parser.js` (new)
  - `apps/api/src/scripts/remediate-org-repos.js` (new)
  - `apps/api/src/controllers/repo.controller.js`
  - `apps/api/src/controllers/review.controller.js`
  - `apps/api/src/controllers/admin.controller.js`
  - `apps/web/app/dashboard/repositories/page.tsx`
  - `apps/web/app/dashboard/admin/page.tsx`
- **Data & Migration**:
  - Remediation script cleanly separates historical records in PostgreSQL without data loss.
  - APIs maintain backwards compatibility by providing both top-level arrays and standardized paginated envelopes.
