# @request-suite/request-client-contracts

Canonical contracts shared by the Request Network API clients. The package
houses the OpenAPI specification, metadata, and webhook fixtures that both the
TypeScript and PHP SDKs consume.

This workspace entry keeps the assets versioned in one place so we can split the
SDKs into their own repositories without duplicating specs or fixtures. Clients
will depend on this package via a local path (during monorepo development) or a
Git submodule/git dependency after the split.

## Contents

- `specs/openapi/` – auto-generated REST contract and metadata (fetched from the Request API).
- `specs/webhooks/` – manually curated webhook schema reference.
- `fixtures/webhooks/*.json` – canonical webhook payloads used across SDK test suites.
- `docs/` – release log, update instructions, and parity notes.

## Consumption

- SDK packages import assets via `@request-suite/request-client-contracts/<path>` (e.g., `@request-suite/request-client-contracts/specs/openapi/request-network-openapi.json`).

## Status

- **Phase:** authoritative. SDKs read specs/fixtures directly from this package during build and test phases.
- **Publishing:** no npm/Packagist release planned. The package will remain a Git dependency so repositories can sync contracts without duplicating files.

## Updating the spec

Use the TypeScript client's tooling to refresh the contracts in-place:

```bash
pnpm --filter "./packages/request-api-client" prepare:spec
pnpm --filter "./packages/request-client-contracts" verify
```

`prepare:spec` downloads the latest OpenAPI document into `specs/openapi/`, refreshes metadata, and regenerates the TypeScript/Zod outputs in the client package. Follow with `verify` to sanity-check file sizes and presence before committing updates across both packages.

## Future work

- [ ] Publish webhook fixture guidelines and add validation to ensure both SDKs reference the same payload set.
- [ ] Provide a version manifest so SDKs can pin contract revisions.
- [ ] Document Git submodule workflow for post-split repositories.

See `docs/OVERVIEW.md` for deeper architectural context.
