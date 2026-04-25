#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const data = JSON.parse(readFileSync(join(ROOT, 'data/apis.json'), 'utf8'));
const TODAY = new Date().toISOString().slice(0, 10);
const HISTORY_DIR = join(ROOT, 'history');
const HISTORY_FILE = join(HISTORY_DIR, 'uptime.json');
if (!existsSync(HISTORY_DIR)) mkdirSync(HISTORY_DIR, { recursive: true });

const history = existsSync(HISTORY_FILE)
  ? JSON.parse(readFileSync(HISTORY_FILE, 'utf8'))
  : { runs: [] };

const TIMEOUT_MS = 15000;
const CONCURRENCY = 8;

const corsRequest = async (url) => {
  // OPTIONS preflight or simple GET with Origin to detect CORS
  try {
    const r = await fetch(url, {
      method: 'GET',
      headers: { Origin: 'https://example.com', 'User-Agent': 'APIShelf/1.0 (https://github.com/pavankalmanoor/apishelf)' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const acao = r.headers.get('access-control-allow-origin');
    return acao === '*' || (acao && acao.includes('example.com'));
  } catch {
    return false;
  }
};

const checkOne = async (entry) => {
  if (!entry._meta?.verified || !entry.health_check) {
    return { id: entry.id, skipped: true };
  }
  const { url, method, expected_status, headers = {}, requires_auth } = entry.health_check;
  if (requires_auth) return { id: entry.id, skipped: true, reason: 'requires_auth' };

  const start = Date.now();
  let status = 0, ok = false, errorMsg = null;
  try {
    const r = await fetch(url, {
      method,
      headers: { 'User-Agent': 'APIShelf/1.0 (https://github.com/pavankalmanoor/apishelf)', ...headers },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    status = r.status;
    ok = status === expected_status;
  } catch (e) {
    errorMsg = e.message;
  }
  const elapsed = Date.now() - start;
  const corsOk = await corsRequest(url);

  return { id: entry.id, status, ok, errorMsg, elapsed, corsOk };
};

const runInBatches = async (items, fn, size) => {
  const out = [];
  for (let i = 0; i < items.length; i += size) {
    const batch = items.slice(i, i + size);
    out.push(...(await Promise.all(batch.map(fn))));
  }
  return out;
};

console.log(`Health-checking ${data.apis.length} APIs...`);
const results = await runInBatches(data.apis, checkOne, CONCURRENCY);

let upCount = 0, downCount = 0, skippedCount = 0;

for (const r of results) {
  if (r.skipped) {
    skippedCount++;
    continue;
  }
  const entry = data.apis.find((a) => a.id === r.id);
  entry._meta = entry._meta || {};
  entry._meta.last_verified = TODAY;
  entry._meta.health_status = r.ok ? 'up' : (r.status > 0 ? 'degraded' : 'down');
  entry._meta.cors_verified = r.corsOk;
  if (r.ok) upCount++; else downCount++;

  // Update rolling uptime: last 30 runs
  const past = history.runs.flatMap((run) => run.results.filter((x) => x.id === r.id)).slice(-29);
  const totalRuns = past.length + 1;
  const ups = past.filter((x) => x.ok).length + (r.ok ? 1 : 0);
  entry._meta.uptime_percentage = Math.round((ups / totalRuns) * 1000) / 10;

  const icon = r.ok ? '✓' : '✗';
  console.log(`  ${icon} ${r.id.padEnd(28)} HTTP ${String(r.status).padEnd(3)} ${r.elapsed}ms ${r.corsOk ? '[CORS]' : ''}`);
}

history.runs.push({ date: TODAY, results: results.filter((r) => !r.skipped) });
if (history.runs.length > 30) history.runs = history.runs.slice(-30);

writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2));
writeFileSync(join(ROOT, 'data/apis.json'), JSON.stringify(data, null, 2) + '\n');

console.log(`\n${upCount} up, ${downCount} down/degraded, ${skippedCount} skipped (auth-required or unverified).`);
process.exit(downCount > 0 ? 1 : 0);
