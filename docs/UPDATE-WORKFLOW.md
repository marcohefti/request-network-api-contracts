# Contracts Update Workflow

Use this checklist whenever either Request Network REST API publishes contract changes.

## 1. Refresh the OpenAPI spec

- Run `npm run sync:openapi` in this repository.
- Review both raw upstream sources against the prior release. Record added,
  removed, and schema-changed operations in an audit document.
- Review every compatibility patch. Remove one only when upstream contract and
  production evidence agree.
- Confirm `specs/openapi/manifest.json` names only production runtime hosts and
  records both upstream versions, hashes, patch IDs, and compatible clients.

## 2. Update webhook schema (if needed)

- Update the fixture and `scripts/sync-webhooks.mjs`, then run
  `npm run sync:webhooks` when Request publishes webhook fields or events.
- Update `specs/webhooks/manifest.json` to classify current versus legacy events
  and their platform/orchestrator recipients.
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
- Release this contracts repository before regenerating and releasing clients.

Repeat this workflow whenever the upstream API contract or webhook catalogue changes.
