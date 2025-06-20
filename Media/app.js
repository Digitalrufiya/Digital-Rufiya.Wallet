// app.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set,
  update,
  remove,
  onValue,
  get
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";
import {
  getAuth,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";

// — Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB-W_j74lsbmJUFnTbJpn79HM62VLmkQC8",
  authDomain: "drfsocial-23a06.firebaseapp.com",
  databaseURL: "https://drfsocial-23a06-default-rtdb.firebaseio.com",
  projectId: "drfsocial-23a06",
  storageBucket: "drfsocial-23a06.appspot.com",
  messagingSenderId: "608135115201",
  appId: "1:608135115201:web:dc999df2c0f37241ff3f40"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// — **FULL** Pinata JWT (copy this entire string exactly)
const pinataJWT = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI4MDFmMDAxNy04YjZkLTQ2YjYtOGIwZi04Y2NkZWU5NzE4ODIiLCJlbWFpbCI6ImRpZ2l0YWxydWZpeWFAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjNkODdmOWVkOTA0ZGY4OTI2NTRjIiwic2NvcGVkS2V5U2VjcmV0IjoiYTI3OWU4ODU0ZDQ0YWY2Y2IxNzA0N2RhOThhYTc3MmExOTAyMmFhYTIwOTQ5YjEzN2Y5ZmIxMDI3YzAzYmY5ZiIsImV4cCI6MTc4MDQyMzA3Mn0.YpqewbjW7gAVyPSKYiO9Ym9QhddKc_1vm8CJIoXDQyA";

const admins = new Set([
  "digitalrufiyauniversity@gmail.com",
  "digitalrufiya@gmail.com",
  "digitalrufiyacoin@gmail.com",
  "onenone91000@gmail.com"
]);

// DOM
const loginBtn      = document.getElementById("loginBtn");
const logoutBtn     = document.getElementById("logoutBtn");
const uploadForm    = document.getElementById("uploadForm");
const mediaFile     = document.getElementById("mediaFile");
const captionInput  = document.getElementById("caption");
const postContainer = document.getElementById("postContainer");

let currentUser = null;

// Auth state
onAuthStateChanged(auth, user => {
  currentUser = user;
  uploadForm.style.display = user ? "block" : "none";
  loginBtn.style.display  = user ? "none"  : "block";
  logoutBtn.style.display = user ? "block" : "none";
  renderPosts();
});

// Login/Logout
loginBtn.onclick  = () => signInWithPopup(auth, provider).catch(console.error);
logoutBtn.onclick = () => signOut(auth);

// Upload handler
uploadForm.addEventListener("submit", async e => {
  e.preventDefault();
  if (!currentUser || !mediaFile.files.length || captionInput.value.trim().length < 4) {
    return alert("Missing login, file or caption");
  }
  uploadForm.querySelector("button").disabled = true;

  const file = mediaFile.files[0];
  const fd = new FormData();
  fd.append("file", file);

  try {
    // Pin to Pinata
    const resp = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: { Authorization: pinataJWT },
      body: fd
    });
    if (!resp.ok) throw new Error(resp.statusText);
    const { IpfsHash } = await resp.json();
    const mediaUrl = `https://gateway.pinata.cloud/ipfs/${IpfsHash}`;

    // Save to RTDB
    const newRef = push(ref(db, "posts"));
    await set(newRef, {
      userId:      currentUser.uid,
      displayName: currentUser.displayName,
      photoURL:    currentUser.photoURL,
      caption:     captionInput.value.trim(),
      mediaUrl,
      mediaType:   file.type.startsWith("video") ? "video" : "image",
      timestamp:   Date.now(),
      likesCount:    0,
      commentsCount: 0
    });

    captionInput.value = "";
    mediaFile.value    = "";
  } catch (err) {
    console.error(err);
    alert("Upload failed: " + err.message);
  } finally {
    uploadForm.querySelector("button").disabled = false;
  }
});

// Render posts
function renderPosts() {
  onValue(ref(db, "posts"), snap => {
    postContainer.innerHTML = "";
    const data = snap.val();
    if (!data) return;

    Object.entries(data)
      .sort((a,b) => b[1].timestamp - a[1].timestamp)
      .forEach(([postId, post]) => {
        const liked = currentUser && post.likes && post.likes[currentUser.uid];
        const isAdmin = currentUser && admins.has(currentUser.email);

        const card = document.createElement("div");
        card.className = "post-item";
        card.innerHTML = `
          <div class="post-owner">
            <img src="${post.photoURL||''}" class="avatar"/>
            <strong>${post.displayName||"Anonymous"}</strong>
          </div>
          <div class="post-time">${new Date(post.timestamp).toLocaleString()}</div>
          ${post.mediaType==="video"
            ? `<video src="${post.mediaUrl}" controls preload="metadata"></video>`
            : `<img src="${post.mediaUrl}" loading="lazy"/>`}
          <div class="post-caption">${escapeHTML(post.caption)}</div>
          <div class="post-actions">
            <button class="like-btn" data-id="${postId}" aria-pressed="${liked?1:0}">
              ❤️ <span>${post.likesCount||0}</span>
            </button>
            <button class="comment-toggle" data-id="${postId}">
              💬 <span>${post.commentsCount||0}</span>
            </button>
            <button class="share-btn" data-id="${postId}">🔗</button>
            ${isAdmin
              ? `<button class="delete-btn" data-id="${postId}">🗑️</button>`
              : ""}
          </div>
          <div class="comments" id="cmts-${postId}" style="display:none">
            <div class="list"></div>
            ${currentUser
              ? `<form class="cmt-form" data-id="${postId}">
                   <input required minlength="1" placeholder="Add a comment…"/>
                   <button>Send</button>
                 </form>`
              : `<em>Login to comment</em>`}
          </div>
        `;
        postContainer.appendChild(card);

        // Attach events
        card.querySelector(".like-btn").onclick = () =>
          toggleLike(postId, !!liked);
        card.querySelector(".comment-toggle").onclick = () => {
          const cs = document.getElementById(`cmts-${postId}`);
          const show = cs.style.display==="block";
          cs.style.display = show?"none":"block";
          if (!show) loadComments(postId);
        };
        card.querySelector(".share-btn").onclick = () => {
          const url = `${location.href.split('?')[0]}?postId=${postId}`;
          navigator.clipboard.writeText(url)
            .then(_=>alert("Copied!"))
            .catch(_=>prompt("URL:",url));
        };
        if (isAdmin) {
          card.querySelector(".delete-btn").onclick = () => deletePost(postId);
        }
        const cf = card.querySelector(".cmt-form");
        if (cf) cf.onsubmit = e => {
          e.preventDefault();
          const txt = cf[0].value.trim();
          if (txt) postComment(postId, txt);
          cf.reset();
        };
      });
  });
}

// Like/unlike
async function toggleLike(postId, liked) {
  if (!currentUser) return alert("Login to like");
  const likeRef = ref(db, `posts/${postId}/likes/${currentUser.uid}`);
  const postRef = ref(db, `posts/${postId}`);
  const snap = await get(postRef);
  let cnt = snap.val().likesCount||0;

  try {
    if (liked) {
      await remove(likeRef);
      cnt = Math.max(0, cnt-1);
    } else {
      await set(likeRef, true);
      cnt++;
    }
    await update(postRef, { likesCount: cnt });
  } catch(e){
    alert("Like error: "+e.message);
  }
}

// Load comments
function loadComments(postId) {
  const list = document.querySelector(`#cmts-${postId} .list`);
  list.innerHTML = "Loading…";
  onValue(ref(db, `comments/${postId}`), snap => {
    list.innerHTML = "";
    const cm = snap.val();
    if (!cm) return list.innerHTML = "<em>No comments</em>";
    Object.values(cm).sort((a,b)=>a.timestamp-b.timestamp)
      .forEach(c => {
        const d = document.createElement("div");
        d.className = "comment-item";
        d.innerHTML = `<strong>${escapeHTML(c.displayName)}</strong>: ${
          escapeHTML(c.text)
        }<div class="comment-time">${new Date(c.timestamp).toLocaleString()}</div>`;
        list.appendChild(d);
      });
  });
}

// Post comment
async function postComment(postId, text) {
  if (!currentUser) return;
  const cref = push(ref(db, `comments/${postId}`));
  await set(cref, {
    userId:      currentUser.uid,
    displayName: currentUser.displayName,
    text,
    timestamp:   Date.now()
  });
  // bump count
  const pr = ref(db, `posts/${postId}`);
  const snap = await get(pr);
  const cc = (snap.val().commentsCount||0)+1;
  await update(pr, { commentsCount: cc });
}

// Delete post
async function deletePost(postId) {
  if (!currentUser || !admins.has(currentUser.email)) return alert("No permission");
  if (!confirm("Delete this post?")) return;
  await remove(ref(db, `posts/${postId}`));
  await remove(ref(db, `comments/${postId}`));
}

// Escape HTML
function escapeHTML(s){
  return s.replace(/[&<>"']/g,c=>({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;",
    "'":"&#39;"
  }[c]));
}

// Start
renderPosts();
