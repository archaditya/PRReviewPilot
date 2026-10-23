# Spec Delta

## Purpose

Establishes security baselines, supported LTS runtime versions, and certificate authority trust enforcement for backend and web application runtimes.

## ADDED Requirements

### Requirement: Supported Node.js LTS Runtime
The system SHALL run Node.js backend services and web applications on an Active LTS version of Node.js (version 22.23.4 or higher) that patches critical decompression and TLS certificate verification vulnerabilities.

#### Scenario: Production Node API container version verification
- **WHEN** the API container image is inspected or started
- **THEN** the reported Node.js major version is 22 and the patch level is at or above 22.23.4

#### Scenario: Web dashboard container version verification
- **WHEN** the Next.js web application container image is inspected or started
- **THEN** the reported Node.js major version is 22 and the patch level is at or above 22.23.4

### Requirement: Python Runtime and TLS Certificate Store Hardening
The system SHALL execute Python microservices on patched Python 3.12 releases and enforce an updated CA certificate bundle that rejects revoked or compromised intermediate Certificate Authorities.

#### Scenario: Outbound TLS handshake certificate validation
- **WHEN** a Python microservice initiates an HTTPS request to an external provider (GitHub or OpenAI)
- **THEN** the connection succeeds only against valid CA trust chains and explicitly rejects revoked intermediate certificates

#### Scenario: AI and Indexer base runtime validation
- **WHEN** the AI service or Indexer service containers are built and run
- **THEN** the Python runtime version is at least 3.12.15 and the certifi package is version 2026.10.19 or higher
