// feed.js - Clean feed viewer with boost sorting, search, and filters

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import {
  getDatabase, ref, onValue, get
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";
import {
  getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";

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

const postContainer = document.getElementById("postContainer");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const searchInput = document.getElementById("searchInput");
const filterSelect = document.getElementById("filterSelect");

let currentUser = null;

onAuthStateChanged(auth, user => {
  currentUser = user;
  loginBtn.style.display = user ? "none" : "block";
  logoutBtn.style.display = user ? "block" : "none";
  loadFeed();
});

loginBtn.onclick = () => signInWithPopup(auth, provider);
logoutBtn.onclick = () => signOut(auth);
searchInput.oninput = loadFeed;
filterSelect.onchange = loadFeed;

function loadFeed() {
  onValue(ref(db, "posts"), snap => {
    const data = snap.val();
    postContainer.innerHTML = "";
    if (!data) return;

    const posts = Object.entries(data).map(([id, p]) => ({ id, ...p }));

    const search = searchInput.value.trim().toLowerCase();
    const filter = filterSelect.value;

    const filtered = posts.filter(p => {
      return (
        p.caption?.toLowerCase().includes(search) ||
        p.displayName?.toLowerCase().includes(search)
      );
    });

    const sorted = filtered.sort((a, b) => {
      if (filter === "mostBoosted") {
        return (b.boostAmount || 0) - (a.boostAmount || 0);
      } else if (filter === "mostLiked") {
        return (b.likesCount || 0) - (a.likesCount || 0);
      } else {
        return (b.timestamp || 0) - (a.timestamp || 0);
      }
    });

    for (const post of sorted) {
      const card = document.createElement("div");
      card.className = "post-item";
      card.innerHTML = `
        <div class="post-owner">
          <img src="${post.photoURL || ''}" class="avatar"/>
          <strong>${post.displayName || "Anonymous"}</strong>
        </div>
        <div class="post-time">${new Date(post.timestamp).toLocaleString()}</div>
        ${post.mediaType === "video"
          ? `<video src="${post.mediaUrl}" controls preload="metadata"></video>`
          : `<img src="${post.mediaUrl}" loading="lazy"/>`
        }
        <div class="post-caption">${escapeHTML(post.caption)}</div>
        <div class="post-stats">
          ❤️ ${post.likesCount || 0} • 💬 ${post.commentsCount || 0} • ⚡ Boost: ${post.boostAmount || 0}
        </div>
      `;
      postContainer.appendChild(card);
    }
  });
}

function escapeHTML(s) {
  return s?.replace(/[&<>"]+/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'
  })[c]) || "";
}

loadFeed();
