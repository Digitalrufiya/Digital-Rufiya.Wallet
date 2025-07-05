const CACHE_NAME = 'quran-intel-cache-v1';
const FILES_TO_CACHE = [
  '/',
  '/index.html',  // Adjust if your main file has a different name
  // Add your CSS, JS, and any assets used:
  '/style.css',
  // Inline CSS in your example, so no external CSS here, but add if any
  // If you split JS in a separate file, add here:
  // '/app.js',
  // Add fonts, icons, images if any
];

// Install event - cache everything
self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[ServiceWorker] Caching app shell and content');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate event - cleanup old caches if any
self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keyList =>
      Promise.all(
        keyList.map(key => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch event - serve cached content first, fallback to network
self.addEventListener('fetch', evt => {
  if (evt.request.method !== 'GET') return; // Only GET requests

  evt.respondWith(
    caches.match(evt.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(evt.request)
        .then(response => {
          // Optionally cache new files dynamically
          return caches.open(CACHE_NAME).then(cache => {
            // Don't cache POST requests or opaque responses like cross-origin fonts
            if (
              response.status === 200 &&
              evt.request.url.startsWith(self.location.origin)
            ) {
              cache.put(evt.request, response.clone());
            }
            return response;
          });
        })
        .catch(() => {
          // Optional: return a fallback offline page or message
          // return caches.match('/offline.html');
        });
    })
  );
});
