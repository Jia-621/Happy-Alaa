// Happy Alaa Service Worker — v17
const CACHE_NAME = 'happy-alaa-v17';

const FILES_TO_CACHE = [
  './game.html',
  './manifest.json',
  'Character Model/Blue-white/normal.png',
  'Character Model/Blue-white/sad.png',
  'Character Model/Blue-white/happy.png',
  'Character Model/Blue-white/happiness.png',
  'Character Model/Blue-white/big happines.png',
  'Character Model/Blue-white/angry.png',
  'Character Model/Blue-white/shock.png',
  'Character Model/Blue-white/good.png',
  'Character Model/Blue-white/back view.png',
  'Character Model/Blue-white/clothing.png',
  'Character Model/Pink-white/normal.png',
  'Character Model/Pink-white/sad.png',
  'Character Model/Pink-white/happy.png',
  'Character Model/Pink-white/happiness.png',
  'Character Model/Pink-white/big happines.png',
  'Character Model/Pink-white/angry.png',
  'Character Model/Pink-white/shock.png',
  'Character Model/Pink-white/good.png',
  'Character Model/Pink-white/back view.png',
  'Character Model/Pink-white/clothing.png',
  'Character Model/Best_friend/big happy.png',
  'Character Model/Best_friend/back view.png',
  'Character Model/Black-white/clothing.png',
  'Character Model/Black-white/special background.png',
  'Character Model/Black-black/clothing.png',
  'Character Model/Brown-white/clothing.png',
  'Character Model/Brown-white/special background.png',
];

// Install: cache assets, take over immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.allSettled(
        FILES_TO_CACHE.map((url) =>
          cache.add(url).catch((err) => console.log('Cache miss:', url, err))
        )
      );
    })
  );
});

// Activate: claim all clients, delete old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      await clients.claim();
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)));
    })()
  );
});

// Network-first for HTML, cache-first for everything else
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  // HTML files: always try network first
  if (req.headers.get('accept') && req.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(req).then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }

  // Other assets: cache-first
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});
