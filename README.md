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

- `specs/openapi/` – auto-generated REST contract and metadata (fetched from the Request API).
- `specs/webhooks/` – manually curated webhook schema reference.
- `fixtures/webhooks/*.json` – canonical webhook payloads used across SDK test suites.
- `docs/` – release log, update instructions, and parity notes.

## Consumption

- SDK packages import assets via `@marcohefti/request-network-api-contracts/<path>` (e.g., `@marcohefti/request-network-api-contracts/specs/openapi/request-network-openapi.json`).

## Status

- **Phase:** authoritative. SDKs read specs/fixtures directly from this package during build and test phases.
- **Publishing:** intended primarily as a Git/npm dependency for tooling and tests rather than an end‑user package.

## Updating the spec

Use the TypeScript client's tooling to refresh the contracts in-place. From the TypeScript client repository, run:

```bash
pnpm prepare:spec
```

This downloads the latest OpenAPI document into the contracts package's `specs/openapi/`, refreshes metadata, and regenerates the TypeScript/Zod outputs. Then verify the contracts package:

```bash
cd ../request-network-api-contracts
npm run verify
```

The `verify` script sanity-checks file sizes and presence before committing updates across both packages.

## Future work

- [ ] Publish webhook fixture guidelines and add validation to ensure both SDKs reference the same payload set.
- [ ] Provide a version manifest so SDKs can pin contract revisions.
- [ ] Document Git submodule workflow for post-split repositories.

See `docs/OVERVIEW.md` for deeper architectural context.
