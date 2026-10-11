const CACHE_NAME = 'dhikr-tracker-cache-v8';

// Converts relative paths to absolute URLs so cache keys match browser requests 100%
const getAbsoluteUrl = (path) => new URL(path, self.location).href;

const assetsToCache = [
  getAbsoluteUrl('./'),
  getAbsoluteUrl('./index.html'),
  getAbsoluteUrl('./script.js'),
  getAbsoluteUrl('./kibla.js'),
  getAbsoluteUrl('./style.css'),
  getAbsoluteUrl('./verses.json'),
  getAbsoluteUrl('./manifest.json'),
  'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js',
  'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js',
  'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// Install phase: cache all assets cleanly
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force new service worker to take control immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        assetsToCache.map((url) => {
          return fetch(url)
            .then((response) => {
              if (response.ok) {
                return cache.put(url, response);
              }
            })
            .catch((err) => console.warn('Failed to cache:', url, err));
        })
      );
    })
  );
});

// Activate phase: clean up old stale caches automatically
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Deleting old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch phase: serve from cache if offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        // If navigation request fails while offline, fall back to cached index.html
        if (event.request.mode === 'navigate') {
          return caches.match(getAbsoluteUrl('./index.html'));
        }
      });
    })
  );
});
