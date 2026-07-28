// Happy Alaa Service Worker — enables offline play and PWA install
const CACHE_NAME = 'happy-alaa-v1';

const FILES_TO_CACHE = [
  './game.html',
  './manifest.json',
  // Character models
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

self.addEventListener('install', (event) => {
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

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
});
