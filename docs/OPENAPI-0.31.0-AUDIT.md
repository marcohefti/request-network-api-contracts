# Request API 0.31.0 and Auth API 0.14.0 Audit

Audit date: 2026-09-03  
Contracts release: 0.7.0  
Scope: Request Network REST APIs only; the legacy Request SDK is excluded.

## Result

The production Request API grew from 42 operations in 0.16.1 to 82 operations in 0.31.0. The audited delta is 42 added,
14 schema-changed, 2 removed, and 26 unchanged operations. The separate Auth API 0.14.0 contributes 26 operations on a
different host and remains a separate contract to avoid path and credential collisions.

Only the production hosts are supported runtime defaults. The raw Request API document also advertises staging and local
servers; those values are retained in the normalized source for provenance but are not supported environments.

## Added Request API operations

| Domain | Count | Operations |
| --- | ---: | --- |
| Orchestrators | 18 | create orchestrator; link/list/unlink Client IDs; create hosted link intent; create/list/update/disable fee configs; create/get/update/remove branding; create/list/test/deactivate/reactivate webhooks |
| Secure Payments | 9 | create payout and batch-payout links; get token calldata; preview fees; record intent, multicall intent, and user event; refresh bridge transaction; broadcast Tron transaction |
| Secure Payment multicall | 2 | create and read multicall payout links |
| Commerce payments | 7 | generate/execute authorization, capture, and void plus payment status |
| Journey | 3 | create journey, record journey event, read journey |
| Health/export/history | 3 | health, dashboard request export, wallet transaction history |

The exact method/path/operation IDs are the 42 operations present in the checked-in 0.31.0 document and absent from the
0.16.1 release. `npm run verify` locks the complete inventory at 82 operations so additions or removals cannot be silent.

## Changed existing operations

All 14 operations whose normalized operation object changed were reviewed:

| Operations | Reviewed impact |
| --- | --- |
| `ClientIdV2Controller_create_v2`, `ClientIdV2Controller_update_v2` | Client-ID fee, domain, and access-policy request/response changes. |
| `PaymentV2Controller_searchPayments_v2` | Expanded amounts, currencies, networks, fee detail, and pagination response data. |
| `PayoutV2Controller_payBatchRequest_v2` | Batch transaction and request metadata shape changed. |
| `RequestControllerV1_getPaymentCalldata_v1`, `RequestControllerV1_getRequestPaymentRoutes_v1`, `RequestControllerV1_getRequestStatus_v1` | Legacy v1 calldata, route, status, and fee schemas changed; retained only for existing consumers. |
| `RequestControllerV2_getPaymentCalldata_v2`, `RequestControllerV2_getRequestPaymentRoutes_v2`, `RequestControllerV2_getRequestStatus_v2`, `RequestControllerV2_listRequests_v2` | Current request status/routes/calldata expanded; list is Client-ID scoped when wallet is omitted and exposes Client ID/Secure Payment state. |
| `SecurePaymentController_createSecurePayment_v2`, `SecurePaymentController_findSecurePayment_v2`, `SecurePaymentController_getSecurePaymentByToken_v2` | Request fields expanded, but upstream response schemas regressed to fee-plan-only objects; compatibility schemas preserve the documented and observed hosted-payment responses. |

The remaining 26 pre-existing operations compare unchanged after canonical JSON ordering.

## Removed operations

The obsolete payment-intent send operations are intentionally absent:

- `RequestControllerV1_sendPaymentIntent_v1` — `POST /v1/request/{paymentIntentId}/send`
- `RequestControllerV2_sendPaymentIntent_v2` — `POST /v2/request/payment-intents/{paymentIntentId}`

## Auth API ownership

Auth API 0.14.0 is stored separately as `request-network-auth-openapi.json` and uses
`https://auth.request.network`. Its 26 operations cover:

- wallet-session registration, login/logout, challenge, and verification (5);
- Client ID CRUD (5);
- hosted Client-ID link validation/completion and linked KYT update (3);
- payee destination lifecycle and lookup (7);
- platform webhook registration/list/test/toggle/delete (5); and
- health (1).

The upstream Auth document names `session_token` without declaring its security scheme and omits the working `x-client-id`
alternative from platform webhook operations. Production probes verified Client-ID-scoped webhook create/list/test/delete.
The normalized contract declares both alternatives only for those five webhook operations.

## Explicit compatibility patches

The normalized specs declare every patch in `x-contract-patches`; metadata records raw and normalized SHA-256 values.

| Patch | Evidence and behavior |
| --- | --- |
| `oas30-nullable-unions` | Both upstream documents declare OpenAPI 3.0 but use JSON Schema `type: [T, null]`. Two-member null unions are converted to `type: T` plus `nullable: true`. Verification rejects remaining type arrays. |
| `runtime-fee-drift` | Production payload evidence includes fee type `protocol` and nullable fee amounts while the upstream schema omits them. The tolerant enum/nullability patch remains active. |
| `secure-payment-response-shapes` | The upstream 0.31.0 document incorrectly substitutes a fee-plan snapshot for several hosted-payment responses. Public Secure Payments examples and a redacted production create probe establish `requestIds`, `securePaymentUrl`, and `token`; the fee snapshot is represented as optional `feePlan`. |
| `platform-webhook-client-id-auth` | A production probe verified `x-client-id` for platform webhook management despite incomplete Auth OpenAPI security annotations. |

## Webhook catalogue

The webhook contract 0.2.0 adds the current platform/orchestrator events `client_id.linked`, `kyt.screening.completed`,
`secure_payment.user_event`, and `secure_payment.access_rejected`. Its manifest defines recipients and distinguishes the
current six-event catalogue from retained legacy fixtures. Fixtures are checked against the event registry during
`npm run verify`.

Sources:

- https://api.request.network/open-api/openapi.json
- https://auth.request.network/open-api/openapi.json
- https://docs.request.network/api-reference/webhooks
- https://docs.request.network/api-reference/secure-payments
