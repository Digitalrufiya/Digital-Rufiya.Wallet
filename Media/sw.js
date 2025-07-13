/* ------------------------------------------------------------------
   DRFMedia Service‑Worker  (master‑level offline cache)
   1. Pre‑cache app shell         (CORE)
   2. Cache‑first then update     (STALE‑WHILE‑REVALIDATE) for:
        • Same‑origin files
        • All IPFS gateways  (image/video)
   3. Full Range‑request support so large videos still scrub offline
   4. Auto‑trim dynamic cache to 500 MB (FIFO)
------------------------------------------------------------------ */

const CORE = [
  "/",               // index.html or media.html
  "/style.css",
  "/favicon.ico",
  // add logo.png, manifest.json, etc. here
];
const STATIC  = "core-v1";
const DYNAMIC = "dyn-v1";
const MAX_DYNAMIC_BYTES = 500 * 1024 * 1024; // 500 MB

/* ---------- install: cache shell ---------- */
self.addEventListener("install", e => {
  e.waitUntil(caches.open(STATIC).then(c => c.addAll(CORE)));
  self.skipWaiting();
});
/* ---------- activate ---------- */
self.addEventListener("activate", e => self.clients.claim());

/* ---------- fetch handler ---------- */
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;

  const url = new URL(e.request.url);
  const ipfsRE = /gateway\.pinata|cloudflare-ipfs|ipfs\.io/;
  const cacheName = (url.origin === location.origin || ipfsRE.test(url.host))
      ? DYNAMIC : null;

  if (!cacheName) return;           // let the network handle other domains

  e.respondWith(cacheFirst(e.request, cacheName));
});

/* ---------- Cache‑First then update in background ---------- */
async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);

  // RANGE support only if we have a full cached response
  if (cached && req.headers.has("range")) {
    return partialFromCache(cached, req.headers.get("range"));
  }
  if (cached) {
    refresh(req, cache);            // update in background
    return cached;
  }

  try {
    const net = await fetch(req);
    if (net.ok) {
      await cache.put(req, net.clone());
      trimCache(cache, MAX_DYNAMIC_BYTES);
    }
    return net;
  } catch {
    return cached || new Response("Offline", { status: 503 });
  }
}

/* fetch fresh copy and update cache (no await) */
function refresh(req, cache) {
  fetch(req).then(r => { if (r.ok) cache.put(req, r.clone()); });
}

/* ---------- Range helper ---------- */
async function partialFromCache(resp, rangeHeader) {
  const size = +resp.headers.get("content-length");
  const [, startStr, endStr] = /bytes=(\d+)-(\d+)?/.exec(rangeHeader) || [];
  const start = Number(startStr);
  const end   = endStr ? Number(endStr) : size - 1;

  // stream slice (memory‑efficient)
  const body = await resp.blob();
  const slice = body.slice(start, end + 1);
  return new Response(slice, {
    status: 206,
    headers: {
      "Content-Type": resp.headers.get("Content-Type") || "application/octet-stream",
      "Content-Length": end - start + 1,
      "Content-Range": `bytes ${start}-${end}/${size}`,
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=31536000"
    }
  });
}

/* ---------- Trim cache to max bytes (FIFO) ---------- */
async function trimCache(cache, maxBytes) {
  const entries = [];
  let total = 0;
  for (const req of await cache.keys()) {
    const resp = await cache.match(req);
    const len = +resp.headers.get("content-length") || 0;
    entries.push({ req, len, time: resp.headers.get("date") });
    total += len;
  }
  // sort oldest first (by 'date' header or insertion order fallback)
  entries.sort((a, b) => (a.time || 0) - (b.time || 0));

  while (total > maxBytes && entries.length) {
    const victim = entries.shift();
    await cache.delete(victim.req);
    total -= victim.len;
  }
}
