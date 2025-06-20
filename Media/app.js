// app.js - Firebase + Pinata + Timeline Logic

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onValue
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";
import {
  getAuth,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  onAuthStateChanged
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

const pinataJWT = "Bearer eyJhbGciOiJI...<truncated_for_safety>...";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth();
const provider = new GoogleAuthProvider();

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const uploadForm = document.getElementById("uploadForm");
const mediaFileInput = document.getElementById("mediaFile");
const captionInput = document.getElementById("caption");
const postContainer = document.getElementById("postContainer");
const loadingSpinner = document.getElementById("loadingSpinner");

let currentUser = null;
let allPosts = [];

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  loginBtn.style.display = user ? "none" : "block";
  logoutBtn.style.display = user ? "block" : "none";
  uploadForm.style.display = user ? "block" : "none";
  renderPosts();
});

loginBtn.onclick = () => signInWithPopup(auth, provider);
logoutBtn.onclick = () => signOut(auth);

uploadForm.onsubmit = async (e) => {
  e.preventDefault();
  if (!mediaFileInput.files.length || captionInput.value.length < 4) return;

  const file = mediaFileInput.files[0];
  const caption = captionInput.value.trim();
  uploadForm.querySelector("button").disabled = true;

  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: { Authorization: pinataJWT },
      body: formData
    });

    const { IpfsHash } = await res.json();

    await push(ref(db, "posts"), {
      userId: currentUser.uid,
      displayName: currentUser.displayName,
      photoURL: currentUser.photoURL,
      caption,
      mediaUrl: IpfsHash,
      mediaType: file.type.startsWith("video") ? "video" : "image",
      timestamp: Date.now(),
      likes: {},
      comments: {}
    });

    mediaFileInput.value = "";
    captionInput.value = "";
    uploadForm.style.display = "none";
  } catch (err) {
    alert("Failed to upload: " + err.message);
  } finally {
    uploadForm.querySelector("button").disabled = false;
  }
};

onValue(ref(db, "posts"), (snapshot) => {
  const posts = snapshot.val() || {};
  allPosts = Object.values(posts).sort((a, b) => b.timestamp - a.timestamp);
  renderPosts();
});

function renderPosts() {
  postContainer.innerHTML = "";
  for (const post of allPosts) {
    const div = document.createElement("div");
    div.className = "post-item";

    const media = post.mediaType === "video"
      ? `<video controls src='https://gateway.pinata.cloud/ipfs/${post.mediaUrl}'></video>`
      : `<img src='https://gateway.pinata.cloud/ipfs/${post.mediaUrl}' alt='Media' />`;

    div.innerHTML = `
      <div class="post-owner">${post.displayName}</div>
      <div class="post-time">${new Date(post.timestamp).toLocaleString()}</div>
      <div class="post-caption">${post.caption}</div>
      ${media}
    `;
    postContainer.appendChild(div);
  }
}
