const CACHE_NAME = 'dhikr-tracker-cache-v35';

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/script.js',
  '/kibla.js',
  '/style.css',
  '/verses.json',
  '/manifest.json'
];

// Install Event: Cache critical assets and take control immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

// Activate Event: Wipe out all old caches and claim clients immediately
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

// Fetch Event: Handles navigation fallbacks and cache-first asset loading
self.addEventListener('fetch', (event) => {
  // Ignore non-GET requests (e.g. Firebase Firestore/Auth network calls)
  if (event.request.method !== 'GET') return;

  // 1. Navigation Request (Cold-Start / Page reloads): Serve index.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html').then((cachedIndex) => {
        return cachedIndex || fetch(event.request).catch(() => caches.match('/'));
      })
    );
    return;
  }

  // 2. Asset Requests (CSS, JS, JSON, Images): Cache-first strategy
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Safe offline fallback for script/style requests
        if (event.request.url.includes('.js') || event.request.url.includes('.css')) {
          return new Response('/* Offline fallback */', { headers: { 'Content-Type': 'text/javascript' } });
        }
      });
    })
  );
});
