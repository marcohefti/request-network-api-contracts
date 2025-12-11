#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const files = [
  path.join(root, 'specs', 'openapi', 'request-network-openapi.json'),
  path.join(root, 'specs', 'openapi', 'request-network-openapi.meta.json'),
  path.join(root, 'specs', 'webhooks', 'request-network-webhooks.json'),
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
