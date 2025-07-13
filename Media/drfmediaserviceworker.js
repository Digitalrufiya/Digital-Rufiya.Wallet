/* ---- DRFMedia Service‑Worker -------------------------------------------
   • Precaches the app‑shell (HTML + CSS + logo) on first visit
   • Caches every image / video fetched from the 3 IPFS gateways
   • Handles Range requests so cached MP4/WebM keeps playing offline
------------------------------------------------------------------------- */

const SHELL = [ "/", "/style.css", "/logo.png" ];   // add any static assets here
const STATIC  = "core-v1";
const DYNAMIC = "dyn-v1";

/* 1) install – precache shell */
self.addEventListener("install", e => {
  e.waitUntil(caches.open(STATIC).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

/* 2) activate – claim clients immediately */
self.addEventListener("activate", e => self.clients.claim());

/* 3) fetch – cache‑first for our origin + IPFS gateways */
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;

  const u = new URL(e.request.url);
  const gatewayRE = /gateway\.pinata|cloudflare-ipfs|ipfs\.io/;
  const isAppFile = u.origin === location.origin;
  const isMedia   = gatewayRE.test(u.host);

  if (!isAppFile && !isMedia) return;          // ignore Google fonts, etc.

  e.respondWith(handle(e.request, isAppFile ? STATIC : DYNAMIC));
});

async function handle(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);

  /* ----  Range requests (only for already‑cached videos) ---- */
  if (cached && req.headers.has("range")) {
    return partial(cached, req.headers.get("range"));
  }

  if (cached) {
    // fire‑and‑forget update in background
    fetch(req).then(r => r.ok && cache.put(req, r.clone()));
    return cached;
  }

  try {
    const net = await fetch(req);
    if (net.ok) cache.put(req, net.clone());
    return net;
  } catch {
    return cached                       // maybe we’re offline and Range miss
      || new Response("Offline", { status: 503 });
  }
}

/* slice the cached blob and return 206 Partial Content */
async function partial(resp, rangeHeader) {
  const size = +resp.headers.get("content-length");
  const [, startStr, endStr] =
        /bytes=(\d+)-(\d+)?/.exec(rangeHeader) || [0,0,size-1];
  const start = +startStr;
  const end   = endStr ? +endStr : size-1;

  // read full body once and slice – OK for demo (big files → stream instead)
  const buf = await resp.arrayBuffer();
  return new Response(buf.slice(start, end+1), {
    status: 206,
    headers: {
      "Content-Type": resp.headers.get("Content-Type") || "video/mp4",
      "Content-Length": end - start + 1,
      "Content-Range": `bytes ${start}-${end}/${size}`,
      "Accept-Ranges": "bytes"
    }
  });
}
