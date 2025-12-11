# Request Client Contracts Overview

## Purpose

Centralise the Request Network REST contracts and test fixtures in one place so
all language clients stay in sync:

- **OpenAPI spec** - canonical JSON used to generate DTOs, schema validators,
  and parity tests.
- **OpenAPI metadata** - etag/fetched-at/source info to track when the spec
  last changed.
- **Webhook fixtures** - shared payloads for signature verification and event
  parsing tests across SDKs.

Keeping these assets together avoids duplication today and ensures future
standalone repositories (TypeScript, PHP, others) can include the contracts as a
Git dependency.

## Directory Structure

```
packages/request-client-contracts/
├── README.md
├── package.json              # workspace metadata (private)
├── specs/
│   ├── README.md                     # explains generated vs manual assets
│   ├── openapi/
│   │   ├── request-network-openapi.json
│   │   └── request-network-openapi.meta.json
│   └── webhooks/
│       └── request-network-webhooks.json
├── fixtures/
│   └── webhooks/
│       ├── payment-confirmed.json
│       ├── payment-failed.json
│       └── ...
└── docs/
    ├── OVERVIEW.md
    └── UPDATES.md            # release notes + fetch summaries
```

## Consumption Strategy

- **Monorepo:** SDK packages reference files via the workspace package name
  (`@marcohefti/request-network-api-contracts/specs/...`). Build/validation scripts run from
  the monorepo root can read from this package without additional tooling.
- **Post-split:** Each SDK repository will include this repo via Git submodule
  (or shallow git dependency) so the same files are available without copying.
  Documentation here will outline the update workflow.

## Update Workflow

1. Run `pnpm --filter "./packages/request-api-client" prepare:spec` to download the latest OpenAPI spec and metadata into `specs/openapi/` and regenerate the TypeScript/Zod outputs in the client package.
2. Update webhook fixtures in `fixtures/webhooks/` when Request publishes new payloads. Pair every new fixture with test coverage in each SDK.
3. Execute `pnpm --filter "./packages/request-client-contracts" verify` to confirm the expected files are present and within size bounds.
4. Commit the contract changes (`specs/**`, `fixtures/**`, docs) together with any regenerated client artefacts so consumers can diff the update in one review.
5. Append an entry to `docs/UPDATES.md` capturing the date, upstream reference, and required SDK follow-up.

## Related Backlog Tasks

- **Track contract versioning** - provide a manifest so SDKs can pin/compare revisions.
- **Webhook fixture parity automation** - ensure both SDKs validate against the shared payload set.
- **Document submodule workflow** - outline how downstream repositories should consume this package post-split.
