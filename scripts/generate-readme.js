#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const data = JSON.parse(readFileSync(join(ROOT, 'data/apis.json'), 'utf8'));
const cats = JSON.parse(readFileSync(join(ROOT, 'data/categories.json'), 'utf8'));

const total = data.apis.length;
const verified = data.apis.filter((a) => a._meta?.verified).length;
const noAuth = data.apis.filter((a) => a.auth_type === 'none').length;
const noCC = data.apis.filter((a) => !a.requires_credit_card).length;

const escape = (s) => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');
// Canonical gotcha normalizer — same body in site/app.js and site/compare.html.
const normalizeGotcha = (g) => typeof g === 'string'
  ? { severity: 'info', text: g }
  : { severity: g.severity || 'info', text: g.text };
const tipIcon = (sev) => (sev === 'warning' ? '⚠️' : 'ℹ️');
const verifiedBadge = (e) => (e._meta?.verified ? '![verified][verified-badge]' : '![docs-only][docs-badge]');
const corsBadge = (e) => (e.cors ? 'CORS ✓' : 'CORS ✗');
const authBadge = (e) => {
  switch (e.auth_type) {
    case 'none': return 'no auth';
    case 'api_key': return 'api key';
    case 'oauth': return 'oauth';
    default: return e.auth_type;
  }
};

let md = '';

md += '# 📚 APIShelf\n\n';
md += '> A curated, **actually verified** directory of genuinely free APIs for developers.\n\n';
md += `![APIs](https://img.shields.io/badge/APIs-${total}-blue) `;
md += `![Verified](https://img.shields.io/badge/verified-${verified}-brightgreen) `;
md += `![No auth](https://img.shields.io/badge/no--auth-${noAuth}-success) `;
md += `![No credit card](https://img.shields.io/badge/no--CC-${noCC}-success) `;
md += '![License](https://img.shields.io/badge/license-MIT-lightgrey)\n\n';
md += '[**🌐 Browse the site →**](https://pavankalmanoor.github.io/apishelf/) ';
md += '· [submit an API](.github/ISSUE_TEMPLATE/submit-api.yml) ';
md += '· [contributing guide](CONTRIBUTING.md)\n\n';
md += '---\n\n';

md += '## What makes APIShelf different\n\n';
md += '- **Every no-auth API was actually called** with `curl` before listing.\n';
md += '- Honest **gotchas** surfaced per API (HTTP-only tier, CC-required upgrades, undocumented limits).\n';
md += '- CORS detection so you know which APIs work in browser-side code.\n';
md += '- Auto-regenerated weekly via GitHub Actions; dead APIs get demoted.\n';
md += '- Single `data/apis.json` is the source of truth — this README is generated from it.\n\n';

md += '## Quick stats\n\n';
md += `- **${total}** APIs across **${cats.categories.length}** categories\n`;
md += `- **${verified}** live-verified ✅, **${total - verified}** documented-only 🔐 (require signup we couldn't complete)\n`;
md += `- **${noAuth}** require no auth at all\n`;
md += `- **${noCC}** never ask for a credit card\n\n`;

md += '## Categories\n\n';
for (const cat of cats.categories) {
  const count = data.apis.filter((a) => a.category === cat.id).length;
  md += `- [**${cat.name}**](#${cat.id}) (${count}) — ${cat.description}\n`;
}
md += '\n---\n\n';

for (const cat of cats.categories) {
  const entries = data.apis.filter((a) => a.category === cat.id).sort((a, b) => (b.popularity_score || 0) - (a.popularity_score || 0));
  md += `## ${cat.name}\n\n<a id="${cat.id}"></a>\n\n${cat.description}\n\n`;
  md += '| API | Status | Auth | CORS | Free tier | Notes |\n';
  md += '|-----|--------|------|------|-----------|-------|\n';
  for (const e of entries) {
    const statusIcon = e._meta?.verified ? '✅' : '🔐';
    const auth = authBadge(e);
    const cors = corsBadge(e);
    const tier = e.pricing_tier.replace(/_/g, ' ');
    // Surface the most-severe tip (warning beats info) in the table.
    const tips = (e.gotchas || []).map(normalizeGotcha);
    const lead = tips.find((t) => t.severity === 'warning') || tips[0];
    const tipCell = lead ? `${tipIcon(lead.severity)} ${escape(lead.text)}` : '';
    md += `| **[${escape(e.name)}](${e.website})** | ${statusIcon} | ${auth} | ${cors} | ${tier} | ${tipCell} |\n`;
  }
  md += '\n';

  // Heads-up section: warnings first, then info, in a collapsible block.
  const withTips = entries.filter((e) => (e.gotchas || []).length > 0);
  if (withTips.length > 0) {
    md += `<details><summary>Heads up — tips for ${cat.name}</summary>\n\n`;
    for (const e of withTips) {
      const tips = e.gotchas.map(normalizeGotcha)
        .sort((a, b) => (a.severity === 'warning' ? -1 : 0) - (b.severity === 'warning' ? -1 : 0));
      md += `**${e.name}**\n`;
      for (const t of tips) md += `- ${tipIcon(t.severity)} ${t.text}\n`;
      md += '\n';
    }
    md += '</details>\n\n';
  }
}

md += '## How verification works\n\n';
md += 'For every API marked ✅ verified, an actual HTTP request was made and the response inspected.\n\n';
md += '```\n';
md += '✅ verified — `curl`-tested with a successful response on the listed `last_verified` date\n';
md += '🔐 docs-only — requires signup we could not complete; included based on documentation\n';
md += '```\n\n';
md += 'A weekly GitHub Action re-runs the health checks for every ✅ entry. Failures flip the status to `degraded` or `down` and reduce `uptime_percentage`. See `/status` on the live site for current health.\n\n';

md += '## Contributing\n\n';
md += '1. Read the [submission guide](CONTRIBUTING.md).\n';
md += '2. Either open a [submit-an-API issue](.github/ISSUE_TEMPLATE/submit-api.yml) or send a PR editing `data/apis.json` directly.\n';
md += '3. Validate locally with `npm run validate`.\n\n';
md += 'Before adding an API, check `data/graveyard.json` — APIs that have been removed for going dead, going paid-only, or breaking their public tier.\n\n';

md += '## Local development\n\n';
md += '```bash\n';
md += 'npm install\n';
md += 'npm run validate          # lint apis.json against schema.json\n';
md += 'npm run generate-readme   # regenerate this README\n';
md += 'npm run health-check      # ping every verified API\n';
md += 'npm run serve             # serve the site at http://localhost:8080\n';
md += '```\n\n';

md += '## License\n\n';
md += 'MIT. See [LICENSE](LICENSE).\n\n';

md += '---\n\n';
md += `<sub>Generated from \`data/apis.json\` on ${new Date().toISOString().slice(0, 10)}. Do not edit this file by hand — edit the JSON.</sub>\n\n`;
md += '[verified-badge]: https://img.shields.io/badge/-verified-brightgreen\n';
md += '[docs-badge]: https://img.shields.io/badge/-docs--only-orange\n';

writeFileSync(join(ROOT, 'README.md'), md);
console.log(`✓ Wrote README.md (${md.length} bytes, ${data.apis.length} entries across ${cats.categories.length} categories)`);
