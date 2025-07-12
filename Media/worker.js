const CACHE_NAME = "drfmedia-cache-v1";
const OFFLINE_URL = "offline.html";

const urlsToCache = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  OFFLINE_URL
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keyList =>
      Promise.all(
        keyList.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return (
        response ||
        fetch(event.request).catch(() =>
          caches.match(OFFLINE_URL).then(fallbackResponse => {
            if (fallbackResponse) {
              return fallbackResponse;
            }
            return new Response("You are offline and the offline page is not available.", {
              status: 503,
              statusText: "Service Unavailable",
              headers: { "Content-Type": "text/plain" }
            });
          })
        )
      );
    })
  );
});
