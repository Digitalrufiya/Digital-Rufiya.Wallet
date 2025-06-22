// app.js - Professional fixed version for DRFMedia timeline video issue

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

// Pinata JWT - keep secret in production
const pinataJWT = "Bearer YOUR_PINATA_JWT_TOKEN_HERE";

// Admin emails
const admins = new Set([
  "digitalrufiyauniversity@gmail.com",
  "digitalrufiya@gmail.com",
  "digitalrufiyacoin@gmail.com",
  "onenone91000@gmail.com"
]);

// DOM elements
const loginBtn      = document.getElementById("loginBtn");
const logoutBtn     = document.getElementById("logoutBtn");
const uploadForm    = document.getElementById("uploadForm");
const mediaFile     = document.getElementById("mediaFile");
const captionInput  = document.getElementById("caption");
const postContainer = document.getElementById("postContainer");

let currentUser = null;

// Auth state changes
onAuthStateChanged(auth, user => {
  currentUser = user;
  uploadForm.style.display = user ? "block" : "none";
  loginBtn.style.display  = user ? "none"  : "block";
  logoutBtn.style.display = user ? "block" : "none";
  renderPosts();
});

// Login/logout handlers
loginBtn.onclick  = () => signInWithPopup(auth, provider).catch(console.error);
logoutBtn.onclick = () => signOut(auth).catch(console.error);

// Upload form submission handler
uploadForm.addEventListener("submit", async e => {
  e.preventDefault();

  if (!currentUser) {
    alert("Please login first.");
    return;
  }

  if (!mediaFile.files.length) {
    alert("Please select a media file.");
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
    // Upload file to Pinata IPFS
    const resp = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: { Authorization: pinataJWT },
      body: fd
    });

    if (!resp.ok) {
      throw new Error(`Pinata upload failed: ${resp.status} ${resp.statusText}`);
    }

    const { IpfsHash } = await resp.json();

    if (!IpfsHash) {
      throw new Error("No IPFS hash returned from Pinata.");
    }

    const mediaUrl = `https://cloudflare-ipfs.com/ipfs/${IpfsHash}`;

    // Save post data to Firebase
    const newPostRef = push(ref(db, "posts"));
    await set(newPostRef, {
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

    // Clear form fields after successful upload
    captionInput.value = "";
    mediaFile.value = "";

  } catch (error) {
    console.error(error);
    alert("Upload error: " + error.message);
  } finally {
    uploadForm.querySelector("button").disabled = false;
  }
});

// Escape HTML special chars
function escapeHTML(str) {
  return str.replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
  );
}

// Render posts function with fixed video tag
function renderPosts() {
  onValue(ref(db, "posts"), snap => {
    postContainer.innerHTML = "";
    const data = snap.val();
    if (!data) return;

    Object.entries(data)
      .sort((a, b) => b[1].timestamp - a[1].timestamp)
      .forEach(([postId, post]) => {
        const liked = currentUser && post.likes && post.likes[currentUser.uid];
        const isAdmin = currentUser && admins.has(currentUser.email);

        const card = document.createElement("div");
        card.className = "post-item";

        card.innerHTML = `
          <div class="post-owner">
            <img src="${post.photoURL || ''}" class="avatar" alt="User avatar" />
            <strong>${escapeHTML(post.displayName || "Anonymous")}</strong>
          </div>
          <div class="post-time">${new Date(post.timestamp).toLocaleString()}</div>
          ${
            post.mediaType === "video"
              ? `
                <video controls preload="metadata" playsinline crossorigin="anonymous" style="max-width:100%; max-height:480px; background:black; border-radius:6px;">
                  <source src="${post.mediaUrl}" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              `
              : `<img src="${post.mediaUrl}" loading="lazy" alt="Post image" style="border-radius:6px;" />`
          }
          <div class="post-caption">${escapeHTML(post.caption)}</div>
          <div class="post-actions">
            <button class="like-btn" data-id="${postId}" aria-pressed="${liked ? "true" : "false"}">
              ❤️ <span>${post.likesCount || 0}</span>
            </button>
            <button class="comment-toggle" data-id="${postId}">
              💬 <span>${post.commentsCount || 0}</span>
            </button>
            <button class="share-btn" data-id="${postId}">🔗</button>
            ${
              isAdmin
                ? `<button class="delete-btn" data-id="${postId}">🗑️</button>`
                : ""
            }
          </div>
          <div class="comments" id="cmts-${postId}" style="display:none;">
            <div class="list"></div>
            ${
              currentUser
                ? `<form class="cmt-form" data-id="${postId}">
                     <input required minlength="1" placeholder="Add a comment…" aria-label="Add comment" />
                     <button type="submit">Send</button>
                   </form>`
                : `<em>Login to comment</em>`
            }
          </div>
        `;

        postContainer.appendChild(card);

        // Like button
        card.querySelector(".like-btn").onclick = () => toggleLike(postId, !!liked);

        // Comment toggle button
        card.querySelector(".comment-toggle").onclick = () => {
          const commentsSection = document.getElementById(`cmts-${postId}`);
          const isVisible = commentsSection.style.display === "block";
          commentsSection.style.display = isVisible ? "none" : "block";
          if (!isVisible) loadComments(postId);
        };

        // Share button
        card.querySelector(".share-btn").onclick = () => {
          const url = `${location.origin}${location.pathname}?postId=${postId}`;
          navigator.clipboard.writeText(url)
            .then(() => alert("Post URL copied to clipboard!"))
            .catch(() => prompt("Copy this URL:", url));
        };

        // Admin delete button
        if (isAdmin) {
          card.querySelector(".delete-btn").onclick = () => deletePost(postId);
        }

        // Comment form submit
        const cmtForm = card.querySelector(".cmt-form");
        if (cmtForm) {
          cmtForm.onsubmit = e => {
            e.preventDefault();
            const input = cmtForm.querySelector("input");
            if (input.value.trim()) {
              postComment(postId, input.value.trim());
              cmtForm.reset();
            }
          };
        }
      });
  });
}

// Toggle like/unlike a post
async function toggleLike(postId, liked) {
  if (!currentUser) return alert("Please login to like posts.");
  const likeRef = ref(db, `posts/${postId}/likes/${currentUser.uid}`);
  const postRef = ref(db, `posts/${postId}`);

  try {
    const snap = await get(postRef);
    let likesCount = snap.val().likesCount || 0;

    if (liked) {
      await remove(likeRef);
      likesCount = Math.max(0, likesCount - 1);
    } else {
      await set(likeRef, true);
      likesCount++;
    }

    await update(postRef, { likesCount });
  } catch (error) {
    alert("Error updating likes: " + error.message);
  }
}

// Load comments for a post
function loadComments(postId) {
  const list = document.querySelector(`#cmts-${postId} .list`);
  list.innerHTML = "Loading comments…";

  onValue(ref(db, `comments/${postId}`), snap => {
    list.innerHTML = "";
    const comments = snap.val();
    if (!comments) {
      list.innerHTML = "<em>No comments yet.</em>";
      return;
    }

    Object.values(comments)
      .sort((a, b) => a.timestamp - b.timestamp)
      .forEach(comment => {
        const div = document.createElement("div");
        div.className = "comment-item";
        div.innerHTML = `
          <strong>${escapeHTML(comment.displayName)}</strong>: ${escapeHTML(comment.text)}
          <div class="comment-time">${new Date(comment.timestamp).toLocaleString()}</div>
        `;
        list.appendChild(div);
      });
  });
}

// Post a comment
async function postComment(postId, text) {
  if (!currentUser) return;
  try {
    const newCommentRef = push(ref(db, `comments/${postId}`));
    await set(newCommentRef, {
      userId: currentUser.uid,
      displayName: currentUser.displayName,
      text,
      timestamp: Date.now()
    });

    // Update comment count on post
    const postRef = ref(db, `posts/${postId}`);
    const snap = await get(postRef);
    const currentCount = snap.val().commentsCount || 0;
    await update(postRef, { commentsCount: currentCount + 1 });
  } catch (error) {
    alert("Error posting comment: " + error.message);
  }
}

// Delete a post (admin only)
async function deletePost(postId) {
  if (!currentUser || !admins.has(currentUser.email)) {
    alert("You do not have permission to delete posts.");
    return;
  }

  if (!confirm("Are you sure you want to delete this post?")) return;

  try {
    await remove(ref(db, `posts/${postId}`));
    await remove(ref(db, `comments/${postId}`));
    alert("Post deleted.");
  } catch (error) {
    alert("Error deleting post: " + error.message);
  }
}

// Initialize rendering posts
renderPosts();
