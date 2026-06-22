const CACHE_NAME = 'gejor-sound-v2';
const CORE_ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/script.js',
  './manifest.webmanifest',
  './assets/favicon.png',
  './assets/logo-gejor.webp',
  './assets/logo-gejor.jpg',
  './assets/carro-classico-gejor.webp',
  './assets/carro-preto-gejor.webp',
  './assets/instalacao-stetsom.webp',
  './assets/projeto-paredao-som.webp',
  './assets/projeto-player-voltimetro.webp'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) return;
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match('./index.html')))
  );
});
