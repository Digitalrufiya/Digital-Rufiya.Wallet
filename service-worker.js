<script src="https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.umd.min.js"></script>


self.addEventListener('install', function(event) {
  console.log('Service worker installed.');
});

self.addEventListener('fetch', function(event) {
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
