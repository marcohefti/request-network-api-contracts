#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const openApiDirectory = resolve(root, "specs/openapi");
const contractVersion = "0.7.0";

const sources = [
  {
    id: "request-api",
    url: "https://api.request.network/open-api/openapi.json",
    runtimeBaseUrl: "https://api.request.network",
    filename: "request-network-openapi.json",
    metaFilename: "request-network-openapi.meta.json",
    patch: patchRequestApi,
  },
  {
    id: "auth-api",
    url: "https://auth.request.network/open-api/openapi.json",
    runtimeBaseUrl: "https://auth.request.network",
    filename: "request-network-auth-openapi.json",
    metaFilename: "request-network-auth-openapi.meta.json",
    patch: patchAuthApi,
  },
];

const createSecurePaymentResponse = {
  type: "object",
  additionalProperties: true,
  properties: {
    requestIds: { type: "array", items: { type: "string" } },
    securePaymentUrl: { type: "string", format: "uri" },
    token: { type: "string" },
    feePlan: { type: "object", nullable: true, additionalProperties: true },
  },
  required: ["requestIds", "securePaymentUrl", "token"],
  description: "Compatibility schema from the public Secure Payments guide and verified production response keys.",
};

const findSecurePaymentResponse = {
  type: "object",
  additionalProperties: true,
  properties: {
    token: { type: "string" },
    securePaymentUrl: { type: "string", format: "uri" },
    status: { type: "string", enum: ["pending", "completed", "expired", "invalidated"] },
    paymentType: { type: "string", enum: ["single", "batch"] },
    createdAt: { type: "string", format: "date-time", nullable: true },
    expiresAt: { type: "string", format: "date-time" },
    feePlan: { type: "object", nullable: true, additionalProperties: true },
  },
  required: ["token", "securePaymentUrl", "status", "paymentType", "expiresAt"],
  description: "Compatibility schema from the public Secure Payments guide.",
};

const getSecurePaymentResponse = {
  type: "object",
  additionalProperties: true,
  properties: {
    paymentType: { type: "string", enum: ["single", "batch"] },
    payee: { type: "string" },
    payees: { type: "array", items: { type: "string" } },
    network: { type: "string" },
    amount: { type: "string" },
    amounts: { type: "array", items: { type: "string" } },
    paymentCurrency: { type: "string" },
    paymentCurrencies: { type: "array", items: { type: "string" } },
    isNativeCurrency: { oneOf: [{ type: "boolean" }, { type: "array", items: { type: "boolean" } }] },
    status: { type: "string", enum: ["pending", "completed", "expired", "invalidated"] },
    destination: { type: "object", additionalProperties: true },
    destinations: { type: "array", items: { type: "object", additionalProperties: true } },
    reference: { type: "string", nullable: true },
    paymentOptions: { type: "object", additionalProperties: true },
    feePlan: { type: "object", nullable: true, additionalProperties: true },
  },
  required: ["paymentType", "network", "status"],
  description: "Compatibility schema from the public Secure Payments guide.",
};

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function operationCount(spec) {
  const methods = new Set(["get", "post", "put", "patch", "delete", "options", "head", "trace"]);
  return Object.values(spec.paths ?? {}).reduce(
    (total, pathItem) => total + Object.keys(pathItem).filter((key) => methods.has(key)).length,
    0,
  );
}

function normalizeNullableUnions(node, stats) {
  if (Array.isArray(node)) {
    for (const value of node) normalizeNullableUnions(value, stats);
    return;
  }
  if (!node || typeof node !== "object") return;

  if (Array.isArray(node.type) && node.type.length === 2 && node.type.includes("null")) {
    node.type = node.type.find((value) => value !== "null");
    node.nullable = true;
    stats.nullableUnions += 1;
  }

  for (const value of Object.values(node)) normalizeNullableUnions(value, stats);
}

function patchFeeDrift(node, stats) {
  if (Array.isArray(node)) {
    for (const value of node) patchFeeDrift(value, stats);
    return;
  }
  if (!node || typeof node !== "object") return;

  const properties = node.properties;
  const typeSchema = properties?.type;
  if (
    typeSchema &&
    Array.isArray(typeSchema.enum) &&
    ["gas", "platform", "crosschain", "crypto-to-fiat", "offramp"].every((value) => typeSchema.enum.includes(value))
  ) {
    if (!typeSchema.enum.includes("protocol")) {
      typeSchema.enum.push("protocol");
      stats.feeEnums += 1;
    }
    for (const key of ["amount", "amountInUSD", "amountInUsd"]) {
      if (properties[key]?.type === "string" && properties[key].nullable !== true) {
        properties[key].nullable = true;
        stats.feeAmounts += 1;
      }
    }
  }

  for (const value of Object.values(node)) patchFeeDrift(value, stats);
}

function setResponseSchema(spec, method, endpoint, status, schema) {
  spec.paths[endpoint][method].responses[status].content["application/json"].schema = structuredClone(schema);
}

function withFeePlan(schema, feePlan) {
  const result = structuredClone(schema);
  result.properties.feePlan = structuredClone(feePlan);
  return result;
}

function patchRequestApi(spec) {
  const stats = { nullableUnions: 0, feeEnums: 0, feeAmounts: 0, securePaymentResponses: 0 };
  normalizeNullableUnions(spec, stats);
  patchFeeDrift(spec, stats);

  for (const endpoint of ["/v2/secure-payments", "/v2/secure-payments/payouts", "/v2/secure-payments/batch-payouts"]) {
    const feePlan = spec.paths[endpoint].post.responses["201"].content["application/json"].schema;
    setResponseSchema(spec, "post", endpoint, "201", withFeePlan(createSecurePaymentResponse, feePlan));
    stats.securePaymentResponses += 1;
  }
  const findFeePlan = spec.paths["/v2/secure-payments"].get.responses["200"].content["application/json"].schema;
  setResponseSchema(spec, "get", "/v2/secure-payments", "200", withFeePlan(findSecurePaymentResponse, findFeePlan));
  const tokenFeePlan = spec.paths["/v2/secure-payments/{token}"].get.responses["200"].content["application/json"].schema;
  setResponseSchema(spec, "get", "/v2/secure-payments/{token}", "200", withFeePlan(getSecurePaymentResponse, tokenFeePlan));
  stats.securePaymentResponses += 2;

  spec["x-contract-patches"] = [
    "oas30-nullable-unions",
    "runtime-fee-drift",
    "secure-payment-response-shapes",
  ];
  return stats;
}

function patchAuthApi(spec) {
  const stats = { nullableUnions: 0, webhookSecurityOperations: 0 };
  normalizeNullableUnions(spec, stats);

  spec.components ??= {};
  spec.components.securitySchemes ??= {};
  spec.components.securitySchemes.session_token = {
    type: "apiKey",
    in: "cookie",
    name: "session_token",
  };
  spec.components.securitySchemes.client_id = {
    type: "apiKey",
    in: "header",
    name: "x-client-id",
    description: "Platform Client ID authentication verified against production webhook operations.",
  };

  for (const [endpoint, methods] of [
    ["/v1/webhook", ["get", "post"]],
    ["/v1/webhook/test", ["post"]],
    ["/v1/webhook/{webhookId}", ["put", "delete"]],
  ]) {
    for (const method of methods) {
      spec.paths[endpoint][method].security = [{ client_id: [] }, { session_token: [] }];
      stats.webhookSecurityOperations += 1;
    }
  }

  spec["x-contract-patches"] = ["oas30-nullable-unions", "platform-webhook-client-id-auth"];
  return stats;
}

async function main() {
  await mkdir(openApiDirectory, { recursive: true });
  const fetchedAt = new Date().toISOString();
  const manifestSources = [];

  for (const source of sources) {
    const response = await fetch(source.url, { headers: { accept: "application/json" } });
    if (!response.ok) throw new Error(`${source.id} fetch failed: ${response.status} ${response.statusText}`);

    const rawBody = await response.text();
    const spec = JSON.parse(rawBody);
    const patchStats = source.patch(spec);
    const normalizedBody = `${JSON.stringify(spec)}\n`;

    await writeFile(resolve(openApiDirectory, source.filename), normalizedBody);
    await writeFile(
      resolve(openApiDirectory, source.metaFilename),
      `${JSON.stringify({
        url: source.url,
        runtimeBaseUrl: source.runtimeBaseUrl,
        fetchedAt,
        etag: response.headers.get("etag"),
        lastModified: response.headers.get("last-modified"),
        rawSha256: sha256(rawBody),
        normalizedSha256: sha256(normalizedBody),
        patchStats,
      }, null, 2)}\n`,
    );

    manifestSources.push({
      id: source.id,
      filename: source.filename,
      sourceUrl: source.url,
      runtimeBaseUrl: source.runtimeBaseUrl,
      openapi: spec.openapi,
      apiVersion: spec.info?.version,
      operationCount: operationCount(spec),
      rawSha256: sha256(rawBody),
      normalizedSha256: sha256(normalizedBody),
      patches: spec["x-contract-patches"],
    });
  }

  const manifest = {
    contractsVersion: contractVersion,
    fetchedAt,
    defaultEnvironment: "production",
    supportedRuntimeHosts: ["https://api.request.network", "https://auth.request.network"],
    minimumCompatibleClients: { typescript: "0.7.0", php: "0.7.0" },
    sources: manifestSources,
  };
  await writeFile(resolve(openApiDirectory, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  process.stdout.write(`Synced ${manifestSources.map(({ id, apiVersion, operationCount: count }) => `${id} ${apiVersion} (${count})`).join(", ")}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
