self.addEventListener("install", event => {
  console.log("Service Worker installed.");
  event.waitUntil(
    caches.open("drf-wallet-cache").then(cache => {
      return cache.addAll([
        "/index.html",
        "/wallet.html",
        "/swap.html",
        "/send.html",
        "/dashboard.html",
        "/style.css",
        "/app.js"
      ]);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
