/**
 * Kindle-Reflow Service Worker v3
 * Strategy: Cache-first for static assets, network-first for navigation
 */

const CACHE_V = 'kindle-reflow-v3';

const PRECACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/assets/gallery/gallery-1.jpg',
  '/assets/gallery/gallery-2.jpg',
  '/assets/gallery/gallery-3.jpg',
  '/assets/gallery/gallery-4.jpg',
  '/assets/gallery/gallery-5.jpg',
];

// ── Install: pre-cache core assets ──────────────────────────────────────────
self.addEventListener('install', (evt) => {
  evt.waitUntil(
    caches.open(CACHE_V)
      .then((c) => c.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: remove old caches ──────────────────────────────────────────────
self.addEventListener('activate', (evt) => {
  evt.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_V).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (evt) => {
  const req = evt.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Skip browser-extension requests
  if (!url.protocol.startsWith('http')) return;

  // Google Fonts — stale-while-revalidate
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    evt.respondWith(staleWhileRevalidate(req));
    return;
  }

  // HTML navigation — network first, fall back to cached /index.html
  if (req.mode === 'navigate') {
    evt.respondWith(
      fetch(req)
        .then((res) => { cache(req, res.clone()); return res; })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Everything else on same origin — cache first
  evt.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => { cache(req, res.clone()); return res; });
    })
  );
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function cache(req, res) {
  if (!res || res.status !== 200 || res.type === 'opaque') return;
  caches.open(CACHE_V).then((c) => c.put(req, res));
}

function staleWhileRevalidate(req) {
  return caches.open(CACHE_V).then((c) =>
    c.match(req).then((cached) => {
      const fresh = fetch(req).then((res) => { c.put(req, res.clone()); return res; });
      return cached || fresh;
    })
  );
}
