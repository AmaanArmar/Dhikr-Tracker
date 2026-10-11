const CACHE_NAME = 'dhikr-tracker-cache-v15';
const SITE_ORIGIN = 'https://dhikertracker.netlify.app';

// All assets mapped explicitly to absolute origin
const ASSETS_TO_CACHE = [
  `${SITE_ORIGIN}/`,
  `${SITE_ORIGIN}/index.html`,
  `${SITE_ORIGIN}/script.js`,
  `${SITE_ORIGIN}/kibla.js`,
  `${SITE_ORIGIN}/style.css`,
  `${SITE_ORIGIN}/verses.json`,
  `${SITE_ORIGIN}/manifest.json`
];

// Install: Store every asset under clean absolute keys
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        ASSETS_TO_CACHE.map((url) => {
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

// Activate: Delete all older caches (v1 through v14) and take control immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('Cleaning old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Listener: CACHE-FIRST for immediate offline rendering
self.addEventListener('fetch', (event) => {
  // Ignore non-GET requests (Firebase/Sync)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const reqUrl = new URL(event.request.url);

      // 1. Try matching the exact URL or the relative pathname (e.g., /style.css)
      let cachedResponse = await cache.match(event.request.url);
      
      if (!cachedResponse) {
        // Fallback search: Match by pathname ending
        const allKeys = await cache.keys();
        const matchedKey = allKeys.find((k) => new URL(k.url).pathname === reqUrl.pathname);
        if (matchedKey) {
          cachedResponse = await cache.match(matchedKey);
        }
      }

      // 2. CACHE-FIRST: If found in local memory, return immediately!
      if (cachedResponse) {
        // Optionally update in background if online
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request.url, networkResponse);
            }
          })
          .catch(() => {}); // Suppress network failures offline
        return cachedResponse;
      }

      // 3. NETWORK FALLBACK: If not in cache, try fetching from network
      try {
        const networkResponse = await fetch(event.request);
        if (networkResponse && networkResponse.status === 200) {
          cache.put(event.request.url, networkResponse.clone());
        }
        return networkResponse;
      } catch (error) {
        // 4. NAVIGATION FALLBACK: If page reload fails offline, deliver cached index.html
        if (event.request.mode === 'navigate') {
          return (
            (await cache.match(`${SITE_ORIGIN}/index.html`)) ||
            (await cache.match(`${SITE_ORIGIN}/`))
          );
        }
      }
    })()
  );
});
