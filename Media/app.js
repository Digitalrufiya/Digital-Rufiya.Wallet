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

// --- Your Firebase Config ---
const firebaseConfig = {
  apiKey: "AIzaSyB-W_j74lsbmJUFnTbJpn79HM62VLmkQC8",
  authDomain: "drfsocial-23a06.firebaseapp.com",
  databaseURL: "https://drfsocial-23a06-default-rtdb.firebaseio.com",
  projectId: "drfsocial-23a06",
  storageBucket: "drfsocial-23a06.appspot.com",
  messagingSenderId: "608135115201",
  appId: "1:608135115201:web:dc999df2c0c37241ff3f40"
};

const pinataJWT = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI4MDFmMDAxNy04YjZkLTQ2YjYtOGIwZi04Y2NkZWU5NzE4ODIiLCJlbWFpbCI6ImRpZ2l0YWxydWZpeWFAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjNkODdmOWVkOTA0ZGY4OTI2NTRjIiwic2NvcGVkS2V5U2VjcmV0IjoiYTI3OWU4ODU0ZDQ0YWY2Y2IxNzA0N2RhOThhYTc3MmExOTAyMmFhYTIwOTQ5YjEzN2Y5ZmIxMDI3YzAzYmY5ZiIsImV4cCI6MTc4MDQyMzA3Mn0.YpqewbjW7gAVyPSKYiO9Ym9QhddKc_1vm8CJIoXDQyA";

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const uploadForm = document.getElementById("uploadForm");
const mediaFile = document.getElementById("mediaFile");
const captionInput = document.getElementById("caption");
const postContainer = document.getElementById("postContainer");

let currentUser = null;

// Escape HTML helper
function escapeHTML(str) {
  return str.replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

// Listen for auth state changes
onAuthStateChanged(auth, user => {
  currentUser = user;

  if (user) {
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
    uploadForm.style.display = "block";
    renderPosts();
  } else {
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
    uploadForm.style.display = "none";
    postContainer.innerHTML = "<p>Please login to see posts.</p>";
  }
});

loginBtn.onclick = () => signInWithPopup(auth, provider).catch(e => alert("Login failed: " + e.message));
logoutBtn.onclick = () => signOut(auth).catch(e => alert("Logout failed: " + e.message));

// Upload form submit handler
uploadForm.addEventListener("submit", async e => {
  e.preventDefault();

  if (!currentUser) {
    alert("Please login first.");
    return;
  }

  if (!mediaFile.files.length) {
    alert("Please select a file.");
    return;
  }

  if (captionInput.value.trim().length < 4) {
    alert("Caption must be at least 4 characters.");
    return;
  }

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
      displayName: currentUser.displayName || "Anonymous",
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
          mediaHTML = `<video controls preload="metadata" width="100%">
            <source src="${post.mediaUrl}" type="${post.mediaMimeType || 'video/mp4'}" />
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
  }, { onlyOnce: false });
}
