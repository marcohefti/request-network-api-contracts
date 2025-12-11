# Contracts Update Workflow

Use this checklist whenever the Request Network API publishes contract changes. The TypeScript client's tooling writes new assets directly into this package. Follow the steps below to keep every SDK in sync.

## 1. Refresh the OpenAPI spec

- If you maintain the official TypeScript client alongside this package, run its
  `pnpm run prepare:spec` task to download the latest OpenAPI document and
  regenerate the generated types. That tooling is responsible for writing
  `specs/openapi/request-network-openapi.json` and the corresponding
  `.meta.json` file into this package.
- If you are only using this repository, fetch the OpenAPI document directly
  from the upstream Request API (`https://api.request.network/open-api/openapi.json`)
  and update both the JSON and `.meta.json` files under `specs/openapi/`.

## 2. Update webhook schema (if needed)

- Manually edit `specs/webhooks/request-network-webhooks.json` when Request publishes new webhook fields or events.
- Keep any breaking changes coordinated across SDKs-update shared enums and validation helpers in the clients immediately after adjusting the schema.

## 3. Sync webhook fixtures

- Add or update payload samples under `fixtures/webhooks/`.
- Ensure each new fixture has corresponding parity tests in every SDK that consumes it.

## 4. Verify assets

From this repository, run:

```bash
npm run verify
```

The verification script asserts that the expected files exist and logs their
sizes for a quick sanity check.

## 5. Document and commit

- Record the change in `docs/UPDATES.md` (date, summary, upstream source, required SDK follow-up).
- Commit the updated contracts alongside regenerated client artefacts so downstream packages pick up the change in one review.

Repeat this workflow whenever the upstream API contract or webhook catalogue changes.
