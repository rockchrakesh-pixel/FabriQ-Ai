/**
 * FabriQ Asset Caching & Service Worker Manager
 * Provides client-side cache storage prefetching for high-resolution garment care assets
 * and registers an inline Service Worker for offline resilience & fast asset delivery.
 */

const CACHE_NAME = 'fabriq-assets-v1';

// Local asset caching for offline resilience & fast asset delivery
const PRIORITY_ASSETS: string[] = [];

/**
 * Prefetches high-definition garment care assets into the browser's Cache Storage
 */
export async function prefetchGarmentAssets(): Promise<void> {
  if (typeof window === 'undefined' || !('caches' in window)) return;

  try {
    const cache = await caches.open(CACHE_NAME);
    const fetchPromises = PRIORITY_ASSETS.map(async (url) => {
      try {
        const match = await cache.match(url);
        if (!match) {
          const response = await fetch(url, { mode: 'cors', cache: 'force-cache' });
          if (response.ok) {
            await cache.put(url, response);
          }
        }
      } catch {
        // Silently handle offline prefetch errors
      }
    });

    await Promise.all(fetchPromises);
    console.log('[FabriQ CacheManager] Essential assets pre-cached successfully.');
  } catch (err) {
    console.warn('[FabriQ CacheManager] Pre-cache initialization skipped:', err);
  }
}

/**
 * Registers an inline Blob Service Worker for caching and offline fallback
 */
export function registerServiceWorker(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  // Inline Service Worker Script
  const swCode = `
    const CACHE_NAME = '${CACHE_NAME}';
    self.addEventListener('install', (event) => {
      self.skipWaiting();
    });

    self.addEventListener('activate', (event) => {
      event.waitUntil(
        caches.keys().then((keys) =>
          Promise.all(
            keys.map((key) => {
              if (key !== CACHE_NAME) {
                return caches.delete(key);
              }
            })
          )
        ).then(() => self.clients.claim())
      );
    });

    self.addEventListener('fetch', (event) => {
      if (event.request.method !== 'GET') return;
      const url = new URL(event.request.url);

      // Cache image requests from Unsplash or local assets
      if (url.hostname.includes('unsplash.com') || url.pathname.endsWith('.png') || url.pathname.endsWith('.jpg')) {
        event.respondWith(
          caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            return fetch(event.request).then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                const responseClone = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
              }
              return networkResponse;
            }).catch(() => cachedResponse);
          })
        );
      }
    });
  `;

  try {
    const blob = new Blob([swCode], { type: 'application/javascript' });
    const swUrl = URL.createObjectURL(blob);

    navigator.serviceWorker
      .register(swUrl)
      .then(() => {
        console.log('[FabriQ ServiceWorker] Registered inline caching service worker.');
      })
      .catch((err) => {
        console.warn('[FabriQ ServiceWorker] Registration warning:', err);
      });
  } catch (e) {
    console.warn('[FabriQ ServiceWorker] Failed to create blob worker:', e);
  }
}

// Auto-run prefetch on idle
if (typeof window !== 'undefined') {
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(() => {
      prefetchGarmentAssets();
      registerServiceWorker();
    });
  } else {
    setTimeout(() => {
      prefetchGarmentAssets();
      registerServiceWorker();
    }, 2000);
  }
}
