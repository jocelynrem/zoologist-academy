const BASE_PATH = self.location.pathname.replace(/\/sw\.js$/, '/');
const CACHE_PREFIX = `zoologist-academy:${BASE_PATH}`;
const RUNTIME_CACHE = `${CACHE_PREFIX}runtime`;
const PRECACHE = `${CACHE_PREFIX}precache`;

const PRECACHE_URLS = [
  BASE_PATH,
  `${BASE_PATH}index.html`,
  `${BASE_PATH}manifest.webmanifest`,
  `${BASE_PATH}favicon.svg`,
  `${BASE_PATH}apple-touch-icon.png`,
  `${BASE_PATH}icon-192.png`,
  `${BASE_PATH}icon-512.png`,
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(PRECACHE)
      .then(async (cache) => {
        const existingRequests = await cache.keys();
        await Promise.all(existingRequests.map((request) => cache.delete(request)));
        await cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith('zoologist-academy:') && key !== PRECACHE && key !== RUNTIME_CACHE)
          .map((key) => caches.delete(key))
      ))
      .then(() => caches.delete(RUNTIME_CACHE))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith(`${BASE_PATH}api/`)) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          return caches.match(`${BASE_PATH}index.html`);
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        const copy = response.clone();
        caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
        return response;
      });
    })
  );
});
