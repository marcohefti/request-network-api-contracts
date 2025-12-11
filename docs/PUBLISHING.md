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

## Publishing Steps (Automated via GitHub Actions)

Publishing is fully automated using GitHub Actions and OIDC trusted publishers. No npm tokens required.

**To publish a new version:**

1. Bump the version using npm:
   ```bash
   npm version patch   # for bug fixes (0.5.1 -> 0.5.2)
   npm version minor   # for new features (0.5.1 -> 0.6.0)
   npm version major   # for breaking changes (0.5.1 -> 1.0.0)
   ```

2. Push the tag to GitHub:
   ```bash
   git push --follow-tags
   ```

3. GitHub Actions automatically:
   - Verifies spec files exist (`node scripts/verify.js`)
   - Publishes to npm using OIDC authentication
   - Generates provenance attestations

4. Verify the publish succeeded:
   - Check GitHub Actions: https://github.com/marcohefti/request-network-api-contracts/actions
   - Check npm: https://www.npmjs.com/package/@marcohefti/request-network-api-contracts

**Prerequisites:**
- Trusted publisher configured on npmjs.com (already set up)
- Workflow file exists: `.github/workflows/publish.yml`
- Repository uses npm 11.5.1+ in CI

**Manual publish (emergency only):**
If GitHub Actions is unavailable, you can publish manually:
```bash
npm login
npm publish --access public
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
