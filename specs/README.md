# Specs Directory

This folder holds the contracts consumed by the Request client SDKs.

```
openapi/   # auto-generated from the Request REST API
webhooks/  # manually curated webhook schema
```

## `openapi/`
- `request-network-openapi.json` – fetched via automation from the upstream
  Request API.
- `request-network-openapi.meta.json` – metadata captured during fetch (e.g.
  etag, timestamp, source URL).

These files should only change through the regeneration script (`pnpm --filter "./packages/request-api-client" fetch:openapi` or the broader `prepare:spec`). Avoid manual edits. Rerun the fetch command when upstream changes land and commit the updated JSON + metadata.

## `webhooks/`
- `request-network-webhooks.json` – maintained manually. Update it when webhook
  documentation or behaviour changes, and keep fixtures/tests in sync.

This separation ensures automation never overwrites the manual webhook spec while
making it obvious which files are generated vs. curated.
