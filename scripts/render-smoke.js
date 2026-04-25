#!/usr/bin/env node
// Smoke test: extract the helper + rendering logic from app.js, run it over
// real apis.json data, assert the output never contains "[object Object]"
// and contains the expected severity classes.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = dirname(fileURLToPath(import.meta.url)) + '/..';
const data = JSON.parse(readFileSync(join(ROOT, 'data/apis.json'), 'utf8'));

const escapeHtml = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Canonical normalizer — must match site/app.js, site/compare.html,
// scripts/generate-readme.js exactly.
const normalizeGotcha = (g) =>
  typeof g === 'string' ? { severity: 'info', text: g } : { severity: g.severity || 'info', text: g.text };
const normalizeGotchas = (arr) => (arr || []).map(normalizeGotcha);

const renderTipList = (tips) => {
  const sorted = [...tips].sort((a, b) => (a.severity === 'warning' ? -1 : 0) - (b.severity === 'warning' ? -1 : 0));
  const items = sorted.map((g) => {
    const icon = g.severity === 'warning' ? '⚠️' : 'ℹ️';
    const label = g.severity === 'warning' ? 'Warning' : 'Note';
    return `<li class="tip tip-${g.severity}"><span class="tip-icon" title="${label}">${icon}</span><span class="tip-text">${escapeHtml(g.text)}</span></li>`;
  }).join('');
  return `<ul class="tips">${items}</ul>`;
};

let totalTips = 0, warnings = 0, infos = 0, problems = 0;
const samples = [];

for (const a of data.apis) {
  const tips = normalizeGotchas(a.gotchas);
  if (!tips.length) continue;
  const html = renderTipList(tips);
  totalTips += tips.length;
  warnings += tips.filter((t) => t.severity === 'warning').length;
  infos += tips.filter((t) => t.severity === 'info').length;

  // Hard assertions on the rendered HTML
  if (html.includes('[object Object]')) {
    problems++;
    console.error(`✗ ${a.id}: rendered HTML contains "[object Object]"`);
  }
  if (!html.includes('class="tip ')) {
    problems++;
    console.error(`✗ ${a.id}: rendered HTML missing tip class`);
  }
  for (const t of tips) {
    if (typeof t.text !== 'string' || !t.text.length) {
      problems++;
      console.error(`✗ ${a.id}: gotcha has empty/non-string text:`, t);
    }
    if (!['info', 'warning'].includes(t.severity)) {
      problems++;
      console.error(`✗ ${a.id}: gotcha has invalid severity "${t.severity}"`);
    }
  }
  if (samples.length < 3 && tips.some((t) => t.severity === 'warning')) {
    samples.push({ api: a.name, html: html.slice(0, 360) + (html.length > 360 ? '…' : '') });
  }
}

console.log('=== rendered HTML samples (warnings present) ===');
for (const s of samples) {
  console.log(`\n[${s.api}]`);
  console.log(s.html);
}
console.log('\n=== summary ===');
console.log(`  ${data.apis.length} APIs · ${totalTips} tips total · ${warnings} warning · ${infos} info`);
if (problems) {
  console.error(`\n✗ ${problems} problem(s) found.`);
  process.exit(1);
}
console.log('  ✓ all rendered HTML contains real text and valid severity classes.');
