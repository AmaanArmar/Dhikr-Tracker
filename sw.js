const CACHE_NAME = 'dhikr-tracker-cache-v13';

const ESSENTIAL_ASSETS = [
  './',
  './index.html',
  './script.js',
  './kibla.js',
  './style.css',
  './verses.json',
  './manifest.json'
];

// Install: Cache each asset individually (safe from atomic failures)
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        ESSENTIAL_ASSETS.map(url => {
          return fetch(url).then(response => {
            if (response.ok) {
              return cache.put(url, response);
            }
          }).catch(err => console.warn('Failed to pre-cache:', url, err));
        })
      );
    })
  );
});

// Activate: Clear old caches and take control
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

// Fetch: URL-string matching to prevent header mismatch bugs
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request.url).then((cachedResponse) => {
      // 1. If found in cache, return it immediately (and update in background if online)
      if (cachedResponse) {
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request.url, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }

      // 2. Otherwise, fetch from network and cache it dynamically
      return fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request.url, responseClone));
          }
          return networkResponse;
        })
        .catch(async () => {
          // 3. Offline fallbacks
          const cache = await caches.open(CACHE_NAME);
          
          // Fallback matching by pathname ending (e.g. style.css)
          const reqUrl = new URL(event.request.url);
          const allKeys = await cache.keys();
          const match = allKeys.find(req => new URL(req.url).pathname.endsWith(reqUrl.pathname));
          if (match) return cache.match(match);

          // Page navigation fallback
          if (event.request.mode === 'navigate') {
            return cache.match('./index.html');
          }
        });
    })
  );
});
