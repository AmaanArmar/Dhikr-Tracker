const CACHE_NAME = 'dhikr-tracker-cache-v14';
const SITE_ORIGIN = 'https://dhikertracker.netlify.app';

// Explicit absolute URLs matching your exact Netlify domain
const ESSENTIAL_ASSETS = [
  `${SITE_ORIGIN}/`,
  `${SITE_ORIGIN}/index.html`,
  `${SITE_ORIGIN}/script.js`,
  `${SITE_ORIGIN}/kibla.js`,
  `${SITE_ORIGIN}/style.css`,
  `${SITE_ORIGIN}/verses.json`,
  `${SITE_ORIGIN}/manifest.json`
];

// Install: Cache each asset explicitly by its full URL
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

// Activate: Clean old caches and take control instantly
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

// Fetch: Match requests using exact full URLs
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request.url).then((cachedResponse) => {
      if (cachedResponse) {
        // Background update when online
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request.url, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }

      // Fallback to network if not in cache
      return fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request.url, responseClone));
          }
          return networkResponse;
        })
        .catch(async () => {
          // Offline fallback
          const cache = await caches.open(CACHE_NAME);
          const reqUrl = new URL(event.request.url);
          const allKeys = await cache.keys();
          
          const match = allKeys.find(req => new URL(req.url).pathname.endsWith(reqUrl.pathname));
          if (match) return cache.match(match);

          if (event.request.mode === 'navigate') {
            return cache.match(`${SITE_ORIGIN}/index.html`);
          }
        });
    })
  );
});
