# Design

## Context

ReviewPilot consists of two Node.js microservices (`apps/api` and `apps/web`) and two Python microservices (`apps/ai-service` and `apps/indexer-service`). Currently, both Node.js services build on `node:20-alpine` (an EOL release line for the October 2026 security batch), and the Python services use floating `python:3.12-slim` without pinned CA certificate updates for recently revoked intermediate CAs. See `proposal.md` for background and vulnerability analysis.

## Goals / Non-Goals

**Goals:**
- Upgrade Node.js runtime images to Active LTS Node.js 22 (`node:22-alpine` / v22.23.4+).
- Pin Python base image to `python:3.12.15-slim` across `apps/ai-service` and `apps/indexer-service`.
- Ensure certificate authority trust stores in Python enforce `certifi>=2026.10.19`.
- Maintain 100% backward compatibility for all API endpoints, database operations (Postgres/Neo4j), and web client rendering.
- Preserve multi-stage Docker build optimizations and non-root execution permissions across all Dockerfiles.

**Non-Goals:**
- Upgrading to bleeding-edge Node.js 26 Current (LTS 22 is preferred for stability).
- Migrating framework versions (Next.js 14 and Express remain intact).
- Modifying Go components (ReviewPilot has no compiled Go binaries; tree-sitter-go is purely an AST library).

## Decisions

### 1. Target Node.js 22 LTS instead of Node.js 24 LTS or 26 Current
- **Rationale**: Node.js 22 is the active long-term support release with verified compatibility with Next.js 14.2, Express 4.19, Sequelize 6, and existing TypeScript 5 setup. Node.js 22.23.4 includes all patches for `CVE-2026-111497`, `CVE-2026-105482`, and TLS verification issues.
- **Alternatives considered**:
  - *Node.js 26 Current*: Too volatile for production enterprise backend; fast-moving deprecations could impact native dependencies.
  - *Stay on Node.js 20*: Unacceptable due to unpatched remote code execution vulnerabilities in Brotli and DNS parsing.

### 2. Pin `python:3.12.15-slim` and `certifi>=2026.10.19`
- **Rationale**: Python 3.12.15 addresses `CVE-2026-19553` in `wrap_bio` and `asyncio`. Pinned `certifi>=2026.10.19` guarantees that outbound requests through `httpx` (in indexer) and `openai` (in ai-service) fail closed if negotiating against the revoked eMudhra intermediate CA keys.
- **Alternatives considered**:
  - *Upgrade to Python 3.13*: Unnecessary complexity; third-party C-extensions like `tree-sitter` and `neo4j` may have wheel compilation friction.

### 3. Update `@types/node` and package `engines`
- **Rationale**: Keeps IDE, build-time type checkers, and runtime package managers aligned with Node 22 API signatures and capabilities.

## Risks / Trade-offs

- **[Alpine OpenSSL / Musl behavior differences in Node 22]** → Both `apps/api` and `apps/web` use pure JS / standard libraries, and Alpine builds run standard Node LTS distributions. Validated via local container smoke tests.
- **[Next.js standalone build output structure]** → `apps/web/Dockerfile` uses Next.js standalone mode. Next.js 14.2 standalone output runs cleanly under Node 22 without modification.
- **[Docker cache invalidation]** → Upgrading base images invalidates layer caches; mitigated by rebuilding with `--no-cache` and verifying container healthchecks pass.

## Migration Plan

1. Update `apps/api/package.json` (`engines`) and `apps/web/package.json` (`@types/node`).
2. Update base image tags in `apps/api/Dockerfile`, `apps/web/Dockerfile`, `apps/ai-service/Dockerfile`, and `apps/indexer-service/Dockerfile`.
3. Add `certifi>=2026.10.19` to `apps/ai-service/requirements.txt` and `apps/indexer-service/requirements.txt`.
4. Run `docker compose -f docker-compose.prod.yml build --no-cache` to produce patched production containers.
5. Execute verification commands checking runtime versions and healthcheck endpoints.
