const CACHE_NAME = 'dhikr-tracker-cache-v24'; // Bump this number up

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/script.js',
  '/kibla.js',
  '/style.css',
  '/verses.json',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Handle Navigation (HTML pages)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html').then((cachedIndex) => {
        return cachedIndex || fetch(event.request).catch(() => caches.match('/'));
      })
    );
    return;
  }

  // Standard Cache-First for assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then((networkResponse) => {
        return networkResponse;
      }).catch(() => {
        // Only fallback to index.html if it's not a script/style request
        if (event.request.url.includes('.js') || event.request.url.includes('.css')) {
          return new Response('/* Offline fallback */', { headers: { 'Content-Type': 'text/javascript' } });
        }
        return caches.match('/index.html');
      });
    })
  );
});
