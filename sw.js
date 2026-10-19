const CACHE_NAME = 'safecards-pwa-v1';
const ASSETS = [
  './',
  './index.html',
  './app-supabase.js',
  './styles.css',
  './manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  // Network first for API/Supabase calls, Cache fallback for static assets
  if (e.request.url.includes('supabase.co')) {
    return; // Pass through to network
  }
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
