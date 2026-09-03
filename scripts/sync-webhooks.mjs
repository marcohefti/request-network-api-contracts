#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const schemaPath = resolve(root, "specs/webhooks/request-network-webhooks.json");

function webhookOperation(summary, schemaName, exampleName) {
  return {
    post: {
      summary,
      parameters: [{ $ref: "#/components/parameters/XRequestNetworkSignature" }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: `#/components/schemas/${schemaName}` },
            examples: { [exampleName]: { $ref: `#/components/examples/${exampleName}` } },
          },
        },
      },
      responses: {
        200: { description: "Acknowledged" },
        401: { description: "Signature verification failed" },
      },
      security: [{ RequestSignatureHMAC: [] }],
    },
  };
}

function eventSchema(event, properties, required, description) {
  return {
    allOf: [
      { $ref: "#/components/schemas/WebhookBase" },
      {
        type: "object",
        additionalProperties: true,
        properties: { event: { const: event }, ...properties },
        required: ["event", ...required],
      },
    ],
    description,
  };
}

async function main() {
  const schema = JSON.parse(await readFile(schemaPath, "utf8"));
  schema.info.version = "0.2.0";
  schema.info.description = "Community-maintained schemas for current Request Network platform/orchestrator webhooks and explicitly classified legacy events. Payload examples follow the official webhook guide fetched 2026-09-03.";

  Object.assign(schema.webhooks, {
    "client_id.linked": webhookOperation("Client ID linked through hosted onboarding", "ClientIdLinkedEvent", "client_id_linked"),
    "kyt.screening.completed": webhookOperation("KYT screening reached a definitive result", "KytScreeningCompletedEvent", "kyt_screening_completed"),
    "secure_payment.user_event": webhookOperation("Secure Payment Page user activity", "SecurePaymentUserEvent", "secure_payment_user_event"),
    "secure_payment.access_rejected": webhookOperation("Payer-wallet access rejected", "SecurePaymentAccessRejectedEvent", "secure_payment_access_rejected"),
  });

  Object.assign(schema.components.schemas.WebhookBase.properties, {
    clientId: { type: "string", description: "Platform Client ID associated with the event." },
    orchestratorId: { type: "string", description: "Orchestrator associated with the event when applicable." },
    payerAddress: { type: "string", nullable: true, description: "Resolved payer wallet when available." },
    payerEoaAddress: { type: "string", nullable: true, description: "Connected payer EOA when available." },
  });

  Object.assign(schema.components.schemas, {
    ClientIdLinkedEvent: eventSchema("client_id.linked", {
      clientId: { type: "string" },
      orchestratorId: { type: "string" },
      linkId: { type: "string" },
      intentId: { type: "string" },
      externalId: { type: "string" },
      destinationId: { type: "string" },
      destinationWalletAddress: { type: "string" },
      chain: { type: "string" },
      currency: { type: "string" },
      timestamp: { type: "string", format: "date-time" },
    }, ["clientId", "orchestratorId", "linkId", "intentId", "externalId", "destinationId", "destinationWalletAddress", "chain", "currency", "timestamp"], "Orchestrator-only hosted onboarding completion event."),
    KytScreeningCompletedEvent: eventSchema("kyt.screening.completed", {
      paymentToken: { type: "string" },
      clientId: { type: "string" },
      orchestratorId: { type: "string" },
      walletAddress: { type: "string" },
      eoaAddress: { type: "string" },
      smartAccountAddress: { type: "string", nullable: true },
      status: { type: "string", enum: ["approved", "rejected"] },
      provider: { type: "string" },
      policyId: { type: "string", nullable: true },
      timestamp: { type: "string", format: "date-time" },
    }, ["paymentToken", "clientId", "walletAddress", "eoaAddress", "status", "provider", "timestamp"], "Definitive Secure Payment KYT result."),
    SecurePaymentUserEvent: eventSchema("secure_payment.user_event", {
      userEvent: { type: "string", enum: ["wallet_connected", "payment_sent_to_wallet", "payment_approved_in_wallet"] },
      securePaymentToken: { type: "string" },
      requestId: { type: "string" },
      requestIds: { type: "array", items: { type: "string" } },
      clientId: { type: "string" },
      orchestratorId: { type: "string" },
      occurredAt: { type: "string", format: "date-time" },
      timestamp: { type: "string", format: "date-time" },
      properties: { type: "object", additionalProperties: true },
    }, ["userEvent", "securePaymentToken", "requestIds", "clientId", "occurredAt", "timestamp", "properties"], "Best-effort browser activity; never settlement proof."),
    SecurePaymentAccessRejectedEvent: eventSchema("secure_payment.access_rejected", {
      requestId: { type: "string" },
      clientId: { type: "string" },
      orchestratorId: { type: "string" },
      attemptedPayerWalletAddress: { type: "string" },
      timestamp: { type: "string", format: "date-time" },
    }, ["requestId", "clientId", "attemptedPayerWalletAddress", "timestamp"], "Platform-only payer allowlist rejection event."),
  });

  Object.assign(schema.components.examples, {
    payment_confirmed: { summary: "Official current settlement example", value: JSON.parse(await readFile(resolve(root, "fixtures/webhooks/payment-confirmed.json"), "utf8")) },
    payment_failed: { summary: "Official current failure example", value: JSON.parse(await readFile(resolve(root, "fixtures/webhooks/payment-failed.json"), "utf8")) },
    client_id_linked: { summary: "Official hosted onboarding example", value: JSON.parse(await readFile(resolve(root, "fixtures/webhooks/client-id-linked.json"), "utf8")) },
    kyt_screening_completed: { summary: "Official definitive KYT example", value: JSON.parse(await readFile(resolve(root, "fixtures/webhooks/kyt-screening-completed.json"), "utf8")) },
    secure_payment_user_event: { summary: "Official Secure Payment Page activity example", value: JSON.parse(await readFile(resolve(root, "fixtures/webhooks/secure-payment-user-event.json"), "utf8")) },
    secure_payment_access_rejected: { summary: "Official payer allowlist rejection example", value: JSON.parse(await readFile(resolve(root, "fixtures/webhooks/secure-payment-access-rejected.json"), "utf8")) },
  });

  await writeFile(schemaPath, `${JSON.stringify(schema, null, 2)}\n`);
  process.stdout.write("Synchronized current webhook schemas and examples\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
