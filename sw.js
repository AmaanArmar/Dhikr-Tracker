const CACHE_NAME = 'dhikr-tracker-cache-v2';
const assetsToCache = [
  './',
  './index.html',
  './script.js',
  './style.css',
  './verses.json',
  'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js',
  'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js',
  'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// Install Service Worker and cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(assetsToCache);
    })
  );
});

// Serve cached
