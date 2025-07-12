// DRFMedia ‑ timeline logic (clean & fixed)
// -------------------------------------------
//  ✦ Google Auth & Firebase Realtime DB
//  ✦ Pinata IPFS upload
//  ✦ Posts with images / videos, likes, boosts, comments, views
//  ✦ Admin boost & delete
//  ✦ Avatar fallback + 3‑gateway media fallback for reliability

// ----------  Imports  ----------
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import {
  getDatabase, ref, push, set, onValue, get,
  remove, update, runTransaction
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";
import {
  getAuth, signInWithPopup, signOut, GoogleAuthProvider,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";

// ----------  Config  ----------
const firebaseConfig = {
  apiKey: "AIzaSyB-W_j74lsbmJUFnTbJpn79HM62VLmkQC8",
  authDomain: "drfsocial-23a06.firebaseapp.com",
  databaseURL: "https://drfsocial-23a06-default-rtdb.firebaseio.com",
  projectId: "drfsocial-23a06",
  storageBucket: "drfsocial-23a06.appspot.com",
  messagingSenderId: "608135115201",
  appId: "1:608135115201:web:dc999df2c0c37241ff3f40"
};
const app  = initializeApp(firebaseConfig);
const db   = getDatabase(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// ----------  Pinata  ----------
const pinataJWT = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI4MDFmMDAxNy04YjZkLTQ2YjYtOGIwZi04Y2NkZWU5NzE4ODIiLCJlbWFpbCI6ImRpZ2l0YWxydWZpeWFAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjNkODdmOWVkOTA0ZGY4OTI2NTRjIiwic2NvcGVkS2V5U2VjcmV0IjoiYTI3OWU4ODU0ZDQ0YWY2Y2IxNzA0N2RhOThhYTc3MmExOTAyMmFhYTIwOTQ5YjEzN2Y5ZmIxMDI3YzAzYmY5ZiIsImV4cCI6MTc4MDQyMzA3Mn0.YpqewbjW7gAVyPSKYiO9Ym9QhddKc_1vm8CJIoXDQyA"; // <-- put your JWT here

// ----------  DOM refs  ----------
const loginBtn   = document.getElementById("loginBtn");
const logoutBtn  = document.getElementById("logoutBtn");
const uploadForm = document.getElementById("uploadForm");
const mediaFile  = document.getElementById("mediaFile");
const captionIn  = document.getElementById("caption");
const postWrap   = document.getElementById("postContainer");

// ----------  State  ----------
let currentUser = null;
let isAdmin     = false;

// ----------  Helpers  ----------
const esc = s => String(s).replace(/[&<>"]/g, m => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[m]));
const notify = msg => alert(msg);
const ipfsSrc = h => [
  `https://gateway.pinata.cloud/ipfs/${h}`,
  `https://cloudflare-ipfs.com/ipfs/${h}`,
  `https://dweb.link/ipfs/${h}`
];
const isUserAdmin = u => u?.email?.toLowerCase() === "digitalrufiya@gmail.com";

// ----------  Auth UI  ----------
loginBtn.onclick  = () => signInWithPopup(auth, provider).catch(e => notify(e.message));
logoutBtn.onclick = () => signOut(auth).catch(e => notify(e.message));

onAuthStateChanged(auth, user => {
  currentUser = user;
  isAdmin = isUserAdmin(user);
  uploadForm.style.display = user ? "block" : "none";
  loginBtn .style.display   = user ? "none" : "block";
  logoutBtn.style.display   = user ? "block" : "none";
  renderPosts();
});

// ----------  Upload  ----------
uploadForm.onsubmit = async e => {
  e.preventDefault();
  if (!currentUser)       return notify("Login first");
  if (!mediaFile.files[0])return notify("Select a file");
  if (captionIn.value.trim().length < 4) return notify("Caption too short");

  uploadForm.querySelector("button").disabled = true;
  try {
    // Pinata upload
    const fd = new FormData(); fd.append("file", mediaFile.files[0]);
    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method:"POST", headers:{Authorization: pinataJWT}, body: fd
    });
    if (!res.ok) throw new Error("Pinata upload failed");
    const { IpfsHash } = await res.json();

    // Save post
    await set(push(ref(db,"posts")), {
      userId:        currentUser.uid,
      displayName:   currentUser.displayName || "Anonymous",
      photoURL:      currentUser.photoURL || "https://via.placeholder.com/40",
      caption:       captionIn.value.trim(),
      ipfsHash:      IpfsHash,
      mediaType:     mediaFile.files[0].type.startsWith("video") ? "video" : "image",
      mediaMimeType: mediaFile.files[0].type,
      timestamp:     Date.now(),
      viewsCount: 0, likesCount:0, boostsCount:0, commentsCount:0,
      likesBy:{}, boostedBy:{}
    });
    captionIn.value = ""; mediaFile.value = "";
    notify("Posted!");
  } catch(e) { notify(e.message); }
  finally   { uploadForm.querySelector("button").disabled = false; }
};

// ----------  Live feed  ----------
function renderPosts(){
  onValue(ref(db,"posts"), snap => {
    postWrap.innerHTML = "";
    const data = snap.val();
    if (!data) { postWrap.innerHTML = "<p>No posts yet.</p>"; return; }
    const sorted = Object.entries(data)
      .sort((a,b)=>b[1].timestamp - a[1].timestamp);

    for(const [id,p] of sorted) postWrap.appendChild(createCard(id,p));
  });
}

function createCard(id,p){
  // avatar fallback
  const avatar = p.photoURL || "https://via.placeholder.com/40";
  // media element html
  const sources = ipfsSrc(p.ipfsHash);
  const mediaHTML = p.mediaType === "video"
    ? `<video controls playsinline preload="metadata">${sources.map(u=>`<source src="${u}" type="${p.mediaMimeType}">`).join("")}</video>`
    : `<img src="${sources[0]}" onerror="this.onerror=null;this.src='${sources[1]}'" alt="media">`;

  const card = document.createElement("article");
  card.className = "post-item";
  card.innerHTML = `
    <header class="post-owner"><img class="avatar" src="${avatar}" alt="avatar"><div><div>${esc(p.displayName)}</div><time class="post-time" datetime="${new Date(p.timestamp).toISOString()}">${new Date(p.timestamp).toLocaleString()}</time></div></header>
    <div class="post-caption">${esc(p.caption)}</div>
    <div class="post-media">${mediaHTML}</div>
    <div class="post-actions">
      <button class="like-btn">👍 Like (<span class="lc">${p.likesCount||0}</span>)</button>
      <button class="comment-toggle">💬 Comment (<span class="cc">${p.commentsCount||0}</span>)</button>
      <button class="boost-btn">🚀 Boost (<span class="bc">${p.boostsCount||0}</span>)</button>
      ${ (isAdmin || currentUser?.uid===p.userId) ? '<button class="delete-btn">🗑️ Delete</button>' : '' }
    </div>
    <div class="comments-list"></div>
    <form class="comment-box" style="display:none;"><textarea rows="2" placeholder="Write a comment…" required></textarea><button class="btn" type="submit" style="margin-top:.4rem;">Post</button></form>`;

  // views +1 (non‑blocking)
  runTransaction(ref(db,`posts/${id}/viewsCount`), c=>(c||0)+1).catch(()=>{});

  // handlers
  const lc  = card.querySelector(".lc");
  const bc  = card.querySelector(".bc");
  const cc  = card.querySelector(".cc");
  card.querySelector(".like-btn").onclick    = () => toggleLike(id,lc);
  card.querySelector(".boost-btn").onclick   = () => toggleBoost(id,bc);
  card.querySelector(".comment-toggle").onclick = () => toggleComments(card);
  card.querySelector(".comment-box").onsubmit = e=>submitComment(e,id,cc,card);
  if(card.querySelector(".delete-btn")) card.querySelector(".delete-btn").onclick=()=>deletePost(id);

  loadComments(id,card);
  return card;
}

// ----------  Likes / Boost / Comments ----------
async function toggleLike(id,lc){
  if(!currentUser) return notify("Login");
  const likeRef  = ref(db,`posts/${id}/likesBy/${currentUser.uid}`);
  const countRef = ref(db,`posts/${id}/likesCount`);
  const snap=await get(likeRef);
  snap.exists()? await remove(likeRef) : await set(likeRef,true);
  await runTransaction(countRef,c=>(c||0)+(snap.exists()?-1:+1));
  lc.textContent = (await get(countRef)).val()||0;
}

async function toggleBoost(id,bc){
  if(!currentUser||!isAdmin) return notify("Admins only");
  const bRef=ref(db,`posts/${id}/boostedBy/${currentUser.uid}`);
  const cRef=ref(db,`posts/${id}/boostsCount`);
  const s=await get(bRef);
  s.exists()?await remove(bRef):await set(bRef,true);
  await runTransaction(cRef,c=>(c||0)+(s.exists()?-1:+1));
  bc.textContent=(await get(cRef)).val()||0;
}

function toggleComments(card){
  const box=card.querySelector(".comment-box");
  box.style.display=box.style.display=="none"?"block":"none";
}

function loadComments(id,card){
  onValue(ref(db,`comments/${id}`),s=>{
    const d=s.val()||{};
    const list=card.querySelector(".comments-list");
    list.innerHTML="";
    Object.values(d).sort((a,b)=>a.timestamp-b.timestamp).forEach(c=>{
      list.insertAdjacentHTML("beforeend",`<div style='margin-bottom:4px;'><strong>${esc(c.displayName)}:</strong> ${esc(c.text)}</div>`);
    });
    card.querySelector(".cc").textContent=Object.keys(d).length;
  });
}

async function submitComment(e,id,cc,card){
  e.preventDefault(); if(!currentUser) return notify("Login");
  const txt=e.target.querySelector("textarea").value.trim(); if(!txt) return;
  await set(push(ref(db,`comments/${id}`)),{userId:currentUser.uid,displayName:currentUser.displayName||"Anon",text:txt,timestamp:Date.now()});
  await runTransaction(ref(db,`posts/${id}/commentsCount`),c=>(c||0)+1);
  e.target.querySelector("textarea").value=""; e.target.style.display="none";
}

async function deletePost(id){
  if(!confirm("Delete this post permanently?"))return;
  await remove(ref(db,`posts/${id}`)); await remove(ref(db,`comments/${id}`));
}

// ----------  Menu toggle (mobile) ----------
menuTog.onclick = () => {
  const open = primaryNav.classList.toggle("open");
  menuTog.setAttribute("aria-expanded",open);
};
</script>
