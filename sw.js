const CACHE_NAME = 'dhikr-tracker-cache-v18';

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/script.js',
  '/kibla.js',
  '/style.css',
  '/verses.json',
  '/manifest.json'
];

// Install Event: Cache only core static assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate Event: Clean up all older cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Cache-First for core files, network fallback for dynamic requests without storing bloat
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Handle Navigation / Cold Starts
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html').then((cachedIndex) => {
        return cachedIndex || fetch(event.request).catch(() => caches.match('/'));
      })
    );
    return;
  }

  // Standard Cache-First for local assets, network-only for external SDKs/Firebase to save storage
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        // Fallback if offline and asset isn't pre-cached
        return caches.match('/index.html');
      });
    })
  );
});
