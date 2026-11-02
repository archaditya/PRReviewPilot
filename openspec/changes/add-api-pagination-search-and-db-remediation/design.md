# Design

## Context

ReviewPilot displays connected repositories, review jobs, and admin telemetry across multiple views in the web dashboard. Currently, all listing endpoints query the database without pagination, search, or structured filtering, resulting in flat lists that degrade performance as repositories grow. In addition, historical testing before the tenant-isolation fix caused multiple GitHub accounts (`archaditya` and `adityaSpire10`) to have their installations merged into a single database organization, causing both sets of repositories to display under `Spire Adi`.

## Goals / Non-Goals

**Goals:**
- Implement a reusable global response handler (`apps/api/src/utils/api-response.js`) and query parser (`apps/api/src/utils/query-parser.js`).
- Add server-side pagination (`page`, `limit`), multi-field case-insensitive search (`Op.iLike`), and attribute filters across `repositories`, `reviews`, `admin/users`, and `admin/jobs` APIs.
- Provide a database remediation script to untangle historical repositories and installations, moving each account's assets into its own dedicated organization.
- Add search bars, filter dropdowns, and pagination controls to the Repositories page and Admin inspection modal.

**Non-Goals:**
- Rewriting full-text search engines with Elasticsearch or Algolia; PostgreSQL `Op.iLike` is optimal and performant for this scale.
- Breaking existing frontend components; responses will retain compatibility keys (`repositories: [...]`, `users: [...]`) alongside the standard `data: [...]` and `pagination: {...}` envelope.

## Decisions

### 1. Unified Response Envelope with Backward Compatibility
- **Decision**: The `ApiResponse.paginated` helper will output:
  ```json
  {
    "success": true,
    "message": "...",
    "data": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 11,
      "totalPages": 2,
      "hasNext": true,
      "hasPrev": false
    },
    "<resourceKey>": [...]
  }
  ```
- **Rationale**: Adding `<resourceKey>` (e.g. `repositories`) alongside `data` guarantees that existing frontend code expecting `data.repositories` continues to function seamlessly while new paginated components consume `data` and `pagination`.

### 2. Multi-Field Search via Sequelize `Op.iLike`
- **Decision**: In `query-parser.js`, build search filters dynamically:
  ```javascript
  const searchClause = {
    [Op.or]: [
      { name: { [Op.iLike]: `%${search}%` } },
      { providerFullName: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } },
      { language: { [Op.iLike]: `%${search}%` } },
    ],
  };
  ```
- **Rationale**: Provides instant, case-insensitive substring search matching across repo names, full paths (e.g. `archaditya/Verkin`), and programming languages without requiring extra indexing infrastructure.

### 3. Data Remediation Strategy
- **Decision**: The script `apps/api/src/scripts/remediate-org-repos.js` will:
  1. Inspect every `Installation` where `account_login` differs from the organization owner's username or where multiple installations share one organization.
  2. For each unique `account_login` (e.g., `archaditya`, `adityaSpire10`), find or create a dedicated `Organization` matching that account.
  3. Re-link the `Installation.organizationId` and all associated `Repository.organizationId` records to that dedicated organization.
  4. Ensure any matching `User` is added as `owner` to their respective organization.

## Risks / Trade-offs

- **[Performance on Large Tables]** → `count()` in `findAndCountAll` can be slow on millions of records; for current tenant repository counts (tens to hundreds), `findAndCountAll` with indexed foreign keys executes in under 5ms.
- **[Client State Sync during Pagination]** → Filter changes must reset `page` to 1 to prevent requesting an empty out-of-range page.

## Migration Plan

1. Create `api-response.js` and `query-parser.js` in `apps/api/src/utils/`.
2. Implement and test `remediate-org-repos.js` script to cleanly separate contaminated database rows.
3. Update `repo.controller.js`, `review.controller.js`, and `admin.controller.js` to use `findAndCountAll` with search and filters.
4. Update `apps/web/app/dashboard/repositories/page.tsx` and `admin/page.tsx` with search input, filter selects, and pagination footer.
5. Verify end-to-end pagination, search, and isolation across User and Admin views.
