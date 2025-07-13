const CORE = ["/", "/style.css"];          // add logo.png etc.
self.addEventListener("install", e => {
  e.waitUntil(caches.open("core-v1").then(c => c.addAll(CORE)));
  self.skipWaiting();
});
self.addEventListener("activate", e => self.clients.claim());

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);

  // Only handle same‑origin and the three IPFS gateways
  const isMedia = /gateway\.pinata|cloudflare-ipfs|ipfs\.io/.test(url.host);

  if (e.request.method !== "GET" || (!isMedia && url.origin !== location.origin)) return;

  e.respondWith((async () => {
    const cache = await caches.open("dynamic-v1");
    const cached = await cache.match(e.request);

    if (cached) {
      // For videos we must answer Range manually
      if (e.request.headers.has("range")) {
        return rangeResponse(cached, e.request.headers.get("range"));
      }
      // Return cached response, meanwhile update in background
      fetchAndCache(e.request, cache);
      return cached;
    }

    // Not cached: fetch, put, return
    try {
      const net = await fetchAndCache(e.request, cache);
      return net;
    } catch {
      return new Response("Offline", { status: 503 });
    }
  })());
});

async function fetchAndCache(req, cache) {
  const net = await fetch(req);
  if (net.ok) cache.put(req, net.clone());
  return net;
}

function rangeResponse(cachedResp, rangeHeader) {
  const size = +cachedResp.headers.get("content-length");
  const [_, startStr, endStr] = /bytes=(\d+)-(\d+)?/.exec(rangeHeader) || [];
  const start = Number(startStr);
  const end = endStr ? Number(endStr) : size - 1;
  const slice = cachedResp.body.slice(start, end + 1);
  return new Response(slice, {
    status: 206,
    headers: {
      "Content-Type": cachedResp.headers.get("Content-Type") || "video/mp4",
      "Content-Length": end - start + 1,
      "Content-Range": `bytes ${start}-${end}/${size}`,
      "Accept-Ranges": "bytes"
    }
  });
}
