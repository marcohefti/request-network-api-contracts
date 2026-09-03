# Request Client Contracts Overview

## Purpose

Centralise the Request Network REST contracts and test fixtures in one place so
all language clients stay in sync:

- **OpenAPI specs** - separate Request API and Auth API JSON used to generate DTOs, schema validators,
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
.
├── README.md
├── package.json              # package metadata
├── specs/
│   ├── README.md                     # explains generated vs manual assets
│   ├── openapi/
│   │   ├── request-network-openapi.json
│   │   ├── request-network-auth-openapi.json
│   │   ├── *.meta.json
│   │   └── manifest.json
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

- **Node / TypeScript SDKs:** Reference files via the published package name
  (`@marcohefti/request-network-api-contracts/specs/...`) in your build and validation scripts.
- **Multi-package workspaces:** When this repo is part of a larger workspace,
  scripts running from the workspace root can still read from the package path above without any special wiring.
- **Other SDKs:** Non-Node clients can vendor the `specs/**` and `fixtures/**`
  directories or use this repository as a Git submodule / subtree so the same
  files are available without copying them by hand.

## Update Workflow

1. Refresh both OpenAPI specs with `npm run sync:openapi` (see
   `docs/UPDATE-WORKFLOW.md`). The contracts repository owns fetch,
   normalization, patch provenance, and release metadata.
2. Update webhook fixtures in `fixtures/webhooks/` when Request publishes new
   payloads. Pair every new fixture with test coverage in each SDK.
3. Run `npm run verify` from this repository to confirm the expected files are
   present and within size bounds.
4. Commit the contract changes (`specs/**`, `fixtures/**`, docs) together with
   any regenerated client artefacts so consumers can diff the update in one
   review.
5. Append an entry to `docs/UPDATES.md` capturing the date, upstream
   reference, and required SDK follow-up.

The package is product-neutral: it contains no connector, WooCommerce, or CamelPay behavior.
