# Request Network API Contracts

Canonical contracts shared by the Request Network API clients. The package
houses the OpenAPI specification, metadata, and webhook fixtures that both the
TypeScript and PHP SDKs consume.

This repository keeps the assets versioned in one place so language SDKs can
reuse them without duplicating specs or fixtures. Clients consume it either
via an npm dependency or as a Git submodule.

## Installation

Install via npm or pnpm:

```bash
# npm
npm install --save-dev @marcohefti/request-network-api-contracts

# pnpm
pnpm add -D @marcohefti/request-network-api-contracts
```

## Contents

- `specs/openapi/` – separate normalized Request API and Auth API contracts, source metadata, and release manifest.
- `specs/webhooks/` – manually curated webhook schema and current/legacy event manifest.
- `fixtures/webhooks/*.json` – canonical webhook payloads used across SDK test suites.
- `docs/` – release log, update instructions, and parity notes.

## Consumption

- SDK packages import assets via `@marcohefti/request-network-api-contracts/<path>` (e.g., `@marcohefti/request-network-api-contracts/specs/openapi/request-network-openapi.json`).

## Status

- **Phase:** authoritative. SDKs read specs/fixtures directly from this package during build and test phases.
- **Publishing:** intended primarily as a Git/npm dependency for tooling and tests rather than an end‑user package.

## Updating the spec

Refresh both upstream documents from this repository:

```bash
npm run sync:openapi
npm run sync:webhooks
npm run verify
```

`sync:openapi` fetches and normalizes the production Request and Auth APIs, applies only documented compatibility patches,
and records raw/normalized hashes. Client code generation remains the responsibility of each client repository.

### Local schema drift patching

See `docs/OPENAPI-0.31.0-AUDIT.md` for the operation inventory and the evidence behind nullable-union, fee-drift,
Secure-Payment-response, and Auth webhook-security patches.

See `docs/OVERVIEW.md` for deeper architectural context.
