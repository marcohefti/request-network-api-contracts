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
- **Date:** 2026-02-20
- **Spec Version:** 2026-02-20 (`fetchedAt` from `request-network-openapi.meta.json`)
- **Change Summary:** Synced upstream Request API OpenAPI spec; includes new `v2/payee-destination` operations and schema refinements consumed by TS/PHP clients.
- **Source:** https://api.request.network/open-api/openapi.json
- **Notes:** Requires regenerated SDK artifacts and parity checks in both `request-network-api-client-ts` and `request-network-api-client-php`.
