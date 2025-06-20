// app.js

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

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB-W_j74lsbmJUFnTbJpn79HM62VLmkQC8",
  authDomain: "drfsocial-23a06.firebaseapp.com",
  databaseURL: "https://drfsocial-23a06-default-rtdb.firebaseio.com",
  projectId: "drfsocial-23a06",
  storageBucket: "drfsocial-23a06.appspot.com",
  messagingSenderId: "608135115201",
  appId: "1:608135115201:web:dc999df2c0f37241ff3f40"
};

// ✅ Full JWT Token
const pinataJWT = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI4MDFmMDAxNy04YjZkLTQ2YjYtOGIwZi04Y2NkZWU5NzE4ODIiLCJlbWFpbCI6ImRpZ2l0YWxydWZpeWFAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjNkODdmOWVkOTA0ZGY4OTI2NTRjIiwic2NvcGVkS2V5U2VjcmV0IjoiYTI3OWU4ODU0ZDQ0YWY2Y2IxNzA0N2RhOThhYTc3MmExOTAyMmFhYTIwOTQ5YjEzN2Y5ZmIxMDI3YzAzYmY5ZiIsImV4cCI6MTc4MDQyMzA3Mn0.YpqewbjW7gAVyPSKYiO9Ym9QhddKc_1vm8CJIoXDQyA`;

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth();
const provider = new GoogleAuthProvider();

// DOM Elements
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const uploadForm = document.getElementById("uploadForm");
const mediaFileInput = document.getElementById("mediaFile");
const captionInput = document.getElementById("caption");
const postContainer = document.getElementById("postContainer");

let currentUser = null;

// Auth listeners
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  uploadForm.style.display = user ? "block" : "none";
  loginBtn.style.display = user ? "none" : "block";
  logoutBtn.style.display = user ? "block" : "none";
});

// Login & Logout
loginBtn.onclick = () => signInWithPopup(auth, provider).catch(console.error);
logoutBtn.onclick = () => signOut(auth);

// Upload media
uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!currentUser || !mediaFileInput.files.length || captionInput.value.length < 4) {
    alert("Missing media, caption, or login.");
    return;
  }

  const file = mediaFileInput.files[0];
  const formData = new FormData();
  formData.append("file", file);

  uploadForm.querySelector("button").disabled = true;

  try {
    const pinataRes = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: pinataJWT
      },
      body: formData
    });

    const { IpfsHash } = await pinataRes.json();
    const mediaUrl = `https://gateway.pinata.cloud/ipfs/${IpfsHash}`;

    const post = {
      userId: currentUser.uid,
      displayName: currentUser.displayName,
      photoURL: currentUser.photoURL,
      caption: captionInput.value.trim(),
      mediaUrl,
      mediaType: file.type.startsWith("video") ? "video" : "image",
      timestamp: Date.now()
    };

    await push(ref(db, "posts"), post);

    mediaFileInput.value = "";
    captionInput.value = "";
    alert("Uploaded successfully.");
  } catch (err) {
    console.error(err);
    alert("Upload failed: " + err.message);
  } finally {
    uploadForm.querySelector("button").disabled = false;
  }
});

// Fetch and render posts
onValue(ref(db, "posts"), (snapshot) => {
  postContainer.innerHTML = "";
  const data = snapshot.val();
  if (!data) return;

  const posts = Object.values(data).sort((a, b) => b.timestamp - a.timestamp);
  posts.forEach((post) => {
    const card = document.createElement("div");
    card.className = "post-item";
    card.innerHTML = `
      <div class="post-owner">${post.displayName || "User"}</div>
      <div class="post-time">${new Date(post.timestamp).toLocaleString()}</div>
      ${post.mediaType === "video"
        ? `<video src="${post.mediaUrl}" controls></video>`
        : `<img src="${post.mediaUrl}" alt="Post media" />`}
      <div class="post-caption">${post.caption}</div>
    `;
    postContainer.appendChild(card);
  });
});
