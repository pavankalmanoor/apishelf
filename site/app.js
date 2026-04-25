// APIShelf — main directory app
// Pure ES module, no build step. Loads /data/apis.json + categories.json.

const DATA_PATH = '../data/apis.json';
const CATS_PATH = '../data/categories.json';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const state = {
  apis: [],
  categories: [],
  filters: { quick: null, category: null, flags: new Set() },
  search: '',
  sort: 'popularity',
  selected: new Set(),
  apiKey: localStorage.getItem('apishelf:apikey') || '',
  theme: localStorage.getItem('apishelf:theme') || 'dark',
  cursor: -1,
};

const QUICK_CHIPS = [
  { id: 'browser-friendly', label: '✨ Browser-friendly', filter: (a) => a.cors && a.https && a.auth_type === 'none' },
  { id: 'no-signup', label: '🔓 No signup required', filter: (a) => a.auth_type === 'none' },
  { id: 'high-quota', label: '🚀 > 10k req/day', filter: (a) => (a.rate_limits?.per_day || 0) > 10000 || (a.rate_limits?.per_month || 0) > 300000 || (a.rate_limits?.per_day == null && a.auth_type === 'none') },
  { id: 'no-cc', label: '💳 No credit card', filter: (a) => !a.requires_credit_card },
  { id: 'verified', label: '✅ Verified live today', filter: (a) => a._meta?.verified },
];

// ---------- boot ----------
async function boot() {
  document.documentElement.dataset.theme = state.theme;
  $('.theme-icon').textContent = state.theme === 'dark' ? '☀️' : '🌙';
  setHljsTheme(state.theme);

  const [apisRaw, catsRaw] = await Promise.all([
    fetch(DATA_PATH).then((r) => r.json()),
    fetch(CATS_PATH).then((r) => r.json()),
  ]);
  state.apis = apisRaw.apis;
  state.categories = catsRaw.categories;

  renderChips();
  hydrateFromQuery();
  bindEvents();
  render();
  populateFooter();
}

const HLJS_THEMES = {
  dark: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css',
  light: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css',
};
function setHljsTheme(theme) {
  const link = document.getElementById('hljs-theme');
  if (link) link.href = HLJS_THEMES[theme] || HLJS_THEMES.dark;
}

async function populateFooter() {
  // Last health check = latest _meta.last_verified across all apis
  const dates = state.apis.map((a) => a._meta?.last_verified).filter(Boolean).sort();
  const last = dates[dates.length - 1];
  const lastEl = document.getElementById('footer-last-check');
  if (last && lastEl) lastEl.textContent = `Last health check: ${last}`;

  // Lazy contributor count from GitHub API (graceful failure)
  const contribEl = document.getElementById('footer-contributors');
  if (!contribEl) return;
  try {
    const r = await fetch('https://api.github.com/repos/pavankalmanoor/apishelf/contributors?per_page=100', {
      headers: { Accept: 'application/vnd.github+json' },
    });
    if (r.ok) {
      const list = await r.json();
      if (Array.isArray(list)) contribEl.textContent = `${list.length} contributor${list.length === 1 ? '' : 's'}`;
    } else {
      contribEl.textContent = ''; // hide gracefully
    }
  } catch {
    contribEl.textContent = '';
  }
}

// ---------- chips ----------
function renderChips() {
  const quick = $('#quick-chips');
  quick.innerHTML = QUICK_CHIPS.map((c) =>
    `<button type="button" class="chip" data-quick="${c.id}">${c.label}</button>`
  ).join('');

  const cats = $('#cat-chips');
  cats.innerHTML = state.categories.map((c) => {
    const n = state.apis.filter((a) => a.category === c.id).length;
    return `<button type="button" class="chip" data-cat="${c.id}">${c.name} <small>${n}</small></button>`;
  }).join('');
}

// ---------- url state ----------
function hydrateFromQuery() {
  const u = new URL(location.href);
  if (u.searchParams.get('q')) {
    state.search = u.searchParams.get('q');
    $('#search').value = state.search;
  }
  if (u.searchParams.get('cat')) state.filters.category = u.searchParams.get('cat');
  if (u.searchParams.get('quick')) state.filters.quick = u.searchParams.get('quick');
  for (const f of (u.searchParams.get('flags') || '').split(',').filter(Boolean)) state.filters.flags.add(f);
  if (u.searchParams.get('sort')) state.sort = u.searchParams.get('sort');
}
function syncQuery() {
  const u = new URL(location.href);
  u.search = '';
  if (state.search) u.searchParams.set('q', state.search);
  if (state.filters.category) u.searchParams.set('cat', state.filters.category);
  if (state.filters.quick) u.searchParams.set('quick', state.filters.quick);
  if (state.filters.flags.size) u.searchParams.set('flags', [...state.filters.flags].join(','));
  if (state.sort !== 'popularity') u.searchParams.set('sort', state.sort);
  history.replaceState(null, '', u);
}

// ---------- filtering ----------
function matches(a) {
  // quick chip
  if (state.filters.quick) {
    const chip = QUICK_CHIPS.find((c) => c.id === state.filters.quick);
    if (chip && !chip.filter(a)) return false;
  }
  if (state.filters.category && a.category !== state.filters.category) return false;
  // flag filters
  for (const f of state.filters.flags) {
    if (f === 'no-auth' && a.auth_type !== 'none') return false;
    if (f === 'no-cc' && a.requires_credit_card) return false;
    if (f === 'cors' && !a.cors) return false;
    if (f === 'https' && !a.https) return false;
    if (f === 'truly-free' && a.pricing_tier !== 'truly_free') return false;
    if (f === 'verified' && !a._meta?.verified) return false;
    if (f === 'docs-only' && a._meta?.verified) return false;
  }
  if (state.search) {
    const q = state.search.toLowerCase();
    const hay = (a.name + ' ' + a.description + ' ' + (a.tags || []).join(' ') + ' ' + (a.subcategory || '')).toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

function sortFn(a, b) {
  if (state.sort === 'name') return a.name.localeCompare(b.name);
  if (state.sort === 'recent') {
    return (b._meta?.last_verified || '').localeCompare(a._meta?.last_verified || '');
  }
  return (b.popularity_score || 0) - (a.popularity_score || 0);
}

// ---------- render ----------
function render() {
  $$('.chip[data-quick]').forEach((el) => el.classList.toggle('active', el.dataset.quick === state.filters.quick));
  $$('.chip[data-cat]').forEach((el) => el.classList.toggle('active', el.dataset.cat === state.filters.category));
  $$('.chip input[type=checkbox]').forEach((el) => { el.checked = state.filters.flags.has(el.dataset.filter); });

  const filtered = state.apis.filter(matches).sort(sortFn);
  $('#result-count').textContent = `${filtered.length} of ${state.apis.length} APIs`;
  $('#stat-line').textContent = `${state.apis.length} APIs across ${state.categories.length} categories.`;
  $('#empty-state').hidden = filtered.length > 0;

  const root = $('#results');
  root.innerHTML = filtered.map(renderCard).join('');
  root.querySelectorAll('.card').forEach((card) => {
    const id = card.dataset.id;
    card.querySelectorAll('.detail-trigger').forEach((el) =>
      el.addEventListener('click', (e) => { e.preventDefault(); openDetail(id); })
    );
    const tryBtn = card.querySelector('.try-btn[data-action="try"]');
    if (tryBtn) {
      tryBtn.addEventListener('click', () => runTryIt(id, tryBtn, card.querySelector('[data-try-panel]')));
    }
    card.querySelector('.compare-cb input').addEventListener('change', (e) => toggleCompare(id, e.target.checked));
  });

  syncQuery();
  updateCompareButton();
}

function renderCard(a) {
  const verifiedLabel = a._meta?.verified
    ? `<span class="badge verified" title="Live-tested ${a._meta.last_verified}">✅ verified ${a._meta.last_verified}</span>`
    : `<span class="badge docs-only" title="Requires signup; not live-tested">🔐 docs-only</span>`;
  const authBadge = a.auth_type === 'none'
    ? '<span class="badge no-auth">no auth</span>'
    : `<span class="badge">${a.auth_type.replace('_', ' ')}</span>`;
  const corsBadge = a.cors
    ? '<span class="badge cors-yes">CORS ✓</span>'
    : '<span class="badge cors-no">CORS ✗</span>';
  const httpsBadge = a.https ? '' : '<span class="badge gotcha" title="HTTP only — blocked from HTTPS pages">HTTP only</span>';
  const ccBadge = a.requires_credit_card ? '<span class="badge gotcha" title="Requires credit card">requires CC</span>' : '';

  // Tips: warnings always shown (they're the differentiator); extra info
  // tips collapse behind a "+N more" toggle so cards don't get cluttered.
  const tips = normalizeGotchas(a.gotchas);
  let tipsHtml = '';
  if (tips.length) {
    const warnings = tips.filter((t) => t.severity === 'warning');
    const infos = tips.filter((t) => t.severity === 'info');
    const visible = [...warnings, ...infos.slice(0, Math.max(0, 2 - warnings.length))];
    const hidden = tips.length - visible.length;
    tipsHtml = renderTipList(visible, { compact: true });
    if (hidden > 0) {
      tipsHtml += `<button type="button" class="tips-toggle detail-trigger" aria-label="See all ${tips.length} tips">+${hidden} more tip${hidden > 1 ? 's' : ''}</button>`;
    }
  }

  const tryEnabled = a.cors && a.https && a.auth_type === 'none' && a.health_check;

  return `
    <article class="card" data-id="${a.id}" role="listitem" tabindex="0">
      <div class="card-head">
        <h3><a href="#${a.id}" class="detail-trigger">${escapeHtml(a.name)}</a></h3>
        ${verifiedLabel}
      </div>
      <p class="desc">${escapeHtml(a.description)}</p>
      <div class="badge-row">
        ${authBadge}
        ${corsBadge}
        ${httpsBadge}
        ${ccBadge}
        <span class="badge">${a.pricing_tier.replace(/_/g, ' ')}</span>
      </div>
      ${tipsHtml}
      <div class="card-footer">
        <label class="compare-cb"><input type="checkbox" ${state.selected.has(a.id) ? 'checked' : ''} /> compare</label>
        <div class="actions">
          ${tryEnabled
            ? '<button class="try-btn" type="button" data-action="try">Try it</button>'
            : `<button class="try-btn" type="button" disabled title="${a.auth_type !== 'none' ? 'Requires authentication' : !a.cors ? 'No CORS — call from a server' : 'HTTP-only API blocked from HTTPS pages'}">Try it</button>`}
          <a href="#${a.id}" class="detail-trigger" aria-label="Show details for ${escapeHtml(a.name)}">Details →</a>
        </div>
      </div>
      <div class="try-panel" hidden data-try-panel></div>
    </article>
  `;
}

// ---------- detail modal ----------
function openDetail(id) {
  const a = state.apis.find((x) => x.id === id);
  if (!a) return;
  history.replaceState(null, '', `#${id}`);

  const cat = state.categories.find((c) => c.id === a.category);
  const exampleStatus = a._meta?.verified
    ? `<span class="badge verified">✅ verified ${a._meta.last_verified}</span>`
    : `<span class="badge docs-only">🔐 docs-only — requires signup</span>`;

  const detailGotchas = normalizeGotchas(a.gotchas);
  const warnCount = detailGotchas.filter((g) => g.severity === 'warning').length;
  const infoCount = detailGotchas.length - warnCount;
  const gotchasHtml = detailGotchas.length
    ? `<section class="tips-block" aria-label="Heads up">
         <h3>Heads up <span class="severity-marker">${warnCount ? `${warnCount} warning${warnCount > 1 ? 's' : ''}` : ''}${warnCount && infoCount ? ' · ' : ''}${infoCount ? `${infoCount} note${infoCount > 1 ? 's' : ''}` : ''}</span></h3>
         ${renderTipList(detailGotchas, { compact: false })}
       </section>`
    : '';

  const tryEnabled = a.cors && a.https && a.auth_type === 'none' && a.health_check;
  const tryHtml = tryEnabled
    ? `<div class="try-out-box">
         <button class="try-btn" id="try-btn-modal" type="button" data-action="try">▶ Try it now (live request)</button>
         <p class="hint" style="margin:.4rem 0 0; color: var(--fg-muted); font-size:.85rem;">Sends a real GET to the example endpoint from your browser.</p>
         <div class="try-panel" hidden data-try-panel></div>
       </div>`
    : `<div class="try-out-box" style="background: var(--warning-bg); border-color: var(--warning);">
         <strong>Try-it disabled.</strong>
         <span style="color: var(--fg-muted); font-size:.9rem;">${a.auth_type !== 'none' ? 'This API requires authentication.' : !a.cors ? 'This API does not support CORS — call from your server instead.' : 'This API is HTTP-only and would be blocked from HTTPS pages.'}</span>
       </div>`;

  const altHtml = (a.alternatives || []).length
    ? `<dt>Alternatives</dt><dd><div class="alt-list">${a.alternatives.map((alt) => {
        const target = state.apis.find((x) => x.id === alt);
        return target ? `<a href="#${alt}" class="alt-link" data-id="${alt}">${escapeHtml(target.name)}</a>` : `<span class="badge">${escapeHtml(alt)}</span>`;
      }).join('')}</div></dd>` : '';

  const modal = $('#detail-modal');
  $('.modal-content', modal).innerHTML = `
    <h2>${escapeHtml(a.name)} ${exampleStatus}</h2>
    <p style="color: var(--fg-muted); margin-top:0;">${escapeHtml(a.description)}</p>

    ${gotchasHtml}

    <dl class="detail-meta">
      <dt>Category</dt><dd>${escapeHtml(cat?.name || a.category)}${a.subcategory ? ' / ' + escapeHtml(a.subcategory) : ''}</dd>
      <dt>Auth</dt><dd>${a.auth_type.replace('_', ' ')}${a.signup_url ? ` — <a href="${a.signup_url}" rel="noopener" target="_blank">sign up</a>` : ''}</dd>
      <dt>Pricing</dt><dd>${a.pricing_tier.replace(/_/g, ' ')}${a.requires_credit_card ? ' <span class="badge gotcha">requires CC</span>' : ''}</dd>
      <dt>HTTPS</dt><dd>${a.https ? '✓' : '✗ HTTP only'}</dd>
      <dt>CORS</dt><dd>${a.cors ? '✓ supported' : '✗ not supported'}</dd>
      <dt>Rate limits</dt><dd>${rateLimitsText(a.rate_limits)}</dd>
      <dt>Base URL</dt><dd><code>${escapeHtml(a.base_url || '—')}</code></dd>
      <dt>Docs</dt><dd><a href="${a.docs_url}" rel="noopener" target="_blank">${escapeHtml(a.docs_url)}</a></dd>
      ${altHtml}
    </dl>

    ${tryHtml}

    <h3>Code examples ${state.apiKey ? '<small style="font-weight: normal; color: var(--fg-muted);">— with your saved API key</small>' : ''}</h3>
    <div class="snippet-tabs" role="tablist">
      ${['curl', 'javascript', 'python'].map((lang, i) => `<button type="button" class="snippet-tab ${i === 0 ? 'active' : ''}" data-lang="${lang}">${lang}</button>`).join('')}
    </div>
    ${['curl', 'javascript', 'python'].map((lang, i) => {
      const code = a.code_examples?.[lang];
      if (!code) return `<pre class="snippet snippet-${lang}" hidden style="${i === 0 ? '' : 'display:none'};">No ${lang} example provided.</pre>`;
      return renderSnippet(lang, code, i === 0);
    }).join('')}

    ${a.example_response ? `<h3>Example response</h3><pre class="snippet">${escapeHtml(a.example_response)}</pre>` : ''}
  `;

  // tab handlers
  modal.querySelectorAll('.snippet-tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      modal.querySelectorAll('.snippet-tab').forEach((t) => t.classList.toggle('active', t === btn));
      modal.querySelectorAll('.snippet[data-lang]').forEach((s) => { s.hidden = (s.dataset.lang !== btn.dataset.lang); });
    });
  });
  modal.querySelectorAll('.snippet .copy').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const code = btn.parentElement.querySelector('code').textContent;
      try { await navigator.clipboard.writeText(code); btn.classList.add('copied'); btn.textContent = 'copied!'; setTimeout(() => { btn.classList.remove('copied'); btn.textContent = 'copy'; }, 1500); } catch {}
    });
  });
  modal.querySelectorAll('.alt-link').forEach((link) => {
    link.addEventListener('click', (e) => { e.preventDefault(); openDetail(link.dataset.id); });
  });
  if (tryEnabled) {
    const btn = modal.querySelector('#try-btn-modal');
    btn.addEventListener('click', () => runTryIt(id, btn, modal.querySelector('[data-try-panel]')));
  }
  // syntax-highlight code snippets in the modal
  if (window.hljs) {
    modal.querySelectorAll('.snippet code').forEach((el) => {
      try { window.hljs.highlightElement(el); } catch {}
    });
  }

  if (typeof modal.showModal === 'function') modal.showModal();
  else modal.setAttribute('open', '');
}

function renderSnippet(lang, code, visible) {
  const sub = applyKey(code);
  const html = highlightPlaceholders(escapeHtml(sub));
  // hljs language hints. curl is bash-flavored.
  const hljsLang = lang === 'curl' ? 'bash' : lang;
  return `<pre class="snippet" data-lang="${lang}" ${visible ? '' : 'hidden'}><button class="copy" type="button">copy</button><code class="language-${hljsLang}">${html}</code></pre>`;
}

function applyKey(code) {
  if (state.apiKey) return code.replaceAll('{{API_KEY}}', state.apiKey);
  return code;
}

function highlightPlaceholders(html) {
  return html.replaceAll('{{API_KEY}}', '<span class="placeholder">{{API_KEY}}</span>');
}

function rateLimitsText(rl) {
  if (!rl) return '—';
  const bits = [];
  if (rl.per_minute) bits.push(`${rl.per_minute}/min`);
  if (rl.per_day) bits.push(`${rl.per_day.toLocaleString()}/day`);
  if (rl.per_month) bits.push(`${rl.per_month.toLocaleString()}/month`);
  let s = bits.join(', ') || '—';
  if (rl.notes) s += ` <span style="color: var(--fg-muted);">— ${escapeHtml(rl.notes)}</span>`;
  return s;
}

// ---------- try-it-out ----------
// Unified handler for both card and modal. Renders a collapsible panel
// inside the provided container with loading state, status line, and body.
async function runTryIt(id, btn, panel) {
  const a = state.apis.find((x) => x.id === id);
  if (!a?.health_check || !panel) return;

  const originalLabel = btn.textContent;
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner" aria-hidden="true"></span> Loading…';

  panel.hidden = false;
  panel.classList.add('loading');
  panel.innerHTML = `
    <div class="try-panel-head">
      <span class="status-line">Sending request…</span>
      <button class="close-btn" type="button" aria-label="Close" title="Close">×</button>
    </div>
    <pre>Loading…</pre>
  `;
  panel.querySelector('.close-btn').addEventListener('click', () => {
    panel.hidden = true;
    panel.innerHTML = '';
  });
  panel.scrollIntoView({ block: 'nearest', behavior: 'smooth' });

  let status = 0, body = '', ok = false, errored = false;
  try {
    const r = await fetch(a.health_check.url, {
      method: a.health_check.method,
      headers: a.health_check.headers || {},
    });
    status = r.status;
    ok = r.ok;
    const ct = r.headers.get('content-type') || '';
    if (ct.includes('json')) {
      body = JSON.stringify(await r.json(), null, 2);
    } else {
      const t = await r.text();
      body = t.slice(0, 1500) + (t.length > 1500 ? '\n…(truncated)' : '');
    }
  } catch (e) {
    errored = true;
    body = `Request failed: ${e.message}\n\nIf the browser console shows a CORS error, this API doesn't allow direct browser calls — copy the curl example to call it from a server.`;
  }

  panel.classList.remove('loading');
  const statusClass = errored ? 'bad' : (ok ? 'ok' : 'bad');
  const statusText = errored ? '✗ blocked' : `HTTP ${status} ${ok ? '✓' : ''}`;
  panel.innerHTML = `
    <div class="try-panel-head">
      <span class="status-line ${statusClass}">${statusText}</span>
      <button class="close-btn" type="button" aria-label="Close" title="Close">×</button>
    </div>
    <pre>${escapeHtml(body)}</pre>
  `;
  panel.querySelector('.close-btn').addEventListener('click', () => {
    panel.hidden = true;
    panel.innerHTML = '';
  });

  btn.disabled = false;
  btn.textContent = originalLabel;
}

// ---------- compare ----------
function toggleCompare(id, on) {
  if (on) state.selected.add(id); else state.selected.delete(id);
  if (state.selected.size > 4) state.selected = new Set([...state.selected].slice(-4));
  updateCompareButton();
}
function updateCompareButton() {
  const btn = $('#compare-go');
  btn.textContent = `Compare ${state.selected.size} selected →`;
  btn.disabled = state.selected.size < 2;
}

// ---------- recommender (local keyword/tag matching) ----------
function recommend() {
  const q = $('#recommend-input').value.trim().toLowerCase();
  if (!q) return;
  const tokens = q.split(/[^a-z0-9]+/).filter(Boolean);
  const scored = state.apis.map((a) => {
    const hay = (a.name + ' ' + a.description + ' ' + (a.tags || []).join(' ') + ' ' + a.category + ' ' + (a.subcategory || '')).toLowerCase();
    let score = 0;
    for (const t of tokens) if (hay.includes(t)) score += t.length > 3 ? 3 : 1;
    if (a._meta?.verified) score += 1;
    if (a.auth_type === 'none') score += 0.5;
    return { a, score };
  }).filter((x) => x.score > 0).sort((p, q) => q.score - p.score).slice(0, 8);

  if (scored.length === 0) {
    alert(`No API matched "${q}". Try shorter terms (e.g. "weather", "stock", "image").`);
    return;
  }
  state.search = '';
  $('#search').value = '';
  state.filters.quick = null;
  state.filters.category = null;
  state.filters.flags.clear();
  // pin to top by replacing list
  const ids = new Set(scored.map((s) => s.a.id));
  state.apis.sort((a, b) => Number(ids.has(b.id)) - Number(ids.has(a.id)));
  state.search = ''; // clear filters, results show full list with recommended at top
  render();
  $('#main').scrollIntoView({ behavior: 'smooth' });
}

// ---------- events ----------
function bindEvents() {
  $('#search').addEventListener('input', (e) => { state.search = e.target.value; render(); });

  $('#quick-chips').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-quick]'); if (!btn) return;
    state.filters.quick = state.filters.quick === btn.dataset.quick ? null : btn.dataset.quick;
    render();
  });
  $('#cat-chips').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-cat]'); if (!btn) return;
    state.filters.category = state.filters.category === btn.dataset.cat ? null : btn.dataset.cat;
    render();
  });
  $$('.chip input[type=checkbox]').forEach((cb) => {
    cb.addEventListener('change', () => {
      if (cb.checked) state.filters.flags.add(cb.dataset.filter);
      else state.filters.flags.delete(cb.dataset.filter);
      render();
    });
  });

  $('#sort-select').addEventListener('change', (e) => { state.sort = e.target.value; render(); });
  $('#clear-all').addEventListener('click', () => {
    state.search = ''; $('#search').value = '';
    state.filters = { quick: null, category: null, flags: new Set() };
    render();
  });

  // api key — popover toggle + input
  const keyBtn = $('#api-key-btn');
  const keyPop = $('#api-key-popover');
  const keyInput = $('#api-key-input');
  const keyStatus = $('#api-key-status');
  const refreshKeyStatus = () => {
    keyStatus.textContent = state.apiKey ? '✓ saved' : '';
    keyBtn.classList.toggle('icon-btn-text', true);
  };
  keyInput.value = state.apiKey;
  refreshKeyStatus();

  keyBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = keyPop.hidden;
    keyPop.hidden = !open;
    keyBtn.setAttribute('aria-expanded', String(open));
    if (open) keyInput.focus();
  });
  document.addEventListener('click', (e) => {
    if (!keyPop.hidden && !keyPop.contains(e.target) && e.target !== keyBtn && !keyBtn.contains(e.target)) {
      keyPop.hidden = true;
      keyBtn.setAttribute('aria-expanded', 'false');
    }
  });
  keyInput.addEventListener('input', (e) => {
    state.apiKey = e.target.value;
    if (state.apiKey) localStorage.setItem('apishelf:apikey', state.apiKey);
    else localStorage.removeItem('apishelf:apikey');
    refreshKeyStatus();
  });
  $('#api-key-clear').addEventListener('click', () => {
    state.apiKey = '';
    keyInput.value = '';
    localStorage.removeItem('apishelf:apikey');
    refreshKeyStatus();
  });

  // theme
  $('#theme-toggle').addEventListener('click', toggleTheme);

  // recommender
  $('#recommend-btn').addEventListener('click', recommend);
  $('#recommend-input').addEventListener('keydown', (e) => { if (e.key === 'Enter') recommend(); });

  // modal
  const modal = $('#detail-modal');
  $('#modal-close').addEventListener('click', () => modal.close());
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.close(); });

  // compare go
  $('#compare-go').addEventListener('click', () => {
    if (state.selected.size < 2) return;
    location.href = `compare.html?ids=${[...state.selected].join(',')}`;
  });

  // open detail from hash on load
  if (location.hash.length > 1) {
    setTimeout(() => openDetail(location.hash.slice(1)), 0);
  }

  // keyboard shortcuts
  document.addEventListener('keydown', onKey);
}

function onKey(e) {
  // ignore when typing in an input
  const tag = e.target.tagName?.toLowerCase();
  const inField = ['input', 'textarea', 'select'].includes(tag);
  if (e.key === '/' && !inField) { e.preventDefault(); $('#search').focus(); return; }
  if (e.key === 'Escape') { $('#detail-modal').close(); return; }
  if (inField) return;

  if (e.key === 't') { toggleTheme(); return; }
  const cards = $$('.card');
  if (e.key === 'j') { state.cursor = Math.min(cards.length - 1, state.cursor + 1); focusCard(cards); }
  else if (e.key === 'k') { state.cursor = Math.max(0, state.cursor - 1); focusCard(cards); }
  else if (e.key === 'Enter' && state.cursor >= 0 && cards[state.cursor]) {
    openDetail(cards[state.cursor].dataset.id);
  }
}
function focusCard(cards) {
  cards.forEach((c, i) => c.classList.toggle('focused', i === state.cursor));
  cards[state.cursor]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}

function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = state.theme;
  localStorage.setItem('apishelf:theme', state.theme);
  $('.theme-icon').textContent = state.theme === 'dark' ? '☀️' : '🌙';
  setHljsTheme(state.theme);
}

// ---------- utils ----------
function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Canonical gotcha normalizer — schema accepts string OR {severity, text}.
// Same body lives in compare.html and scripts/generate-readme.js. If you
// change one, change all three. (Strings default to severity=info.)
function normalizeGotcha(g) {
  if (typeof g === 'string') return { severity: 'info', text: g };
  return { severity: g.severity || 'info', text: g.text };
}
function normalizeGotchas(arr) {
  return (arr || []).map(normalizeGotcha);
}

// Render a list of normalized gotchas. Sorted warnings-first so blockers
// catch the eye but the styling stays subtle (not red).
function renderTipList(tips, { compact = false } = {}) {
  const sorted = [...tips].sort((a, b) => (a.severity === 'warning' ? -1 : 0) - (b.severity === 'warning' ? -1 : 0));
  const items = sorted.map((g) => {
    const icon = g.severity === 'warning' ? '⚠️' : 'ℹ️';
    const label = g.severity === 'warning' ? 'Warning' : 'Note';
    return `<li class="tip tip-${g.severity}">
      <span class="tip-icon" aria-label="${label}" title="${label}">${icon}</span>
      <span class="tip-text">${escapeHtml(g.text)}</span>
    </li>`;
  }).join('');
  return `<ul class="tips${compact ? ' tips-compact' : ''}" role="list">${items}</ul>`;
}

boot();
