/**
 * Kindle-Reflow Service Worker
 * Strategy: Cache-First for assets, Network-First for navigation
 */

const CACHE_NAME = 'kindle-reflow-v2';
const STATIC_CACHE = 'kindle-reflow-static-v2';
const DYNAMIC_CACHE = 'kindle-reflow-dynamic-v2';

// Core assets to pre-cache on install
const PRECACHE_URLS = [
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

// ── Install ──────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    }).then(() => self.skipWaiting())
  );
});

// ── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  const allowedCaches = [STATIC_CACHE, DYNAMIC_CACHE];
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => !allowedCaches.includes(name))
          .map((name) => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and chrome-extension
  if (request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;

  // Navigation requests → Network first, fallback to cached index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Google Fonts → Cache first (stale-while-revalidate)
  if (url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com') {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request).then((response) => {
          caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, response.clone()));
          return response;
        });
        return cached || fetchPromise;
      })
    );
    return;
  }

  // Local assets → Cache first, then network
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, response.clone()));
          }
          return response;
        });
      })
    );
    return;
  }

  // All else → network with dynamic cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          caches.open(DYNAMIC_CACHE).then((cache) => cache.put(request, response.clone()));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
