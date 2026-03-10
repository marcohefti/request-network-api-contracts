# Contracts Update Log

Record noteworthy contract updates here (spec revisions, new fixtures). Each
entry should reference the Request API release or Git commit that introduced the
change so SDK maintainers know when to regenerate code.

## Template
-	**Date:** YYYY-MM-DD
-	**Spec Version:** e.g. 2025-03-12
-	**Change Summary:**
-	**Source:** Link to Request API changelog / ticket
-	**Notes:** Regeneration impact, required SDK updates, new fixtures

## History
- **Date:** 2026-03-10
- **Spec Version:** 0.16.1 (`fetchedAt` 2026-03-10T07:48:56.668Z)
- **Change Summary:** Refreshed the upstream Request API OpenAPI fetch metadata. The patched contract JSON stayed unchanged after reapplying the local fee-schema drift patch.
- **Source:** https://api.request.network/open-api/openapi.json
- **Notes:** Local drift patch is still required (`fees[].type` includes `protocol`; fee amount fields remain nullable in committed contracts). TS/PHP clients can adopt `@marcohefti/request-network-api-contracts@0.6.2` without generated contract body changes.

- **Date:** 2026-03-03
- **Spec Version:** 0.16.1 (`fetchedAt` 2026-03-03T11:14:08.930Z)
- **Change Summary:** Synced upstream Request API OpenAPI. Added `/v2/secure-payments` + `/v2/secure-payments/{token}`, removed `/v2/payee-destination*`, and introduced `GET /v2/request`.
- **Source:** https://api.request.network/open-api/openapi.json
- **Notes:** Local drift patch still applies (`fees[].type` includes `protocol`; fee amount fields nullable). Regenerate TS/PHP clients against this contracts revision before release.

- **Date:** 2026-02-24
- **Spec Version:** 2026-02-24 (local drift patch over upstream OpenAPI payload mismatch)
- **Change Summary:** Added compatibility patch for fee payload drift (`fees[].type` includes `protocol`, `fees[].amount` / `amountInUSD` nullable) and updated update workflow docs.
- **Source:** https://api.request.network/open-api/openapi.json
- **Notes:** Keeps contracts package as source of truth for generated clients while upstream schema catches up.

- **Date:** 2026-02-20
- **Spec Version:** 2026-02-20 (`fetchedAt` from `request-network-openapi.meta.json`)
- **Change Summary:** Synced upstream Request API OpenAPI spec; includes new `v2/payee-destination` operations and schema refinements consumed by TS/PHP clients.
- **Source:** https://api.request.network/open-api/openapi.json
- **Notes:** Requires regenerated SDK artifacts and parity checks in both `request-network-api-client-ts` and `request-network-api-client-php`.
