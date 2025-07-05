const CACHE_NAME = 'quran-intel-cache-v1';
const CACHE_FILES = [
  './',
  './index.html',  // Adjust if your file name is different
  './sw.js',
  // Include any CSS/JS files here if separated
];

// Install event - cache files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CACHE_FILES);
    })
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(resp => {
      return resp || fetch(event.request).then(response => {
        // Optional: cache new requests dynamically if needed
        return response;
      });
    }).catch(() => {
      // Fallback if offline and no cache
      if (event.request.mode === 'navigate') {
        return caches.match('./');
      }
    })
  );
});
