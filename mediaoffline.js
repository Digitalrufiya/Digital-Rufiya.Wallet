const CORE = ["/","/index.html","/style.css","/idb.js","/logo.png"];
self.addEventListener("install",e=>{
  e.waitUntil(caches.open("core-v1").then(c=>c.addAll(CORE)));
  self.skipWaiting();
});
self.addEventListener("activate",e=>self.clients.claim());

/* cache‑first for everything under same origin; update in background */
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET" || new URL(e.request.url).origin!==location.origin) return;
  e.respondWith(caches.match(e.request).then(resp=>{
    const fetcher = fetch(e.request).then(r=>{
      if(r.ok) caches.open("core-v1").then(c=>c.put(e.request,r.clone()));
      return r;
    });
    return resp||fetcher;
  }));
});
