// APIShelf service worker.
//
// Strategy:
//   - shell (HTML/CSS/JS): network-first, fall back to cache.
//     Why: cache-first made code updates invisible — users would see stale
//     app.js/styles.css indefinitely until they manually unregistered the SW.
//     Network-first means a working network always serves fresh code; the
//     cache is only used when offline.
//   - data (apis.json, categories.json, history/uptime.json): network-first,
//     fall back to cache. Same as before.
//
// Bump CACHE on any breaking change so the activate handler purges old caches.
const CACHE = 'apishelf-v3';
const PRECACHE = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './status.html',
  './compare.html',
  './submit.html',
  '../data/apis.json',
  '../data/categories.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

const networkFirst = async (request) => {
  try {
    const res = await fetch(request);
    if (res && res.status === 200) {
      const clone = res.clone();
      caches.open(CACHE).then((c) => c.put(request, clone)).catch(() => {});
    }
    return res;
  } catch {
    const hit = await caches.match(request);
    if (hit) return hit;
    throw new Error('offline and not in cache');
  }
};

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;
  if (event.request.method !== 'GET') return;
  event.respondWith(networkFirst(event.request));
});
