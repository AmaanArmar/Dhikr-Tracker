const CACHE_NAME = 'dhikr-tracker-cache-v3';
const assetsToCache = [
  './',
  './index.html',
  './script.js',
  './verses.json',
  'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js',
  'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js',
  'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// Install and cache files safely (one failure won't crash the rest)
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force browser to activate this worker immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        assetsToCache.map(url => {
          return fetch(url).then(response => {
            if (response.ok) {
              return cache.put(url, response);
            }
          }).catch(err => console.warn('Skipping cache for:', url, err));
        })
      );
    })
  );
});

// Take control of the page immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Serve cached files when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
