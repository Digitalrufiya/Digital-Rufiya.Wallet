// app.js — DRFMedia Timeline with Full Pinata JWT and Video Fixes

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

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB-W_j74lsbmJUFnTbJpn79HM62VLmkQC8",
  authDomain: "drfsocial-23a06.firebaseapp.com",
  databaseURL: "https://drfsocial-23a06-default-rtdb.firebaseio.com",
  projectId: "drfsocial-23a06",
  storageBucket: "drfsocial-23a06.appspot.com",
  messagingSenderId: "608135115201",
  appId: "1:608135115201:web:dc999df2c0c37241ff3f40"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// FULL Pinata JWT (replace with yours)
const pinataJWT = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI4MDFmMDAxNy04YjZkLTQ2YjYtOGIwZi04Y2NkZWU5NzE4ODIiLCJlbWFpbCI6ImRpZ2l0YWxydWZpeWFAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjNkODdmOWVkOTA0ZGY4OTI2NTRjIiwic2NvcGVkS2V5U2VjcmV0IjoiYTI3OWU4ODU0ZDQ0YWY2Y2IxNzA0N2RhOThhYTc3MmExOTAyMmFhYTIwOTQ5YjEzN2Y5ZmIxMDI3YzAzYmY5ZiIsImV4cCI6MTc4MDQyMzA3Mn0.YpqewbjW7gAVyPSKYiO9Ym9QhddKc_1vm8CJIoXDQyA";

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const uploadForm = document.getElementById("uploadForm");
const mediaFile = document.getElementById("mediaFile");
const captionInput = document.getElementById("caption");
const postContainer = document.getElementById("postContainer");

let currentUser = null;

onAuthStateChanged(auth, user => {
  currentUser = user;
  uploadForm.style.display = user ? "block" : "none";
  loginBtn.style.display = user ? "none" : "block";
  logoutBtn.style.display = user ? "block" : "none";
  renderPosts();
});

loginBtn.onclick = () => signInWithPopup(auth, provider).catch(console.error);
logoutBtn.onclick = () => signOut(auth).catch(console.error);

uploadForm.addEventListener("submit", async e => {
  e.preventDefault();

  if (!currentUser) return alert("Login required.");
  if (!mediaFile.files.length) return alert("Select a file.");
  if (captionInput.value.trim().length < 4) return alert("Caption too short.");

  const file = mediaFile.files[0];
  const fd = new FormData();
  fd.append("file", file);

  uploadForm.querySelector("button").disabled = true;

  try {
    const resp = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: { Authorization: pinataJWT },
      body: fd
    });

    const result = await resp.json();
    if (!resp.ok || !result.IpfsHash) throw new Error("Pinata failed");

    const mediaUrl = `https://cloudflare-ipfs.com/ipfs/${result.IpfsHash}`;

    const newRef = push(ref(db, "posts"));
    await set(newRef, {
      userId: currentUser.uid,
      displayName: currentUser.displayName,
      photoURL: currentUser.photoURL,
      caption: captionInput.value.trim(),
      mediaUrl,
      mediaType: file.type.startsWith("video") ? "video" : "image",
      timestamp: Date.now(),
      likesCount: 0,
      commentsCount: 0
    });

    captionInput.value = "";
    mediaFile.value = "";
  } catch (err) {
    alert("Upload failed: " + err.message);
    console.error(err);
  } finally {
    uploadForm.querySelector("button").disabled = false;
  }
});

function renderPosts() {
  onValue(ref(db, "posts"), snap => {
    postContainer.innerHTML = "";
    const data = snap.val();
    if (!data) return;

    Object.entries(data)
      .sort((a, b) => b[1].timestamp - a[1].timestamp)
      .forEach(([postId, post]) => {
        const card = document.createElement("div");
        card.className = "post-item";
        card.innerHTML = `
          <div class="post-owner">
            <img src="${post.photoURL || ""}" class="avatar" />
            <strong>${post.displayName || "Anonymous"}</strong>
          </div>
          <div class="post-time">${new Date(post.timestamp).toLocaleString()}</div>
          ${
            post.mediaType === "video"
              ? `<video controls preload="metadata" playsinline style="background:#000; max-width:100%; border-radius:6px;"><source src="${post.mediaUrl}" type="video/mp4"></video>`
              : `<img src="${post.mediaUrl}" alt="Media" style="border-radius:6px; max-width:100%;" />`
          }
          <div class="post-caption">${escapeHTML(post.caption)}</div>
        `;
        postContainer.appendChild(card);
      });
  });
}

function escapeHTML(str) {
  return str.replace(/[&<>"]/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;"
  }[c]));
}

renderPosts();
