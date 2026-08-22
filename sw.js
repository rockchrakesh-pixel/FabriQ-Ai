// FabriQ AI Atelier - Service Worker for Offline Catalog & Order History Caching

const CACHE_NAME = 'fabriq-atelier-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// Offline fallback catalog items
const FALLBACK_CATALOG = [
  { id: '1', name: 'Italian Silk Saree Dry Clean', category: 'Dry Cleaning', price: 450, turnaround: '24 Hours' },
  { id: '2', name: 'Bespoke Executive Suit Care', category: 'Suit Care', price: 650, turnaround: '48 Hours' },
  { id: '3', name: 'Luxury Sneaker & Leather Spa', category: 'Shoe Spa', price: 500, turnaround: '3 Days' },
  { id: '4', name: 'Vacuum Steam Press - Formals', category: 'Steam Ironing', price: 45, turnaround: 'Same Day' },
  { id: '5', name: 'Eco Hydro Wash & Fold', category: 'Wash & Fold', price: 89, turnaround: '24 Hours' }
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Pre-cache static shell & fallback catalog data
      cache.put('/offline-catalog.json', new Response(JSON.stringify(FALLBACK_CATALOG), {
        headers: { 'Content-Type': 'application/json' }
      }));
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch background update to keep cache fresh
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
            }
          })
          .catch(() => { /* Offline fallback silently active */ });
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
          return networkResponse;
        })
        .catch(() => {
          // If offline and fetching catalog or API data, return offline response
          if (event.request.url.includes('/offline-catalog.json') || event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/index.html');
          }
          return new Response(JSON.stringify({ offline: true, message: 'Currently browsing cached FabriQ data offline' }), {
            headers: { 'Content-Type': 'application/json' }
          });
        });
    })
  );
});
