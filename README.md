# 📚 APIShelf

> A curated, **actually verified** directory of genuinely free APIs for developers.

![APIs](https://img.shields.io/badge/APIs-50-blue) ![Verified](https://img.shields.io/badge/verified-37-brightgreen) ![No auth](https://img.shields.io/badge/no--auth-37-success) ![No credit card](https://img.shields.io/badge/no--CC-49-success) ![License](https://img.shields.io/badge/license-MIT-lightgrey)

[**🌐 Browse the site →**](https://pavankalmanoor.github.io/apishelf/) · [submit an API](.github/ISSUE_TEMPLATE/submit-api.yml) · [contributing guide](CONTRIBUTING.md)

---

## What makes APIShelf different

- **Every no-auth API was actually called** with `curl` before listing.
- Honest **gotchas** surfaced per API (HTTP-only tier, CC-required upgrades, undocumented limits).
- CORS detection so you know which APIs work in browser-side code.
- Auto-regenerated weekly via GitHub Actions; dead APIs get demoted.
- Single `data/apis.json` is the source of truth — this README is generated from it.

## Quick stats

- **50** APIs across **8** categories
- **37** live-verified ✅, **13** documented-only 🔐 (require signup we couldn't complete)
- **37** require no auth at all
- **49** never ask for a credit card

## Categories

- [**Weather & Climate**](#weather) (6) — Forecasts, current conditions, historical climate data, and severe weather alerts.
- [**Geolocation & Maps**](#geo) (6) — Geocoding, IP lookup, country/region metadata, and mapping primitives.
- [**Finance & Crypto**](#finance) (6) — Exchange rates, cryptocurrency prices, stock market data, and economic indicators.
- [**Public & Government Data**](#public-data) (7) — Open datasets from government agencies and public-interest projects.
- [**Developer Tools**](#dev-tools) (6) — Utilities for IP, DNS, URL shortening, request inspection, and more.
- [**Random & Mock Data**](#mock-data) (6) — Fake users, placeholder content, and synthetic data for prototypes and tests.
- [**Entertainment**](#entertainment) (7) — Jokes, quotes, trivia, fictional universes, and pop culture data.
- [**AI & Machine Learning**](#ai-ml) (6) — Inference endpoints, language models, image generation, and ML utilities.

---

## Weather & Climate

<a id="weather"></a>

Forecasts, current conditions, historical climate data, and severe weather alerts.

| API | Status | Auth | CORS | Free tier | Notes |
|-----|--------|------|------|-----------|-------|
| **[OpenWeatherMap](https://openweathermap.org)** | 🔐 | api key | CORS ✓ | free with signup | ⚠️ One Call API requires CC even for free tier |
| **[Open-Meteo](https://open-meteo.com)** | ✅ | no auth | CORS ✓ | truly free | ⚠️ Free tier is non-commercial use only |
| **[US National Weather Service](https://www.weather.gov)** | ✅ | no auth | CORS ✗ | truly free | ⚠️ US territory only |
| **[wttr.in](https://wttr.in)** | ✅ | no auth | CORS ✗ | truly free | ℹ️ No CORS headers — cannot be called directly from browser JS |
| **[Visual Crossing Weather](https://www.visualcrossing.com)** | 🔐 | api key | CORS ✓ | free with signup | ⚠️ Free tier is for non-commercial use only |
| **[7Timer!](https://www.7timer.info)** | ✅ | no auth | CORS ✗ | truly free | ℹ️ No CORS |

<details><summary>Heads up — tips for Weather & Climate</summary>

**OpenWeatherMap**
- ⚠️ One Call API requires CC even for free tier
- ℹ️ New API keys can take up to 2 hours to activate
- ℹ️ Default temperature unit is Kelvin (use units=metric or imperial)

**Open-Meteo**
- ⚠️ Free tier is non-commercial use only
- ℹ️ Has a separate marine, air-quality, and historical archive at different subdomains

**US National Weather Service**
- ⚠️ US territory only
- ℹ️ Requires a User-Agent header identifying your app
- ℹ️ No CORS — proxy required for browser apps

**wttr.in**
- ℹ️ No CORS headers — cannot be called directly from browser JS
- ℹ️ Slow on first hit while it caches

**Visual Crossing Weather**
- ⚠️ Free tier is for non-commercial use only
- ℹ️ Each location-day costs 1 record

**7Timer!**
- ℹ️ No CORS
- ℹ️ Old-style CGI URL structure
- ℹ️ Forecast resolution is coarse compared to commercial APIs

</details>

## Geolocation & Maps

<a id="geo"></a>

Geocoding, IP lookup, country/region metadata, and mapping primitives.

| API | Status | Auth | CORS | Free tier | Notes |
|-----|--------|------|------|-----------|-------|
| **[Mapbox](https://www.mapbox.com)** | 🔐 | api key | CORS ✓ | freemium | ⚠️ Requires credit card for any meaningful use, even if you stay in the free tier |
| **[REST Countries](https://restcountries.com)** | ✅ | no auth | CORS ✓ | truly free | ℹ️ v2 was deprecated — make sure your URL uses /v3.1 |
| **[Nominatim (OpenStreetMap)](https://nominatim.openstreetmap.org)** | ✅ | no auth | CORS ✓ | truly free | ⚠️ Max 1 request per second — abuse will get you IP-banned |
| **[ip-api.com](https://ip-api.com)** | ✅ | no auth | CORS ✓ | truly free | ⚠️ Free tier is HTTP only — will be blocked from HTTPS pages by mixed-content policy |
| **[OpenCage Geocoding](https://opencagedata.com)** | 🔐 | api key | CORS ✓ | free with signup | ℹ️ Daily quota resets at UTC midnight, not your local timezone |
| **[ipapi.co](https://ipapi.co)** | 🔐 | no auth | CORS ✓ | free tier limited | ⚠️ Aggressive rate-limit on the free tier — 1,000/day is shared per source IP |

<details><summary>Heads up — tips for Geolocation & Maps</summary>

**Mapbox**
- ⚠️ Requires credit card for any meaningful use, even if you stay in the free tier
- ℹ️ Map tiles count separately from geocoding requests

**REST Countries**
- ℹ️ v2 was deprecated — make sure your URL uses /v3.1
- ℹ️ Use ?fields= to limit response size for performance

**Nominatim (OpenStreetMap)**
- ⚠️ Max 1 request per second — abuse will get you IP-banned
- ℹ️ Requires a User-Agent header identifying your app
- ℹ️ Self-host for higher volume

**ip-api.com**
- ⚠️ Free tier is HTTP only — will be blocked from HTTPS pages by mixed-content policy
- ℹ️ HTTPS access requires a paid Pro plan

**OpenCage Geocoding**
- ℹ️ Daily quota resets at UTC midnight, not your local timezone

**ipapi.co**
- ⚠️ Aggressive rate-limit on the free tier — 1,000/day is shared per source IP
- ℹ️ Returns 429 with a paid-plan upsell when you hit the limit

</details>

## Finance & Crypto

<a id="finance"></a>

Exchange rates, cryptocurrency prices, stock market data, and economic indicators.

| API | Status | Auth | CORS | Free tier | Notes |
|-----|--------|------|------|-----------|-------|
| **[CoinGecko](https://www.coingecko.com)** | ✅ | no auth | CORS ✓ | truly free | ℹ️ Public tier rate limits are not officially documented and shift over time |
| **[ExchangeRate-API (Open)](https://www.exchangerate-api.com)** | ✅ | no auth | CORS ✓ | truly free | ℹ️ Rates update once per day at UTC 00:00 |
| **[CoinPaprika](https://coinpaprika.com)** | ✅ | no auth | CORS ✓ | truly free | ℹ️ Coin IDs use a slug format (btc-bitcoin) — not just the symbol |
| **[Twelve Data](https://twelvedata.com)** | 🔐 | api key | CORS ✓ | free with signup | ℹ️ Real-time data limited on free tier — most quotes are 15-min delayed |
| **[Frankfurter](https://www.frankfurter.dev)** | ✅ | no auth | CORS ✓ | truly free | ℹ️ The old api.frankfurter.app domain redirects — use api.frankfurter.dev/v1 |
| **[Alpha Vantage](https://www.alphavantage.co)** | 🔐 | api key | CORS ✓ | free tier limited | ⚠️ Free tier is only 25 calls per day — extremely tight |

<details><summary>Heads up — tips for Finance & Crypto</summary>

**CoinGecko**
- ℹ️ Public tier rate limits are not officially documented and shift over time
- ℹ️ Higher quota plans (Demo/Pro) require signup and use a different host

**ExchangeRate-API (Open)**
- ℹ️ Rates update once per day at UTC 00:00
- ℹ️ The non-open endpoint requires signup and a separate key

**CoinPaprika**
- ℹ️ Coin IDs use a slug format (btc-bitcoin) — not just the symbol

**Twelve Data**
- ℹ️ Real-time data limited on free tier — most quotes are 15-min delayed

**Frankfurter**
- ℹ️ The old api.frankfurter.app domain redirects — use api.frankfurter.dev/v1
- ℹ️ Only ECB-tracked currencies are supported (~30)

**Alpha Vantage**
- ⚠️ Free tier is only 25 calls per day — extremely tight
- ⚠️ Returns 200 OK even when rate-limited, with an error message in the JSON body

</details>

## Public & Government Data

<a id="public-data"></a>

Open datasets from government agencies and public-interest projects.

| API | Status | Auth | CORS | Free tier | Notes |
|-----|--------|------|------|-----------|-------|
| **[Wikipedia REST API](https://en.wikipedia.org/api/rest_v1/)** | ✅ | no auth | CORS ✓ | truly free | ℹ️ Set a descriptive User-Agent or Wikimedia may rate-limit you |
| **[NASA APIs](https://api.nasa.gov)** | ✅ | api key | CORS ✓ | free with signup | ℹ️ DEMO_KEY is shared across the planet — for any production use, get your own free key |
| **[USGS Earthquake Catalog](https://earthquake.usgs.gov)** | ✅ | no auth | CORS ✓ | truly free | ℹ️ Maximum response size is 20,000 events per query — paginate with starttime/endtime |
| **[Open Notify (ISS)](http://open-notify.org)** | ✅ | no auth | CORS ✓ | truly free | ⚠️ HTTP only — will be blocked from HTTPS sites by mixed-content policy |
| **[FBI Wanted](https://www.fbi.gov/wanted)** | ✅ | no auth | CORS ✓ | truly free | ℹ️ pageSize maximum is 50 |
| **[Disease.sh](https://disease.sh)** | ✅ | no auth | CORS ✓ | truly free | ℹ️ Some upstream data sources stopped reporting after 2023; freshness varies by endpoint |
| **[UK Police Data](https://data.police.uk)** | ✅ | no auth | CORS ✓ | truly free | ℹ️ Data is published monthly; recent crime data has a 1-2 month lag |

<details><summary>Heads up — tips for Public & Government Data</summary>

**Wikipedia REST API**
- ℹ️ Set a descriptive User-Agent or Wikimedia may rate-limit you
- ℹ️ Each language has its own subdomain (en, fr, ja, etc.)

**NASA APIs**
- ℹ️ DEMO_KEY is shared across the planet — for any production use, get your own free key

**USGS Earthquake Catalog**
- ℹ️ Maximum response size is 20,000 events per query — paginate with starttime/endtime

**Open Notify (ISS)**
- ⚠️ HTTP only — will be blocked from HTTPS sites by mixed-content policy
- ℹ️ Run by a single volunteer; occasional downtime

**FBI Wanted**
- ℹ️ pageSize maximum is 50
- ℹ️ Image URLs in the response sometimes 404 for old cases

**Disease.sh**
- ℹ️ Some upstream data sources stopped reporting after 2023; freshness varies by endpoint

**UK Police Data**
- ℹ️ Data is published monthly; recent crime data has a 1-2 month lag

</details>

## Developer Tools

<a id="dev-tools"></a>

Utilities for IP, DNS, URL shortening, request inspection, and more.

| API | Status | Auth | CORS | Free tier | Notes |
|-----|--------|------|------|-----------|-------|
| **[httpbin.org](https://httpbin.org)** | ✅ | no auth | CORS ✗ | truly free | ℹ️ Public instance occasionally has slow response times |
| **[ipify](https://www.ipify.org)** | ✅ | no auth | CORS ✓ | truly free |  |
| **[is.gd](https://is.gd)** | ✅ | no auth | CORS ✓ | truly free | ℹ️ No way to delete or edit a created short URL |
| **[JSONbin.io](https://jsonbin.io)** | 🔐 | api key | CORS ✓ | free with signup | ℹ️ Free tier bins are public unless marked private (counts against quota differently) |
| **[DNS JSON](https://dnsjson.com)** | ✅ | no auth | CORS ✓ | truly free | ℹ️ Returns 200 OK with empty records when domain doesn't exist — check records.length |
| **[UUID Tools](https://www.uuidtools.com)** | ✅ | no auth | CORS ✓ | truly free | ℹ️ For most apps, generate UUIDs locally — calling an API for this is overkill |

<details><summary>Heads up — tips for Developer Tools</summary>

**httpbin.org**
- ℹ️ Public instance occasionally has slow response times
- ℹ️ For private/CI use, run kennethreitz/httpbin in Docker

**is.gd**
- ℹ️ No way to delete or edit a created short URL
- ℹ️ Returns errors as 200 OK with an errorcode field — check response shape

**JSONbin.io**
- ℹ️ Free tier bins are public unless marked private (counts against quota differently)

**DNS JSON**
- ℹ️ Returns 200 OK with empty records when domain doesn't exist — check records.length

**UUID Tools**
- ℹ️ For most apps, generate UUIDs locally — calling an API for this is overkill

</details>

## Random & Mock Data

<a id="mock-data"></a>

Fake users, placeholder content, and synthetic data for prototypes and tests.

| API | Status | Auth | CORS | Free tier | Notes |
|-----|--------|------|------|-----------|-------|
| **[JSONPlaceholder](https://jsonplaceholder.typicode.com)** | ✅ | no auth | CORS ✓ | truly free | ℹ️ POST/PUT/DELETE return 200/201 but don't actually persist |
| **[RandomUser.me](https://randomuser.me)** | ✅ | no auth | CORS ✓ | truly free | ℹ️ Photos are reused from a fixed pool of ~100 portraits |
| **[Lorem Picsum](https://picsum.photos)** | ✅ | no auth | CORS ✓ | truly free | ℹ️ Requests redirect (302) — follow redirects in your client |
| **[DummyJSON](https://dummyjson.com)** | ✅ | no auth | CORS ✓ | truly free | ℹ️ POSTs return a fake ID but are not persisted |
| **[Genderize.io](https://genderize.io)** | ✅ | no auth | CORS ✓ | free tier limited | ⚠️ Trained on Western name datasets — accuracy is much lower for non-Western names |
| **[Agify.io](https://agify.io)** | ✅ | no auth | CORS ✓ | free tier limited | ⚠️ Western dataset bias — non-Western names get sparse data and weaker predictions |

<details><summary>Heads up — tips for Random & Mock Data</summary>

**JSONPlaceholder**
- ℹ️ POST/PUT/DELETE return 200/201 but don't actually persist

**RandomUser.me**
- ℹ️ Photos are reused from a fixed pool of ~100 portraits
- ℹ️ Results are not deterministic — add seed= for reproducibility

**Lorem Picsum**
- ℹ️ Requests redirect (302) — follow redirects in your client
- ℹ️ Use /seed/{any-string}/200/300 for stable repeatable images

**DummyJSON**
- ℹ️ POSTs return a fake ID but are not persisted

**Genderize.io**
- ⚠️ Trained on Western name datasets — accuracy is much lower for non-Western names
- ℹ️ Returns null gender when confidence is too low

**Agify.io**
- ⚠️ Western dataset bias — non-Western names get sparse data and weaker predictions

</details>

## Entertainment

<a id="entertainment"></a>

Jokes, quotes, trivia, fictional universes, and pop culture data.

| API | Status | Auth | CORS | Free tier | Notes |
|-----|--------|------|------|-----------|-------|
| **[PokéAPI](https://pokeapi.co)** | ✅ | no auth | CORS ✓ | truly free | ℹ️ Responses are large — request only the fields you need or you'll burn through the rate limit |
| **[icanhazdadjoke](https://icanhazdadjoke.com)** | ✅ | no auth | CORS ✓ | truly free | ℹ️ Without Accept: application/json header, returns plain text instead of JSON |
| **[Rick and Morty API](https://rickandmortyapi.com)** | ✅ | no auth | CORS ✓ | truly free | ℹ️ Show ended — no new data is being added |
| **[Open Trivia DB](https://opentdb.com)** | ✅ | no auth | CORS ✓ | truly free | ℹ️ Questions are HTML-encoded by default — set encode=url3986 or decode them |
| **[Official Joke API](https://github.com/15Dkatz/official_joke_api)** | ✅ | no auth | CORS ✓ | truly free | ⚠️ Single maintainer, hosted on App Engine — has had multi-day outages historically |
| **[Studio Ghibli API](https://ghibliapi.vercel.app)** | ✅ | no auth | CORS ✓ | truly free | ℹ️ Originally hosted at ghibliapi.herokuapp.com — has migrated to Vercel |
| **[Advice Slip API](https://api.adviceslip.com)** | ✅ | no auth | CORS ✓ | truly free | ℹ️ Edge cache returns the same advice for ~2 seconds — add a cache-buster param if you need uniqueness |

<details><summary>Heads up — tips for Entertainment</summary>

**PokéAPI**
- ℹ️ Responses are large — request only the fields you need or you'll burn through the rate limit
- ℹ️ Cache locally; the data is essentially static

**icanhazdadjoke**
- ℹ️ Without Accept: application/json header, returns plain text instead of JSON
- ℹ️ Set a User-Agent for politeness

**Rick and Morty API**
- ℹ️ Show ended — no new data is being added

**Open Trivia DB**
- ℹ️ Questions are HTML-encoded by default — set encode=url3986 or decode them
- ℹ️ Use a session token to avoid getting the same question twice

**Official Joke API**
- ⚠️ Single maintainer, hosted on App Engine — has had multi-day outages historically

**Studio Ghibli API**
- ℹ️ Originally hosted at ghibliapi.herokuapp.com — has migrated to Vercel

**Advice Slip API**
- ℹ️ Edge cache returns the same advice for ~2 seconds — add a cache-buster param if you need uniqueness

</details>

## AI & Machine Learning

<a id="ai-ml"></a>

Inference endpoints, language models, image generation, and ML utilities.

| API | Status | Auth | CORS | Free tier | Notes |
|-----|--------|------|------|-----------|-------|
| **[Hugging Face Inference API](https://huggingface.co/inference-api)** | 🔐 | api key | CORS ✓ | free with signup | ⚠️ Many flagship models are now Pro-only |
| **[Google Gemini API](https://ai.google.dev)** | 🔐 | api key | CORS ✓ | free with signup | ⚠️ Free-tier inputs may be used to improve Google's models — don't send sensitive data |
| **[Groq](https://groq.com)** | 🔐 | api key | CORS ✓ | free with signup | ℹ️ Per-model rate limits — switching models won't bypass them, they're per account |
| **[Mistral AI](https://mistral.ai)** | 🔐 | api key | CORS ✓ | free with signup | ℹ️ Free tier has a default rate limit that's strict for production use |
| **[Cohere](https://cohere.com)** | 🔐 | api key | CORS ✓ | free with signup | ⚠️ Trial keys cannot be used in production deployments per ToS |
| **[Pollinations.ai](https://pollinations.ai)** | ✅ | no auth | CORS ✓ | truly free | ℹ️ Anonymous tier is queued — first request can take 10-30 sec |

<details><summary>Heads up — tips for AI & Machine Learning</summary>

**Hugging Face Inference API**
- ⚠️ Many flagship models are now Pro-only
- ℹ️ First request to a model triggers a cold start — can take 20+ seconds

**Google Gemini API**
- ⚠️ Free-tier inputs may be used to improve Google's models — don't send sensitive data
- ⚠️ Region restrictions — not available in EU on free tier as of 2025

**Groq**
- ℹ️ Per-model rate limits — switching models won't bypass them, they're per account
- ℹ️ Free models change over time; check the dashboard for current list

**Mistral AI**
- ℹ️ Free tier has a default rate limit that's strict for production use
- ℹ️ Some models require explicit opt-in in the console before they appear in API

**Cohere**
- ⚠️ Trial keys cannot be used in production deployments per ToS

**Pollinations.ai**
- ℹ️ Anonymous tier is queued — first request can take 10-30 sec
- ℹ️ Images may include the Pollinations watermark unless you use a paid tier

</details>

## How verification works

For every API marked ✅ verified, an actual HTTP request was made and the response inspected.

```
✅ verified — `curl`-tested with a successful response on the listed `last_verified` date
🔐 docs-only — requires signup we could not complete; included based on documentation
```

A weekly GitHub Action re-runs the health checks for every ✅ entry. Failures flip the status to `degraded` or `down` and reduce `uptime_percentage`. See `/status` on the live site for current health.

## Contributing

1. Read the [submission guide](CONTRIBUTING.md).
2. Either open a [submit-an-API issue](.github/ISSUE_TEMPLATE/submit-api.yml) or send a PR editing `data/apis.json` directly.
3. Validate locally with `npm run validate`.

Before adding an API, check `data/graveyard.json` — APIs that have been removed for going dead, going paid-only, or breaking their public tier.

## Local development

```bash
npm install
npm run validate          # lint apis.json against schema.json
npm run generate-readme   # regenerate this README
npm run health-check      # ping every verified API
npm run serve             # serve the site at http://localhost:8080
```

## License

MIT. See [LICENSE](LICENSE).

---

<sub>Generated from `data/apis.json` on 2026-07-27. Do not edit this file by hand — edit the JSON.</sub>

[verified-badge]: https://img.shields.io/badge/-verified-brightgreen
[docs-badge]: https://img.shields.io/badge/-docs--only-orange
