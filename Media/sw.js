/* ──────────────────────────────────────────────────────────────
   DRFMedia  Service‑Worker  (v2.0 Heavy‑Duty)
   ▸ Precaches the shell for instant startup
   ▸ Dynamic cache: any GET from same‑origin 𝙤𝙧 IPFS gateways
   ▸ Range‑aware → large videos still scrub offline
   ▸ Auto‑trims when cache > 2 GB  (FIFO)
   ▸ Offline fallback page (optional)
   ──────────────────────────────────────────────────────────── */

const CORE = [
  "/",                    // adjust to /media.html if that’s your entry
  "/style.css",
  "/favicon.ico",
  "/offline.html"         // create one if you like; otherwise remove
];

const STATIC  = "core-v2";
const DYNAMIC = "dyn-v2";
const MAX_DYNAMIC_BYTES = 2 * 1024 * 1024 * 1024;  // 2 GB

/* ---------- install ---------- */
self.addEventListener("install", evt => {
  evt.waitUntil(caches.open(STATIC).then(c => c.addAll(CORE)));
  self.skipWaiting();
});

/* ---------- activate ---------- */
self.addEventListener("activate", evt => self.clients.claim());

/* ---------- fetch ---------- */
self.addEventListener("fetch", evt => {
  if (evt.request.method !== "GET") return;

  const url = new URL(evt.request.url);
  const ipfs = /gateway\.pinata|cloudflare-ipfs|ipfs\.io/.test(url.host);
  const same = url.origin === location.origin;
  if (!ipfs && !same) return;                       // skip 3rd‑party CDNs

  evt.respondWith(cacheLogic(evt.request, ipfs ? DYNAMIC : STATIC));
});

async function cacheLogic(req, cacheName) {
  const cache   = await caches.open(cacheName);
  const cached  = await cache.match(req);

  /* Range handling (only if already cached) */
  if (cached && req.headers.has("range")) {
    return rangeResponse(cached, req.headers.get("range"));
  }

  if (cached) {
    updateInBG(req, cache);                         // refresh quietly
    return cached;
  }

  try {                                             // network first fetch
    const net = await fetch(req);
    if (net.ok) {
      cache.put(req, net.clone());
      trim(cache, MAX_DYNAMIC_BYTES);
    }
    return net;
  } catch {                                         // offline fallback
    return cached || caches.match("/offline.html") || new Response("Offline", { status: 503 });
  }
}

/* ---- helper: refresh ---- */
function updateInBG(req, cache) {
  fetch(req).then(r => r.ok && cache.put(req, r.clone()));
}

/* ---- helper: Range slicing ---- */
async function rangeResponse(resp, range) {
  const size = +resp.headers.get("content-length");
  const [, startStr, endStr] = /bytes=(\d+)-(\d+)?/.exec(range) || [];
  const start = +startStr;
  const end   = endStr ? +endStr : size - 1;

  const blob = await resp.blob();
  const slice = blob.slice(start, end + 1);

  return new Response(slice, {
    status: 206,
    headers: {
      "Content-Type": resp.headers.get("Content-Type") || "video/mp4",
      "Content-Length": end - start + 1,
      "Content-Range": `bytes ${start}-${end}/${size}`,
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=31536000"
    }
  });
}

/* ---- helper: trim dynamic cache FIFO ---- */
async function trim(cache, maxBytes) {
  let total = 0;
  const entries = [];

  for (const request of await cache.keys()) {
    const resp = await cache.match(request);
    const len  = +resp.headers.get("content-length") || 0;
    total += len;
    entries.push({ request, len, time: new Date(resp.headers.get("date") || Date.now()) });
  }
  // Oldest first
  entries.sort((a,b) => a.time - b.time);

  while (total > maxBytes && entries.length) {
    const victim = entries.shift();
    await cache.delete(victim.request);
    total -= victim.len;
  }
}
