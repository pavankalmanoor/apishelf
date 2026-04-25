#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const schema = JSON.parse(readFileSync(join(ROOT, 'data/schema.json'), 'utf8'));
const data = JSON.parse(readFileSync(join(ROOT, 'data/apis.json'), 'utf8'));
const cats = JSON.parse(readFileSync(join(ROOT, 'data/categories.json'), 'utf8'));

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

const validCategoryIds = new Set(cats.categories.map((c) => c.id));
const idsSeen = new Set();
let problems = 0;

for (const entry of data.apis) {
  const ok = validate(entry);
  if (!ok) {
    problems++;
    console.error(`✗ ${entry.id || '(no id)'} failed schema:`);
    for (const e of validate.errors) console.error(`    ${e.instancePath} ${e.message}`);
  }
  if (entry.id) {
    if (idsSeen.has(entry.id)) {
      problems++;
      console.error(`✗ Duplicate id: ${entry.id}`);
    }
    idsSeen.add(entry.id);
  }
  if (entry.category && !validCategoryIds.has(entry.category)) {
    problems++;
    console.error(`✗ ${entry.id} has unknown category "${entry.category}"`);
  }
  if (entry.alternatives) {
    for (const alt of entry.alternatives) {
      // alternatives reference other entry ids — validate as soft warning after first pass
    }
  }
}

// second pass: alternative cross-reference (warning only — alternatives may point outside the catalog)
let warnings = 0;
for (const entry of data.apis) {
  for (const alt of entry.alternatives || []) {
    if (!idsSeen.has(alt)) {
      warnings++;
      console.warn(`! ${entry.id} references "${alt}" which is not in the catalog (informational only)`);
    }
  }
}

const verified = data.apis.filter((a) => a._meta?.verified).length;
const total = data.apis.length;

if (problems > 0) {
  console.error(`\n${problems} schema problem(s) found in ${total} entries.`);
  process.exit(1);
}

console.log(`✓ ${total} entries validated. ${verified} live-verified, ${total - verified} documented-only.`);
if (warnings > 0) console.log(`  (${warnings} informational warning(s))`);
