# Publishing `@marcohefti/request-network-api-contracts`

This package publishes the shared Request Network REST API contracts to npm so
SDKs can consume the OpenAPI spec, metadata, and webhook fixtures without
vendoring files.

Use this checklist when preparing a release.

## Preflight

- [x] `package.json` metadata is correct:
  - `name: "@marcohefti/request-network-api-contracts"`
  - `version` bumped according to the changes (0.5.x for the initial public line).
  - `"private": false` and `"license": "MIT"`.
  - `"files"` includes `specs`, `fixtures`, `docs`, and `README.md`.
- [x] `README.md` and `docs/OVERVIEW.md` describe the current contents (OpenAPI,
      webhooks, fixtures) and how SDKs should consume them.
- [x] OpenAPI spec and metadata are refreshed via the TypeScript client’s tooling
      (see `docs/UPDATE-WORKFLOW.md` step 1).
- [x] Webhook schema (`specs/webhooks/request-network-webhooks.json`) and
      fixtures under `fixtures/webhooks/**` reflect the latest published webhook
      events.
- [x] `node scripts/verify.js` passes to confirm the expected assets exist and
      are non-empty.

## Release Metadata

- [x] `docs/UPDATES.md` records the latest contract update (date, summary,
      upstream source, required SDK follow-up).
- [ ] Tag strategy documented (e.g., `v0.x.y` for contract updates, semantic
      version bumps when contracts introduce breaking changes for SDKs).

## Publishing Steps

1. Ensure you are logged into npm as `marcohefti` with publish access and 2FA enabled:
   ```bash
   npm login
   ```
2. From the contracts package root, run the verifier:
   ```bash
   npm run verify
   ```
3. Bump the version in `package.json` (following SemVer for the contracts line,
   e.g., `0.5.1` for additive changes) and commit:
   ```bash
   git add package.json docs/UPDATES.md specs fixtures
   git commit -m "chore(contracts): prepare @marcohefti/request-network-api-contracts@<version>"
   ```
4. Tag the commit and push branch + tag:
   ```bash
   git tag v<version>
   git push
   git push --tags
   ```
5. Publish the package to npm:
   ```bash
   npm publish --access public --otp=<your_2fa_code>
   ```

## Post-Release

- [ ] Update TypeScript and PHP clients (and any other SDKs) to depend on the
      new version.
- [ ] Run their spec/fixture sync scripts and parity guards:
  - TS: `pnpm run prepare:spec` + tests.
  - PHP: `composer update:spec`, `composer parity:openapi`, `composer parity:webhooks`.
- [ ] Record any required client follow-up work in the relevant SDK
      repositories or your own release notes so consumers know which client
      versions pick up the new contracts.
