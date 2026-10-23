# Proposal

## Why

On October 20–22, 2026, critical security advisories were published affecting Node.js and Python runtimes, including high-severity Brotli out-of-bounds write remote code execution (`CVE-2026-111497`), DNS truncation (`CVE-2026-105482`), TLS hostname verification bypasses (`CVE-2026-105483`, `CVE-2026-106069`), and compromised intermediate Certificate Authority (eMudhra) chains. 

ReviewPilot currently runs containerized Node.js services on `node:20-alpine`, which is End-of-Life and unpatched against these vulnerabilities. Upgrading to supported and patched runtime baselines (Node.js 22 LTS, Python 3.12.15 with modern CA trust stores) eliminates these critical security risks before deployment to production.

## What Changes

- **Upgrade Node.js Services to Active LTS (Node 22)**:
  - Update `apps/api/Dockerfile` from `node:20-alpine` to `node:22-alpine` (v22.23.4+).
  - Update `apps/web/Dockerfile` from `node:20-alpine` to `node:22-alpine` (v22.23.4+).
  - Update engine requirements in `apps/api/package.json` to `"node": ">=22.23.4"`.
  - Update `@types/node` in `apps/web/package.json` to `^22.7.5`.
- **Harden Python Services Runtime & CA Store**:
  - Update `apps/ai-service/Dockerfile` and `apps/indexer-service/Dockerfile` base image to `python:3.12.15-slim`.
  - Pin `certifi>=2026.10.19` in `apps/ai-service/requirements.txt` and `apps/indexer-service/requirements.txt` to reject compromised intermediate CA certificates.
- **Go Ecosystem Assessment**:
  - Clarify and document that ReviewPilot has no Go runtime execution footprint (`tree-sitter-go` is an AST grammar library compiled in Python, not a Go binary), confirming zero runtime exposure to `CVE-2026-111943`.

## Capabilities

### New Capabilities
- `runtime-security`: Enforces baseline runtime environment versions, TLS certificate validation standards, and dependency vulnerability patching for Node.js and Python microservices.

### Modified Capabilities
None.

## Impact

- **Affected Code & Dockerfiles**:
  - `apps/api/Dockerfile`, `apps/api/package.json`
  - `apps/web/Dockerfile`, `apps/web/package.json`
  - `apps/ai-service/Dockerfile`, `apps/ai-service/requirements.txt`
  - `apps/indexer-service/Dockerfile`, `apps/indexer-service/requirements.txt`
- **APIs & Data Models**: None affected; backwards-compatible runtime upgrade.
- **Deployment**: Production and local Docker images will need rebuilding (`docker compose build --no-cache`).
