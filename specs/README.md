# Specs Directory

This folder holds the contracts consumed by the Request client SDKs.

```
openapi/   # normalized Request and Auth REST APIs plus provenance
webhooks/  # manually curated webhook schema
```

## `openapi/`
- `request-network-openapi.json` – fetched via automation from the upstream
  Request API.
- `request-network-auth-openapi.json` – separately fetched Auth API contract.
- `*.meta.json` – source URL, runtime host, timestamp, raw/normalized hashes,
  and patch statistics.
- `manifest.json` – release versions, operation counts, supported production
  hosts, patches, and minimum compatible clients.

These files change through `npm run sync:openapi` in this repository. Do not
merge the two APIs: their paths overlap while their hosts and credentials do
not.

## `webhooks/`
- `request-network-webhooks.json` – maintained manually. Update it when webhook
  documentation or behaviour changes, and keep fixtures/tests in sync.
- `manifest.json` – classifies current versus legacy events and records
  platform/orchestrator recipients.

This separation ensures automation never overwrites the manual webhook spec while
making it obvious which files are generated vs. curated.
