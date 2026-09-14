// VendLex Kenya Service Worker for Native Android WebAPK / PWA Support
const CACHE_NAME = 'vendlex-v2';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/logo/vendlex-logo.png',
  '/logo/vendlex-icon.png',
  '/logo/favicon.svg',
  '/favicon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[VendLex SW] Cache install partial warning:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Skip API routes, chrome-extension, and non-http(s) requests
  if (url.pathname.startsWith('/api/') || !url.protocol.startsWith('http')) {
    return;
  }

  // Handle navigation requests: Network first with offline cache fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/').then((res) => res || new Response('Offline', { status: 503 }));
      })
    );
    return;
  }

  // Handle static images and logos: Cache first, fallback to network
  if (
    url.pathname.startsWith('/logo/') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico')
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((networkRes) => {
          if (networkRes.status === 200) {
            const resClone = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
          }
          return networkRes;
        }).catch(() => new Response('', { status: 404 }));
      })
    );
    return;
  }

  // Standard requests
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
