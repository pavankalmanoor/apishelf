#!/usr/bin/env node
// One-shot migration: convert string gotchas to {severity, text} objects.
// Severity rules:
//   warning = blocks free usage or is a real correctness/safety risk
//             (CC required, very low quotas, HTTP-only blocking browsers,
//              geo-restrictions, data quality biases, privacy risks)
//   info    = useful tip / quirk / heads-up
//
// Run once: `node scripts/migrate-gotchas.js`. After that, edit gotchas in
// the new object form directly in apis.json.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = dirname(fileURLToPath(import.meta.url)) + '/..';
const PATH = join(ROOT, 'data/apis.json');

// Substring → severity. Order matters: first match wins.
// All are matched case-insensitively against the gotcha text.
const WARNINGS = [
  'non-commercial use only',
  'us territory only',
  'requires cc',
  'requires credit card',
  'will get you ip-banned',
  'http only',
  'http-only',
  'free tier is http only',
  'aggressive rate-limit on the free tier',
  '25 calls per day',
  'returns 200 ok even when rate-limited',
  'flagship models are now pro-only',
  'cannot be used in production',
  'may be used to improve google',
  'not available in eu',
  'multi-day outages',
  'western name datasets',
  'western dataset bias',
];

const classify = (text) => {
  const lc = text.toLowerCase();
  for (const needle of WARNINGS) {
    if (lc.includes(needle)) return 'warning';
  }
  return 'info';
};

const data = JSON.parse(readFileSync(PATH, 'utf8'));
let migrated = 0, alreadyTyped = 0, totalWarnings = 0, totalInfo = 0;

for (const entry of data.apis) {
  if (!Array.isArray(entry.gotchas)) continue;
  entry.gotchas = entry.gotchas.map((g) => {
    if (typeof g === 'object' && g !== null && g.severity && g.text) {
      alreadyTyped++;
      if (g.severity === 'warning') totalWarnings++; else totalInfo++;
      return g;
    }
    const severity = classify(g);
    migrated++;
    if (severity === 'warning') totalWarnings++; else totalInfo++;
    return { severity, text: g };
  });
}

writeFileSync(PATH, JSON.stringify(data, null, 2) + '\n');
console.log(`✓ Migrated ${migrated} string gotchas (${alreadyTyped} already typed).`);
console.log(`  Result: ${totalWarnings} warning, ${totalInfo} info across ${data.apis.length} APIs.`);
