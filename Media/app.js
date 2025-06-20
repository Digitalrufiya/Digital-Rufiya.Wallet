// app.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onValue,
  update,
  get,
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";
import {
  getAuth,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB-W_j74lsbmJUFnTbJpn79HM62VLmkQC8",
  authDomain: "drfsocial-23a06.firebaseapp.com",
  databaseURL: "https://drfsocial-23a06-default-rtdb.firebaseio.com",
  projectId: "drfsocial-23a06",
  storageBucket: "drfsocial-23a06.appspot.com",
  messagingSenderId: "608135115201",
  appId: "1:608135115201:web:dc999df2c0f37241ff3f40",
};

// ✅ Full Pinata JWT Token — DO NOT SHARE PUBLICLY!
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
  renderPosts(); // Re-render posts to update like/comment buttons visibility
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
        Authorization: pinataJWT,
      },
      body: formData,
    });

    if (!pinataRes.ok) throw new Error(`Pinata error: ${pinataRes.statusText}`);

    const { IpfsHash } = await pinataRes.json();
    const mediaUrl = `https://gateway.pinata.cloud/ipfs/${IpfsHash}`;

    const post = {
      userId: currentUser.uid,
      displayName: currentUser.displayName,
      photoURL: currentUser.photoURL,
      caption: captionInput.value.trim(),
      mediaUrl,
      mediaType: file.type.startsWith("video") ? "video" : "image",
      timestamp: Date.now(),
      likesCount: 0,
      commentsCount: 0,
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

// Fetch and render posts (with likes & comments)
function renderPosts() {
  const postsRef = ref(db, "posts");
  onValue(postsRef, (snapshot) => {
    postContainer.innerHTML = "";
    const data = snapshot.val();
    if (!data) return;

    // Sort posts by timestamp descending
    const posts = Object.entries(data).sort((a, b) => b[1].timestamp - a[1].timestamp);

    for (const [postId, post] of posts) {
      const likesCount = post.likesCount || 0;
      const commentsCount = post.commentsCount || 0;

      let userLiked = false;
      if (currentUser && post.likes && post.likes[currentUser.uid]) {
        userLiked = post.likes[currentUser.uid] === true;
      }

      const card = document.createElement("div");
      card.className = "post-item";

      card.innerHTML = `
        <div class="post-owner">
          <img src="${post.photoURL || 'https://via.placeholder.com/40'}" alt="User avatar" class="avatar" />
          <span>${post.displayName || "User"}</span>
        </div>
        <div class="post-time">${new Date(post.timestamp).toLocaleString()}</div>
        ${post.mediaType === "video"
          ? `<video src="${post.mediaUrl}" controls></video>`
          : `<img src="${post.mediaUrl}" alt="Post media" />`}
        <div class="post-caption">${post.caption}</div>

        <div class="post-actions">
          <button class="like-btn" data-postid="${postId}" aria-pressed="${userLiked}">
            ❤️ <span class="like-count">${likesCount}</span>
          </button>
          <button class="comment-toggle-btn" data-postid="${postId}" aria-expanded="false">
            💬 <span class="comment-count">${commentsCount}</span>
          </button>
        </div>

        <div class="comments-section" id="comments-${postId}" style="display:none;">
          <div class="comments-list"></div>
          ${currentUser ? `
          <form class="comment-form" data-postid="${postId}">
            <input type="text" placeholder="Write a comment..." required minlength="1" />
            <button type="submit">Send</button>
          </form>
          ` : `<p><em>Login to comment</em></p>`}
        </div>
      `;

      postContainer.appendChild(card);

      // Like button event
      const likeBtn = card.querySelector(".like-btn");
      likeBtn.onclick = () => toggleLike(postId, userLiked);

      // Comment toggle button event
      const commentToggleBtn = card.querySelector(".comment-toggle-btn");
      const commentsSection = card.querySelector(`#comments-${postId}`);
      commentToggleBtn.onclick = () => {
        const isVisible = commentsSection.style.display === "block";
        commentsSection.style.display = isVisible ? "none" : "block";
        commentToggleBtn.setAttribute("aria-expanded", !isVisible);
        if (!isVisible) loadComments(postId, commentsSection.querySelector(".comments-list"));
      };

      // Comment form submit
      const commentForm = card.querySelector(".comment-form");
      if (commentForm) {
        commentForm.onsubmit = async (e) => {
          e.preventDefault();
          const input = commentForm.querySelector("input");
          const text = input.value.trim();
          if (text.length < 1) return;

          try {
            await postComment(postId, text);
            input.value = "";
            loadComments(postId, commentsSection.querySelector(".comments-list"));
          } catch (err) {
            alert("Failed to post comment: " + err.message);
          }
        };
      }
    }
  });
}

// Toggle like/unlike
async function toggleLike(postId, currentlyLiked) {
  if (!currentUser) {
    alert("Please login to like posts.");
    return;
  }
  const likeRef = ref(db, `posts/${postId}/likes/${currentUser.uid}`);
  const postRef = ref(db, `posts/${postId}`);

  try {
    if (currentlyLiked) {
      // Remove like
      await update(likeRef, null);
      const snap = await get(postRef);
      const likesCount = snap.val()?.likesCount || 0;
      await update(postRef, { likesCount: Math.max(0, likesCount - 1) });
    } else {
      // Add like
      await update(likeRef, true);
      const snap = await get(postRef);
      const likesCount = snap.val()?.likesCount || 0;
      await update(postRef, { likesCount: likesCount + 1 });
    }
  } catch (err) {
    console.error(err);
    alert("Error updating like: " + err.message);
  }
}

// Load comments for post
async function loadComments(postId, container) {
  container.innerHTML = "Loading comments...";
  const commentsRef = ref(db, `comments/${postId}`);

  onValue(
    commentsRef,
    (snapshot) => {
      container.innerHTML = "";
      const comments = snapshot.val();
      if (!comments) {
        container.innerHTML = "<p>No comments yet.</p>";
        return;
      }
      const sortedComments = Object.values(comments).sort((a, b) => a.timestamp - b.timestamp);

      for (const comment of sortedComments) {
        const commentDiv = document.createElement("div");
        commentDiv.className = "comment-item";
        commentDiv.innerHTML = `
          <strong>${escapeHTML(comment.displayName || "User")}</strong>: ${escapeHTML(comment.text)}
          <div class="comment-time">${new Date(comment.timestamp).toLocaleString()}</div>
        `;
        container.appendChild(commentDiv);
      }
    },
    { onlyOnce: true }
  );
}

// Post a comment
async function postComment(postId, text) {
  if (!currentUser) throw new Error("Not logged in");
  const commentsRef = ref(db, `comments/${postId}`);
  const newCommentRef = push(commentsRef);

  const commentObj = {
    userId: currentUser.uid,
    displayName: currentUser.displayName,
    text,
    timestamp: Date.now(),
  };

  await newCommentRef.set(commentObj);

  // Update commentsCount
  const postRef = ref(db, `posts/${postId}`);
  const snap = await get(postRef);
  const commentsCount = snap.val()?.commentsCount || 0;
  await update(postRef, { commentsCount: commentsCount + 1 });
}

// Escape HTML utility
function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Initial render
renderPosts();
