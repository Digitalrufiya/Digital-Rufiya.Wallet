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
      Promise.all(keyList.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request).catch(() => caches.match(OFFLINE_URL)))
  );
});

// Background Sync event for uploads
self.addEventListener("sync", function(event) {
  if (event.tag === "upload-posts") {
    event.waitUntil(processUploadQueue());
  }
});

// Function to process queued uploads
async function processUploadQueue() {
  const db = await openIndexedDB();
  const tx = db.transaction("uploads", "readwrite");
  const store = tx.objectStore("uploads");
  const allUploads = await store.getAll();

  for (const upload of allUploads) {
    try {
      // Perform your upload logic here, e.g., upload to Pinata API
      await uploadFileToPinata(upload.file, upload.caption, upload.userId);
      await store.delete(upload.id); // remove from queue on success
    } catch (err) {
      console.error("Upload failed for queued file:", err);
      // Keep in queue for next retry
    }
  }
  await tx.complete;
  db.close();
}

// IndexedDB open helper (simplified)
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("drfmediaDB", 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("uploads")) {
        db.createObjectStore("uploads", { keyPath: "id", autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Dummy upload function example (replace with your actual upload logic)
async function uploadFileToPinata(file, caption, userId) {
  // Build FormData and fetch Pinata API as in your current uploadForm event
  // ...
}
