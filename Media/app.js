// app.js — Final Version with Pinata & Firebase Rules Compatibility and fixes

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set,
  onValue
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Your Pinata JWT token here
const pinataJWT = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI4MDFmMDAxNy04YjZkLTQ2YjYtOGIwZi04Y2NkZWU5NzE4ODIiLCJlbWFpbCI6ImRpZ2l0YWxydWZpeWFAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjNkODdmOWVkOTA0ZGY4OTI2NTRjIiwic2NvcGVkS2V5U2VjcmV0IjoiYTI3OWU4ODU0ZDQ0YWY2Y2IxNzA0N2RhOThhYTc3MmExOTAyMmFhYTIwOTQ5YjEzN2Y5ZmIxMDI3YzAzYmY5ZiIsImV4cCI6MTc4MDQyMzA3Mn0.YpqewbjW7gAVyPSKYiO9Ym9QhddKc_1vm8CJIoXDQyA";

// DOM elements
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const uploadForm = document.getElementById("uploadForm");
const mediaFile = document.getElementById("mediaFile");
const captionInput = document.getElementById("caption");
const postContainer = document.getElementById("postContainer");

// Optional nav links if you want to sync UI there (defined in your HTML)
const loginNavLink = document.getElementById('loginNavLink');
const logoutNavLink = document.getElementById('logoutNavLink');
const uploadNavLink = document.getElementById('uploadNavLink');
const profileLink = document.getElementById('profileLink');

let currentUser = null;

function escapeHTML(str) {
  return str.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

// Update UI based on login status
function updateUI(user) {
  const loggedIn = !!user;
  uploadForm.style.display = loggedIn ? "block" : "none";
  loginBtn.style.display = loggedIn ? "none" : "block";
  logoutBtn.style.display = loggedIn ? "block" : "none";
  if (loginNavLink) loginNavLink.style.display = loggedIn ? "none" : "inline-block";
  if (logoutNavLink) logoutNavLink.style.display = loggedIn ? "inline-block" : "none";
  if (uploadNavLink) uploadNavLink.style.display = loggedIn ? "inline-block" : "none";
  if (profileLink) profileLink.style.display = loggedIn ? "inline-block" : "none";
}

// Render posts from Firebase Realtime Database
function renderPosts() {
  onValue(ref(db, "posts"), snap => {
    postContainer.innerHTML = "";
    const data = snap.val();
    if (!data) {
      postContainer.innerHTML = "<p>No posts yet.</p>";
      return;
    }

    Object.entries(data)
      .sort((a, b) => b[1].timestamp - a[1].timestamp)
      .forEach(([postId, post]) => {
        const card = document.createElement("div");
        card.className = "post-item";

        const safeName = escapeHTML(post.displayName || "Anonymous");
        const safeCaption = escapeHTML(post.caption);

        let mediaHTML = "";
        if (post.mediaType === "video") {
          const mimeType = post.mediaMimeType || "video/mp4";
          mediaHTML = `<video controls preload="metadata" width="100%">
            <source src="${post.mediaUrl}" type="${mimeType}" />
            Your browser does not support the video tag.
          </video>`;
        } else {
          mediaHTML = `<img src="${post.mediaUrl}" alt="User uploaded image" />`;
        }

        card.innerHTML = `
          <div class="post-owner">
            <img src="${post.photoURL || ''}" class="avatar" alt="User avatar" />
            <strong>${safeName}</strong>
          </div>
          <div class="post-time">${new Date(post.timestamp).toLocaleString()}</div>
          ${mediaHTML}
          <div class="post-caption">${safeCaption}</div>
        `;
        postContainer.appendChild(card);
      });
  }, {
    onlyOnce: false,
  });
}

// Monitor auth state changes
onAuthStateChanged(auth, user => {
  currentUser = user;
  updateUI(user);
  if (user) {
    renderPosts();
  } else {
    postContainer.innerHTML = "<p>Please login to view posts.</p>";
  }
});

// Login/logout event handlers
loginBtn.onclick = () => signInWithPopup(auth, provider).catch(console.error);
logoutBtn.onclick = () => signOut(auth).catch(console.error);
if (loginNavLink) loginNavLink.onclick = e => { e.preventDefault(); signInWithPopup(auth, provider).catch(console.error); };
if (logoutNavLink) logoutNavLink.onclick = e => { e.preventDefault(); signOut(auth).catch(console.error); };

// Upload new post handler
uploadForm.addEventListener("submit", async e => {
  e.preventDefault();

  if (!currentUser) return alert("Please login first.");
  if (!mediaFile.files.length) return alert("Select a file.");
  if (captionInput.value.trim().length < 4) return alert("Caption too short.");

  uploadForm.querySelector("button").disabled = true;

  const file = mediaFile.files[0];
  const fd = new FormData();
  fd.append("file", file);

  try {
    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: { Authorization: pinataJWT },
      body: fd
    });

    if (!res.ok) throw new Error("Pinata Upload Failed: " + res.status);

    const { IpfsHash } = await res.json();
    const mediaUrl = `https://cloudflare-ipfs.com/ipfs/${IpfsHash}`;

    const newPostRef = push(ref(db, "posts"));
    await set(newPostRef, {
      userId: currentUser.uid,
      displayName: currentUser.displayName,
      photoURL: currentUser.photoURL || "",
      caption: captionInput.value.trim(),
      mediaUrl,
      mediaType: file.type.startsWith("video") ? "video" : "image",
      mediaMimeType: file.type,
      timestamp: Date.now(),
      likesCount: 0,
      commentsCount: 0
    });

    captionInput.value = "";
    mediaFile.value = "";

  } catch (err) {
    alert("Upload failed: " + err.message);
  } finally {
    uploadForm.querySelector("button").disabled = false;
  }
});
