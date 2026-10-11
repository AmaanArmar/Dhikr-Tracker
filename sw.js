const CACHE_NAME = 'dhikr-tracker-cache-v17';
const SITE_ORIGIN = 'https://dhikertracker.netlify.app';

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/script.js',
  '/kibla.js',
  '/style.css',
  '/verses.json',
  '/manifest.json'
];

// Install Event
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate Event
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

// Fetch Event: Handles Cold-Start Offline Launch
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Fix for Cold Starts: If navigating to the app page, serve index.html directly
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html').then((cachedIndex) => {
        return cachedIndex || fetch(event.request).catch(() => caches.match('/'));
      })
    );
    return;
  }

  // Cache-First strategy for CSS, JS, Images, and JSON
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
      });
    })
  );
});
