# Contributing to APIShelf

Thanks for considering a contribution! APIShelf only succeeds if its data stays accurate.

## Submitting an API

The fastest path is the **[submission form on the site](https://pavankalmanoor.github.io/apishelf/submit.html)** — fill in the fields and it generates a properly-shaped GitHub issue for you.

Alternatively:

1. Open a [Submit-API issue](https://github.com/pavankalmanoor/apishelf/issues/new?template=submit-api.yml).
2. Or open a PR editing `data/apis.json` directly. Use an existing entry as a template; run `npm run validate` before pushing.

### Pre-flight checklist

Before submitting, please confirm:

- [ ] The API has a **genuinely free tier** (not a 7-day trial that requires a credit card).
- [ ] It is **not in `data/graveyard.json`** (a list of removed APIs we don't want re-added).
- [ ] You included a **working** curl command (or marked it `verified: false` and `_meta.health_status: "unknown"` if you couldn't test it).
- [ ] You listed the **gotchas**: HTTP-only tier, CC requirements, undocumented quotas, broken endpoints, deprecated routes. Honest gotchas are the differentiator.

### Schema

`data/schema.json` is the authoritative shape. Required fields: `id`, `name`, `description`, `category`, `website`, `docs_url`, `auth_type`, `pricing_tier`, `https`, `tags`.

The `_meta` block (`verified`, `last_verified`, `health_status`, `uptime_percentage`, `cors_verified`) is **bot-managed** — leave it alone in PRs. The weekly health-check workflow updates it.

### IDs

`id` is a stable URL slug used in deep links. Format: lowercase, hyphen-separated, alphanumeric. **Never reuse or rename an id** without a redirect plan, since they appear in URLs people may have shared.

## The graveyard

`data/graveyard.json` lists APIs that were once in APIShelf and have since been removed. Reasons include:

- Service shut down (DNS no longer resolves)
- Free tier eliminated
- Maintainer abandoned it
- Repeatedly degraded with no recovery

If you want to re-add an API from the graveyard, please **explain in the PR description what changed**. Otherwise the same removal will likely happen again.

## Running locally

```bash
npm install
npm run validate          # lint apis.json against schema.json
npm run generate-readme   # regenerate README.md from data
npm run health-check      # ping every verified API and update _meta
npm run serve             # http://localhost:8080 — runs site/index.html
```

## Code of conduct

Be helpful. Don't list APIs you have a financial conflict with. Don't recommend APIs you wouldn't actually use yourself.

## License

By contributing, you agree your contributions are licensed under MIT.
