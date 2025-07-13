/* DRFMedia SW – cache shell + queue uploader */

const CORE = ["/","/offlineupload.html","/style.css"];
const STATIC  = "core-v1";
const DYNAMIC = "dyn-v1";

/* precache */
self.addEventListener("install",e=>{
  e.waitUntil(caches.open(STATIC).then(c=>c.addAll(CORE)));
  self.skipWaiting();
});
self.addEventListener("activate",e=>self.clients.claim());

/* network with cache fallback */
self.addEventListener("fetch",e=>{
  if(e.request.method!=="GET") return;
  e.respondWith(
    caches.match(e.request).then(r=>r||fetch(e.request).then(resp=>{
      if(resp.ok && e.request.url.includes(\"/ipfs/\")){
        caches.open(DYNAMIC).then(c=>c.put(e.request,resp.clone()));
      }
      return resp;
    }))
  );
});

/* background‑sync */
self.addEventListener(\"sync\",e=>{
  if(e.tag===\"upload-posts\") e.waitUntil(flushQueue());
});

/* ---- queue logic ---- */
async function flushQueue(){
  const db = await openDB();
  const tx = db.transaction(\"uploads\",\"readwrite\");
  const store = tx.objectStore(\"uploads\");
  for await (const cursor of store){
    const {id,file,caption}=cursor.value;
    try{
      await uploadNow(file,caption);
      await store.delete(id);
    }catch(e){console.error(\"retry later\",e);}
  }
  await tx.done; db.close();
}

/* same helper funcs as main page but in SW context */
function openDB(){
  return new Promise((res,rej)=>{
    const r=indexedDB.open(\"drfmedia\",1);
    r.onupgradeneeded=()=>r.result.createObjectStore(\"uploads\",{keyPath:\"id\",autoIncrement:true});
    r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);
  });
}
async function uploadNow(file,caption){
  const fd=new FormData(); fd.append(\"file\",file);
  const up=await fetch(\"https://api.pinata.cloud/pinning/pinFileToIPFS\",{
    method:\"POST\",headers:{Authorization:\"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI4MDFmMDAxNy04YjZkLTQ2YjYtOGIwZi04Y2NkZWU5NzE4ODIiLCJlbWFpbCI6ImRpZ2l0YWxydWZpeWFAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjNkODdmOWVkOTA0ZGY4OTI2NTRjIiwic2NvcGVkS2V5U2VjcmV0IjoiYTI3OWU4ODU0ZDQ0YWY2Y2IxNzA0N2RhOThhYTc3MmExOTAyMmFhYTIwOTQ5YjEzN2Y5ZmIxMDI3YzAzYmY5ZiIsImV4cCI6MTc4MDQyMzA3Mn0.YpqewbjW7gAVyPSKYiO9Ym9QhddKc_1vm8CJIoXDQyA\"},body:fd});
  if(!up.ok) throw new Error(\"Pinata failed\");
  const {IpfsHash}=await up.json();
  await fetch(\"https://YOUR_FIREBASE_DB_URL/posts.json\",{ // simple REST write
     method:\"POST\",body:JSON.stringify({caption,ipfsHash:IpfsHash,timestamp:Date.now()})
  });
}
