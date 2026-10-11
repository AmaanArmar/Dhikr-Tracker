const CACHE_NAME = 'dhikr-tracker-cache-v10';

// Core files to ensure are ready immediately
const CORE_ASSETS = [
  './',
  './index.html',
  './script.js',
  './kibla.js',
  './style.css',
  './verses.json',
  './manifest.json'
];

// Install event: cache core assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS.map(url => new URL(url, self.location).href));
    }).catch(err => console.log('Install cache error:', err))
  );
});

// Activate event: clean up any old caches automatically
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

// Fetch event: Network-First with automatic dynamic runtime caching & offline fallback
self.addEventListener('fetch', (event) => {
  // Only handle GET requests (skip Firebase POST/PUT sync calls)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // If the network fetch succeeds, clone it and save it to our cache dynamically!
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // If network fails (Wi-Fi/data turned off), grab it from the cache!
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Fallback for page navigation when offline
          if (event.request.mode === 'navigate') {
            return caches.match(new URL('./index.html', self.location).href);
          }
        });
      })
  );
});
