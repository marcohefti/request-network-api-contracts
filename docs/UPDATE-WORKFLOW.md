# Contracts Update Workflow

Use this checklist whenever the Request Network API publishes contract changes. The TypeScript client's tooling writes new assets directly into this package. Follow the steps below to keep every SDK in sync.

## 1. Refresh the OpenAPI spec

```bash
pnpm --filter "./packages/request-api-client" prepare:spec
```

`prepare:spec` downloads the latest OpenAPI document into `specs/openapi/` (updating both the JSON and `.meta.json`) and regenerates the TypeScript + Zod outputs referenced by the client.

## 2. Update webhook schema (if needed)

- Manually edit `specs/webhooks/request-network-webhooks.json` when Request publishes new webhook fields or events.
- Keep any breaking changes coordinated across SDKs-update shared enums and validation helpers in the clients immediately after adjusting the schema.

## 3. Sync webhook fixtures

- Add or update payload samples under `fixtures/webhooks/`.
- Ensure each new fixture has corresponding parity tests in every SDK that consumes it.

## 4. Verify assets

```bash
pnpm --filter "./packages/request-client-contracts" verify
```

The verification script asserts that the expected files exist and logs their sizes for a quick sanity check.

## 5. Document and commit

- Record the change in `docs/UPDATES.md` (date, summary, upstream source, required SDK follow-up).
- Commit the updated contracts alongside regenerated client artefacts so downstream packages pick up the change in one review.

Repeat this workflow whenever the upstream API contract or webhook catalogue changes.
