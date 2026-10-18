// sw.js - Production PWA Service Worker for Dhikr Tracker
const CACHE_NAME = 'dhikr-tracker-cache-v19';
const SITE_ORIGIN = 'https://dhikertracker.netlify.app';

// All assets mapped explicitly (supports both absolute production & relative local testing)
const ASSETS_TO_CACHE = [
  `${SITE_ORIGIN}/`,
  `${SITE_ORIGIN}/index.html`,
  `${SITE_ORIGIN}/script.js`,
  `${SITE_ORIGIN}/kibla.js`,
  `${SITE_ORIGIN}/style.css`,
  `${SITE_ORIGIN}/verses.json`,
  `${SITE_ORIGIN}/manifest.json`,
  '/',
  '/index.html',
  '/script.js',
  '/kibla.js',
  '/style.css',
  '/verses.json',
  '/manifest.json'
];

// Install Event: Cache all critical assets
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
            .catch((err) => console.warn('Failed to cache during install:', url, err));
        })
      );
    })
  );
});

// Activate Event: Purge outdated caches and take control immediately
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
    })
  );
  self.clients.claim();
});

// Fetch Event: Cache-First strategy with fallback and background update
self.addEventListener('fetch', (event) => {
  // Ignore non-GET requests (e.g., Firebase / API sync calls)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const reqUrl = new URL(event.request.url);

      // 1. Try matching exact URL or relative pathname
      let cachedResponse = await cache.match(event.request.url);
      
      if (!cachedResponse) {
        const allKeys = await cache.keys();
        const matchedKey = allKeys.find((k) => new URL(k.url).pathname === reqUrl.pathname);
        if (matchedKey) {
          cachedResponse = await cache.match(matchedKey);
        }
      }

      if (cachedResponse) {
        // Background network update (Stale-while-revalidate pattern)
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
          })
          .catch(() => {}); // Suppress network failures when offline

        return cachedResponse;
      }

      // 2. Network Fallback if not in cache
      try {
        const networkResponse = await fetch(event.request);
        if (networkResponse && networkResponse.status === 200) {
          cache.put(event.request, networkResponse.clone());
        }
        return networkResponse;
      } catch (error) {
        // 3. Navigation Fallback: If page reload fails offline, serve cached index.html
        if (event.request.mode === 'navigate') {
          return (
            await cache.match(`${SITE_ORIGIN}/index.html`) ||
            await cache.match('/index.html') ||
            await cache.match(`${SITE_ORIGIN}/`) ||
            await cache.match('/')
          );
        }
        throw error;
      }
    })()
  );
});
