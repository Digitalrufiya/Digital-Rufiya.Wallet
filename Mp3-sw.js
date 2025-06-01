const CACHE_NAME = 'drfm-audio-cache-v1';

self.addEventListener('install', (event) => {
  console.log('Service Worker installed 🎉');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated ✅');
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Only cache audio files
  if (request.destination === 'audio') {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        return cachedResponse || fetch(request).then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
        });
      }).catch(() => {
        // Offline fallback could go here
        console.log('Audio request failed, offline?');
      })
    );
  }
});
