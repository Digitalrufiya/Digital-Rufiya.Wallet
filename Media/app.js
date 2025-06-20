// app.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onValue,
  update,
  get,
  remove,
  set
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";
import {
  getAuth,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";

// ─── 1) Your Firebase config ───────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyB-W_j74lsbmJUFnTbJpn79HM62VLmkQC8",
  authDomain: "drfsocial-23a06.firebaseapp.com",
  databaseURL: "https://drfsocial-23a06-default-rtdb.firebaseio.com",
  projectId: "drfsocial-23a06",
  storageBucket: "drfsocial-23a06.appspot.com",
  messagingSenderId: "608135115201",
  appId: "1:608135115201:web:dc999df2c0f37241ff3f40",
};

// ─── 2) Full Pinata JWT (must include the `Bearer ` prefix) ────────────────────
const pinataJWT = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI4MDFmMDAxNy04YjZkLTQ2YjYtOGIwZi04Y2NkZWU5NzE4ODIiLCJlbWFpbCI6ImRpZ2l0YWxydWZpeWFAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjNkODdmOWVkOTA0ZGY4OTI2NTRjIiwic2NvcGVkS2V5U2VjcmV0IjoiYTI3OWU4ODU0ZDQ0YWY2Y2IxNzA0N2RhOThhYTc3MmExOTAyMmFhYTIwOTQ5YjEzN2Y5ZmIxMDI3YzAzYmY5ZiIsImV4cCI6MTc4MDQyMzA3Mn0.YpqewbjW7gAVyPSKYiO9Ym9QhddKc_1vm8CJIoXDQyA`;

// ─── 3) Initialize Firebase & Auth ─────────────────────────────────────────────
const app  = initializeApp(firebaseConfig);
const db   = getDatabase(app);
const auth = getAuth();
const provider = new GoogleAuthProvider();

// ─── 4) Admin emails who can delete ────────────────────────────────────────────
const adminEmails = new Set([
  "digitalrufiyauniversity@gmail.com",
  "digitalrufiya@gmail.com",
  "digitalrufiyacoin@gmail.com",
  "onenone91000@gmail.com",
]);

// ─── 5) DOM References ─────────────────────────────────────────────────────────
const loginBtn       = document.getElementById("loginBtn");
const logoutBtn      = document.getElementById("logoutBtn");
const uploadForm     = document.getElementById("uploadForm");
const mediaFileInput = document.getElementById("mediaFile");
const captionInput   = document.getElementById("caption");
const postContainer  = document.getElementById("postContainer");

let currentUser = null;

// ─── 6) Auth State Changes ────────────────────────────────────────────────────
onAuthStateChanged(auth, user => {
  currentUser       = user;
  uploadForm.style.display  = user ? "block" : "none";
  loginBtn.style.display    = user ? "none"  : "block";
  logoutBtn.style.display   = user ? "block" : "none";
  renderPosts();
});

// Login / Logout
loginBtn.onclick  = () => signInWithPopup(auth, provider).catch(console.error);
logoutBtn.onclick = () => signOut(auth);

// ─── 7) Upload a new Post with Pinata ─────────────────────────────────────────
uploadForm.addEventListener("submit", async e => {
  e.preventDefault();
  if (!currentUser || !mediaFileInput.files.length || captionInput.value.trim().length < 4) {
    return alert("Missing media, caption, or not logged in.");
  }
  uploadForm.querySelector("button").disabled = true;

  try {
    // 1) Send file to Pinata
    const formData = new FormData();
    formData.append("file", mediaFileInput.files[0]);
    const pinRes = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: { Authorization: pinataJWT },
      body: formData
    });
    if (!pinRes.ok) throw new Error(pinRes.statusText);
    const { IpfsHash } = await pinRes.json();
    const mediaUrl = `https://gateway.pinata.cloud/ipfs/${IpfsHash}`;

    // 2) Push new post to RTDB
    const newRef = push(ref(db, "posts"));
    await set(newRef, {
      userId:        currentUser.uid,
      displayName:   currentUser.displayName,
      photoURL:      currentUser.photoURL,
      caption:       captionInput.value.trim(),
      mediaUrl,
      mediaType:     mediaFileInput.files[0].type.startsWith("video") ? "video" : "image",
      timestamp:     Date.now(),
      likesCount:    0,
      commentsCount: 0
    });

    // Clear form
    mediaFileInput.value = "";
    captionInput.value   = "";
    alert("Post uploaded!");
  } catch(err) {
    console.error(err);
    alert("Upload failed: " + err.message);
  } finally {
    uploadForm.querySelector("button").disabled = false;
  }
});

// ─── 8) Render Posts (with likes, comments, share, delete) ─────────────────────
function renderPosts() {
  onValue(ref(db, "posts"), snap => {
    postContainer.innerHTML = "";
    const data = snap.val();
    if (!data) return;

    // Sort newest → oldest
    Object.entries(data)
      .sort(([,a],[,b]) => b.timestamp - a.timestamp)
      .forEach(([postId, post]) => {
        const liked   = currentUser && post.likes?.[currentUser.uid];
        const isAdmin = currentUser && adminEmails.has(currentUser.email);
        const card = document.createElement("div");
        card.className = "post-item";

        card.innerHTML = `
          <div class="post-owner">
            <img src="${post.photoURL||""}" class="avatar" />
            <span>${post.displayName||"User"}</span>
          </div>
          <div class="post-time">${new Date(post.timestamp).toLocaleString()}</div>
          ${post.mediaType==="video"
            ? `<video src="${post.mediaUrl}" controls preload="metadata"></video>`
            : `<img src="${post.mediaUrl}" />`}
          <div class="post-caption">${post.caption}</div>
          <div class="post-actions">
            <button class="like-btn" data-id="${postId}" aria-pressed="${liked?1:0}">
              ❤️ <span>${post.likesCount||0}</span>
            </button>
            <button class="comment-toggle-btn" data-id="${postId}" aria-expanded="false">
              💬 <span>${post.commentsCount||0}</span>
            </button>
            <button class="share-btn" data-id="${postId}">🔗</button>
            ${isAdmin
              ? `<button class="delete-btn" data-id="${postId}">🗑️</button>`
              : ""}
          </div>
          <div class="comments-section" id="comments-${postId}" style="display:none;">
            <div class="comments-list"></div>
            ${currentUser
              ? `<form class="comment-form" data-id="${postId}">
                   <input type="text" required placeholder="Comment…" />
                   <button>Send</button>
                 </form>`
              : `<p><em>Login to comment</em></p>`}
          </div>
        `;
        postContainer.append(card);

        // — Like/unlike
        card.querySelector(".like-btn").onclick = () =>
          toggleLike(postId, !!liked);

        // — Toggle comments
        const ctBtn = card.querySelector(".comment-toggle-btn");
        const csSec = card.querySelector(`#comments-${postId}`);
        ctBtn.onclick = () => {
          const open = csSec.style.display==="block";
          csSec.style.display = open ? "none" : "block";
          ctBtn.setAttribute("aria-expanded", open?0:1);
          if (!open) loadComments(postId, csSec.querySelector(".comments-list"));
        };

        // — Post a comment
        const cf = card.querySelector(".comment-form");
        if (cf) cf.onsubmit = async e => {
          e.preventDefault();
          const txt = cf.querySelector("input").value.trim();
          if (!txt) return;
          try {
            await postComment(postId, txt);
            cf.reset();
            loadComments(postId, csSec.querySelector(".comments-list"));
          } catch(err) {
            alert("Comment failed: "+err.message);
          }
        };

        // — Delete (admin only)
        if (isAdmin) {
          card.querySelector(".delete-btn").onclick = () =>
            deletePost(postId);
        }

        // — Share
        card.querySelector(".share-btn").onclick = () => {
          const url = `${location.origin}${location.pathname}?postId=${postId}`;
          navigator.clipboard.writeText(url)
            .then(()=>alert("Copied!"))
            .catch(()=>alert("Copy this: "+url));
        };
      });
  });
}

// ─── 9) Like toggle ─────────────────────────────────────────────────────────────
async function toggleLike(postId, liked) {
  if (!currentUser) return alert("Login to like");
  const likeRef = ref(db, `posts/${postId}/likes/${currentUser.uid}`);
  const postRef = ref(db, `posts/${postId}`);
  const snap    = await get(postRef);
  let cnt       = snap.val().likesCount||0;

  if (liked) {
    await remove(likeRef);
    cnt = Math.max(0, cnt-1);
  } else {
    await set(likeRef, true);
    cnt++;
  }
  await update(postRef, { likesCount: cnt });
}

// ─── 10) Load & render comments ────────────────────────────────────────────────
function loadComments(postId, container) {
  onValue(ref(db, `comments/${postId}`), snap => {
    container.innerHTML = "";
    const com = snap.val();
    if (!com) return container.innerHTML = "<p>No comments</p>";
    Object.values(com)
      .sort((a,b)=>a.timestamp-b.timestamp)
      .forEach(c => {
        const d = document.createElement("div");
        d.className = "comment-item";
        d.innerHTML = `
          <strong>${c.displayName}</strong>: ${c.text}
          <div class="comment-time">${new Date(c.timestamp).toLocaleString()}</div>
        `;
        container.append(d);
      });
  }, { onlyOnce: true });
}

// ─── 11) Post a comment ────────────────────────────────────────────────────────
async function postComment(postId, text) {
  if (!currentUser) throw new Error("Login first");
  const comRef = ref(db, `comments/${postId}`);
  const newC   = push(comRef);
  await set(newC, {
    userId:       currentUser.uid,
    displayName:  currentUser.displayName,
    text,
    timestamp:    Date.now()
  });
  // bump counter
  const pRef = ref(db, `posts/${postId}`);
  const snap = await get(pRef);
  const cCnt = (snap.val().commentsCount||0) + 1;
  await update(pRef, { commentsCount: cCnt });
}

// ─── 12) Delete a post (admin) ────────────────────────────────────────────────
async function deletePost(postId) {
  if (!currentUser || !adminEmails.has(currentUser.email)) {
    return alert("Not authorized");
  }
  if (!confirm("Delete this post?")) return;
  await remove(ref(db, `posts/${postId}`));
  await remove(ref(db, `comments/${postId}`));
}

// ─── 13) Start it! ─────────────────────────────────────────────────────────────
renderPosts();
