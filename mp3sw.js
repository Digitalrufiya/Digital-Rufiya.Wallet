const CACHE_NAME = 'drfm-mp3-cache-v1';
const OFFLINE_URLS = [
  '/',
  '/mp3.html',
  '/mp3player.html',
  '/mp3.css',
  '/manifest.json'
];

// Install Service Worker and cache core files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_URLS);
    })
  );
  self.skipWaiting();
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) =>
      Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch and cache dynamic IPFS audio and app files
self.addEventListener('fetch', (event) => {
  const request = event.request;

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // If found in cache, return it
      if (cachedResponse) {
        return cachedResponse;
      }

      // Otherwise, fetch from network and cache it if it’s IPFS or asset
      return fetch(request)
        .then((response) => {
          const cloned = response.clone();

          // Cache IPFS audio and files only
          if (
            request.url.includes('ipfs.io/ipfs/') ||
            OFFLINE_URLS.some(url => request.url.includes(url))
          ) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, cloned);
            });
          }

          return response;
        })
        .catch(() => {
          // Fallback message if offline and not cached
          if (request.destination === 'document') {
            return caches.match('/mp3.html');
          }
        });
    })
  );
});
