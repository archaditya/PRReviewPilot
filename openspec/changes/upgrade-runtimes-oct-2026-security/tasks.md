# Tasks

## 1. Node.js Ecosystem Security Updates

- [x] 1.1 Update `apps/api/package.json` engine constraint to `"node": ">=22.23.4"` and `apps/web/package.json` devDependencies to `@types/node": "^22.7.5"`
- [x] 1.2 Update `apps/api/Dockerfile` from `node:20-alpine` to `node:22-alpine` in both `base` and `prod` stages
- [x] 1.3 Update `apps/web/Dockerfile` from `node:20-alpine` to `node:22-alpine` in both `base` and `prod` stages
- [x] 1.4 Test build Node services (`apps/api` and `apps/web`) and verify Node version inside the images reports `v22.23.4` or higher

## 2. Python Ecosystem Security Updates

- [x] 2.1 Update `apps/ai-service/Dockerfile` from `python:3.12-slim` to `python:3.12.15-slim`
- [x] 2.2 Update `apps/indexer-service/Dockerfile` from `python:3.12-slim` to `python:3.12.15-slim`
- [x] 2.3 Pin `certifi>=2026.10.19` in `apps/ai-service/requirements.txt` and `apps/indexer-service/requirements.txt`
- [x] 2.4 Test build Python services and verify `certifi` version reports `>= 2026.10.19` and OpenSSL validation passes

## 3. End-to-End Container Verification

- [x] 3.1 Run compose build on `docker-compose.prod.yml` and verify all images build without layer or caching errors
- [x] 3.2 Smoke test API and Web health endpoints (`/health`) to ensure zero regression in application startup
