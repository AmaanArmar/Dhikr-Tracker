const CACHE_NAME = 'dhikr-tracker-cache-v12';

// List of all essential local app assets
const ESSENTIAL_ASSETS = [
  '/',
  '/index.html',
  '/script.js',
  '/kibla.js',
  '/style.css',
  '/verses.json',
  '/manifest.json'
];

// Install: Cache essential local assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ESSENTIAL_ASSETS.map(path => new URL(path, self.location).href));
    }).catch((err) => console.log('Pre-cache error:', err))
  );
});

// Activate: Delete old caches and take control
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

// Fetch: Stale-While-Revalidate with full offline fallback
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // 1. Return cached version immediately if available
      if (cachedResponse) {
        // Fetch update in background if online
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => {/* Ignore network errors offline */});

        return cachedResponse;
      }

      // 2. If not in cache, try network
      return fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return networkResponse;
        })
        .catch(async () => {
          // 3. Offline fallbacks for requests not in cache
          const cache = await caches.open(CACHE_NAME);
          const allKeys = await cache.keys();

          // Match by filename fallback (e.g. style.css)
          const reqUrl = new URL(event.request.url);
          const match = allKeys.find(k => new URL(k.url).pathname.endsWith(reqUrl.pathname));
          if (match) return cache.match(match);

          // Page navigation fallback
          if (event.request.mode === 'navigate') {
            return cache.match(new URL('/index.html', self.location).href) ||
                   cache.match(allKeys.find(k => k.url.endsWith('index.html')));
          }
        });
    })
  );
});
