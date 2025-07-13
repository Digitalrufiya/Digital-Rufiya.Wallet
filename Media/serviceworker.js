/* DRFMedia Service Worker – Advanced Offline Upload & Cache */

const CORE = ["/", "/offlineupload.html", "/style.css"];
const STATIC  = "core-v1";
const DYNAMIC = "dyn-v1";

/* Precache shell files */
self.addEventListener("install", event => {
  event.waitUntil(caches.open(STATIC).then(cache => cache.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(clients.claim());
});

/* Fetch handler with cache-first + dynamic IPFS cache */
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) return response;

      return fetch(event.request).then(networkResponse => {
        if (networkResponse.ok && event.request.url.includes("/ipfs/")) {
          caches.open(DYNAMIC).then(cache => cache.put(event.request, networkResponse.clone()));
        }
        return networkResponse;
      }).catch(() => {
        return caches.match("/offlineupload.html");
      });
    })
  );
});

/* Background Sync event */
self.addEventListener("sync", event => {
  if (event.tag === "upload-posts") {
    event.waitUntil(flushQueue());
  }
});

/* === IndexedDB Helpers === */
function openDB() {
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

/* Process upload queue */
async function flushQueue() {
  const db = await openDB();
  const tx = db.transaction("uploads", "readwrite");
  const store = tx.objectStore("uploads");
  let cursor = await store.openCursor();

  while (cursor) {
    const { id, file, caption, userId } = cursor.value;
    try {
      await uploadNow(file, caption, userId);
      await store.delete(id);
      console.log("Uploaded queued post:", id);
    } catch (err) {
      console.error("Upload failed, will retry later:", err);
    }
    cursor = await cursor.continue();
  }

  db.close();
}

/* Actual upload function with Pinata + Firebase */
async function uploadNow(file, caption, userId) {
  const fd = new FormData();
  fd.append("file", file);

  // Upload to Pinata
  const pinataRes = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI4MDFmMDAxNy04YjZkLTQ2YjYtOGIwZi04Y2NkZWU5NzE4ODIiLCJlbWFpbCI6ImRpZ2l0YWxydWZpeWFAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjNkODdmOWVkOTA0ZGY4OTI2NTRjIiwic2NvcGVkS2V5U2VjcmV0IjoiYTI3OWU4ODU0ZDQ0YWY2Y2IxNzA0N2RhOThhYTc3MmExOTAyMmFhYTIwOTQ5YjEzN2Y5ZmIxMDI3YzAzYmY5ZiIsImV4cCI6MTc4MDQyMzA3Mn0.YpqewbjW7gAVyPSKYiO9Ym9QhddKc_1vm8CJIoXDQyA"
    },
    body: fd
  });

  if (!pinataRes.ok) throw new Error("Pinata upload failed");

  const { IpfsHash } = await pinataRes.json();

  // Upload metadata to Firebase RTDB via REST
  const fbRes = await fetch("https://drfsocial-23a06-default-rtdb.firebaseio.com/posts.json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      caption,
      ipfsHash: IpfsHash,
      timestamp: Date.now()
    })
  });

  if (!fbRes.ok) throw new Error("Firebase upload failed");
}
