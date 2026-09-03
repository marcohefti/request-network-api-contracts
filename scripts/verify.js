#!/usr/bin/env node

const fs = require('node:fs');
const crypto = require('node:crypto');
const path = require('node:path');

const root = path.join(__dirname, '..');
const files = [
  path.join(root, 'specs', 'openapi', 'request-network-openapi.json'),
  path.join(root, 'specs', 'openapi', 'request-network-openapi.meta.json'),
  path.join(root, 'specs', 'openapi', 'request-network-auth-openapi.json'),
  path.join(root, 'specs', 'openapi', 'request-network-auth-openapi.meta.json'),
  path.join(root, 'specs', 'openapi', 'manifest.json'),
  path.join(root, 'specs', 'webhooks', 'request-network-webhooks.json'),
  path.join(root, 'specs', 'webhooks', 'manifest.json'),
];

for (const file of files) {
  try {
    const stats = fs.statSync(file);
    if (!stats.size) {
      throw new Error('file is empty');
    }
    process.stdout.write(`✔ ${path.relative(root, file)} (${stats.size} bytes)\n`);
  } catch (error) {
    console.error(`Failed to verify ${file}:`, error.message);
    process.exit(1);
  }
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function operationCount(spec) {
  const methods = new Set(['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'trace']);
  return Object.values(spec.paths || {}).reduce(
    (total, item) => total + Object.keys(item).filter((key) => methods.has(key)).length,
    0,
  );
}

function hasArrayType(node) {
  if (Array.isArray(node)) return node.some(hasArrayType);
  if (!node || typeof node !== 'object') return false;
  if (Array.isArray(node.type)) return true;
  return Object.values(node).some(hasArrayType);
}

try {
  const packageJson = readJson('package.json');
  const manifest = readJson('specs/openapi/manifest.json');
  const requestSpec = readJson('specs/openapi/request-network-openapi.json');
  const authSpec = readJson('specs/openapi/request-network-auth-openapi.json');
  const requestMeta = readJson('specs/openapi/request-network-openapi.meta.json');
  const authMeta = readJson('specs/openapi/request-network-auth-openapi.meta.json');
  const webhookSpec = readJson('specs/webhooks/request-network-webhooks.json');
  const webhookManifest = readJson('specs/webhooks/manifest.json');

  assert(packageJson.version === manifest.contractsVersion, 'package and manifest versions differ');
  assert(requestSpec.info.version === '0.31.0', 'unexpected Request API version');
  assert(authSpec.info.version === '0.14.0', 'unexpected Auth API version');
  assert(operationCount(requestSpec) === 82, 'Request API operation inventory must contain 82 operations');
  assert(operationCount(authSpec) === 26, 'Auth API operation inventory must contain 26 operations');
  assert(!requestSpec.paths['/v1/request/{paymentIntentId}/send'], 'obsolete v1 payment-intent send operation remains');
  assert(!requestSpec.paths['/v2/request/payment-intents/{paymentIntentId}'], 'obsolete v2 payment-intent send operation remains');
  assert(!hasArrayType(requestSpec) && !hasArrayType(authSpec), 'OpenAPI 3.0 documents contain unnormalized type arrays');
  assert(requestSpec['x-contract-patches'].includes('runtime-fee-drift'), 'fee drift patch is not declared');
  assert(requestSpec['x-contract-patches'].includes('secure-payment-response-shapes'), 'secure-payment response patch is not declared');
  assert(authSpec['x-contract-patches'].includes('platform-webhook-client-id-auth'), 'Auth webhook security patch is not declared');

  const createResponse = requestSpec.paths['/v2/secure-payments'].post.responses['201'].content['application/json'].schema;
  for (const key of ['requestIds', 'securePaymentUrl', 'token']) {
    assert(createResponse.required.includes(key), `secure-payment response does not require ${key}`);
  }

  for (const [endpoint, methods] of [
    ['/v1/webhook', ['get', 'post']],
    ['/v1/webhook/test', ['post']],
    ['/v1/webhook/{webhookId}', ['put', 'delete']],
  ]) {
    for (const method of methods) {
      const security = authSpec.paths[endpoint][method].security;
      assert(security.some((item) => item.client_id), `${method.toUpperCase()} ${endpoint} lacks Client ID security`);
    }
  }

  for (const source of manifest.sources) {
    const body = fs.readFileSync(path.join(root, 'specs/openapi', source.filename));
    const digest = crypto.createHash('sha256').update(body).digest('hex');
    const meta = source.id === 'request-api' ? requestMeta : authMeta;
    assert(digest === source.normalizedSha256, `${source.id} normalized hash differs from manifest`);
    assert(digest === meta.normalizedSha256, `${source.id} normalized hash differs from metadata`);
    assert(source.runtimeBaseUrl === meta.runtimeBaseUrl, `${source.id} runtime host differs from metadata`);
  }

  for (const [event, definition] of Object.entries(webhookManifest.currentEvents)) {
    assert(webhookSpec.webhooks[event], `current webhook schema missing ${event}`);
    const fixture = readJson(path.join('fixtures/webhooks', definition.fixture));
    assert(fixture.event === event, `${definition.fixture} contains ${fixture.event}, expected ${event}`);
  }

  for (const fixtures of Object.values(webhookManifest.legacyEvents)) {
    for (const fixture of Array.isArray(fixtures) ? fixtures : [fixtures]) {
      assert(fs.existsSync(path.join(root, 'fixtures/webhooks', fixture)), `legacy fixture missing ${fixture}`);
    }
  }

  process.stdout.write('✔ contract inventories, patches, manifests, and webhook fixtures verified\n');
} catch (error) {
  console.error('Contract verification failed:', error.message);
  process.exit(1);
}
