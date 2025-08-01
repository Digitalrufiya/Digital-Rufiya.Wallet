import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set,
  onValue,
  get,
  remove,
  update,
  runTransaction
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
  appId: "1:608135115201:web:dc999df2c0c37241ff3f40"
};

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
let isAdmin = false;

function escapeHTML(str) {
  return str.replace(/[&<>\"]/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;"
  })[c]);
}

// Simple notification function (replace with custom UI or toast lib if you want)
function notify(msg) {
  alert(msg);
}

// Determine admin by email check
function checkAdmin(user) {
  return user?.email?.toLowerCase() === "digitalrufiya@gmail.com";
}

onAuthStateChanged(auth, user => {
  currentUser = user;
  isAdmin = checkAdmin(user);

  if (user) {
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
    uploadForm.style.display = "block";
    notify(`Welcome, ${escapeHTML(user.displayName || "User")}!`);

  } else {
    isAdmin = false;
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
    uploadForm.style.display = "none";
    postContainer.innerHTML = "<p>Please login to see posts.</p>";
  }
  renderPosts();
});

loginBtn.onclick = () => signInWithPopup(auth, provider).catch(e => notify("Login failed: " + e.message));
logoutBtn.onclick = () => signOut(auth).catch(e => notify("Logout failed: " + e.message));

uploadForm.addEventListener("submit", async e => {
  e.preventDefault();

  if (!currentUser) return notify("Please login first.");
  if (!mediaFile.files.length) return notify("Please select a file.");
  if (captionInput.value.trim().length < 4) return notify("Caption too short.");

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

    if (!res.ok) throw new Error("Pinata Upload Failed");

    const { IpfsHash } = await res.json();
    const mediaIpfsHash = IpfsHash;

    const newPostRef = push(ref(db, "posts"));
    await set(newPostRef, {
      userId: currentUser.uid,
      displayName: currentUser.displayName || "Anonymous",
      photoURL: currentUser.photoURL || "",
      caption: captionInput.value.trim(),
      ipfsHash: mediaIpfsHash,
      mediaType: file.type.startsWith("video") ? "video" : "image",
      mediaMimeType: file.type,
      timestamp: Date.now(),
      boostsCount: 0,
      boostedBy: {},
      likesCount: 0,
      likesBy: {},
      viewsCount: 0,  // Track views
      commentsCount: 0
    });

    captionInput.value = "";
    mediaFile.value = "";
    notify("Posted successfully!");

  } catch (err) {
    notify("Upload failed: " + err.message);
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

    // Sort by most viewed descending (for trending, combine likes+boosts+views)
    const postsArray = Object.entries(data).sort((a, b) => {
      const pa = a[1];
      const pb = b[1];
      // Trending score example: views *1 + likes*3 + boosts*5
      const scoreA = (pa.viewsCount||0) + (pa.likesCount||0)*3 + (pa.boostsCount||0)*5;
      const scoreB = (pb.viewsCount||0) + (pb.likesCount||0)*3 + (pb.boostsCount||0)*5;
      return scoreB - scoreA;
    });

    for (const [postId, post] of postsArray) {
      const safeName = escapeHTML(post.displayName || "Anonymous");
      const safeCaption = escapeHTML(post.caption);
      const mediaUrl = `https://gateway.pinata.cloud/ipfs/${post.ipfsHash}`;

      const card = document.createElement("div");
      card.className = "post-item";

      let mediaHTML = "";
      if(post.mediaType === "video") {
        mediaHTML = `<video controls preload="metadata" width="100%">
          <source src="${mediaUrl}" type="${post.mediaMimeType || 'video/mp4'}" />
          Your browser does not support the video tag.
        </video>`;
      } else {
        mediaHTML = `<img src="${mediaUrl}" alt="Uploaded image" style="max-width:100%; border-radius:6px;" />`;
      }

      const likeCountId = `likeCount-${postId}`;
      const commentCountId = `commentCount-${postId}`;
      const boostCountId = `boostCount-${postId}`;

      // Highlight boost button yellow if post is boosted by admin
      const isBoostedByAdmin = post.boostedBy && post.boostedBy[currentUser?.uid] && isAdmin;

      card.innerHTML = `
        <div class="post-owner" style="display:flex; align-items:center; gap:10px;">
          <img src="${post.photoURL || ''}" class="avatar" alt="User avatar" style="width:36px; height:36px; border-radius:50%; object-fit:cover;" />
          <div>
            <strong>${safeName}</strong><br/>
            <small style="font-size:0.85em; color:#666;">${new Date(post.timestamp).toLocaleString()}</small>
          </div>
        </div>
        ${mediaHTML}
        <div class="post-caption" style="margin-top:10px;">${safeCaption}</div>

        <div class="post-actions" style="margin-top:10px; display:flex; gap:10px; align-items:center;">
          <button id="likeBtn-${postId}" aria-label="Like post">👍 Like (<span id="${likeCountId}">${post.likesCount || 0}</span>)</button>
          <button id="commentToggleBtn-${postId}" aria-expanded="false" aria-controls="comments-${postId}">💬 Comment (<span id="${commentCountId}">${post.commentsCount || 0}</span>)</button>
          <button id="shareBtn-${postId}">🔗 Share</button>
          ${isAdmin ? `<button id="boostBtn-${postId}" style="background-color: ${isBoostedByAdmin ? 'gold' : ''};">🚀 Boost (<span id="${boostCountId}">${post.boostsCount || 0}</span>)</button>
                       <button id="deleteBtn-${postId}">🗑️ Delete</button>` : ""}
        </div>

        <div id="comments-${postId}" class="comments-section" style="display:none; margin-top:10px; border-top:1px solid #ccc; padding-top:10px;">
          <div id="commentList-${postId}" style="max-height:150px; overflow-y:auto; margin-bottom:5px;"></div>
          <textarea id="commentInput-${postId}" rows="2" placeholder="Write a comment..." style="width:100%; padding:6px; resize:vertical;"></textarea>
          <button id="submitCommentBtn-${postId}" style="margin-top:5px;">Post Comment</button>
        </div>
      `;

      postContainer.appendChild(card);

      // Increment views count on render (transaction to avoid race)
      incrementViews(postId);

      setupLikes(postId);
      setupComments(postId);
      setupShare(postId);

      if (isAdmin) {
        const boostBtn = document.getElementById(`boostBtn-${postId}`);
        boostBtn.onclick = async () => {
          const boostedByPath = `posts/${postId}/boostedBy/${currentUser.uid}`;
          await update(ref(db, `posts/${postId}`), {
            [`boostedBy/${currentUser.uid}`]: true,
            boostsCount: (post.boostsCount || 0) + 1
          });
          notify("Post boosted!");
          renderPosts(); // re-render for updated UI
        };

        const deleteBtn = document.getElementById(`deleteBtn-${postId}`);
        deleteBtn.onclick = async () => {
          if (confirm("Are you sure you want to delete this post?")) {
            await remove(ref(db, `posts/${postId}`));
            notify("Post deleted.");
          }
        };
      }
    }
  });
}

async function incrementViews(postId) {
  const viewsRef = ref(db, `posts/${postId}/viewsCount`);
  try {
    await runTransaction(viewsRef, current => (current || 0) + 1);
  } catch (e) {
    console.error("Failed to increment views:", e);
  }
}

function setupLikes(postId) {
  const likeBtn = document.getElementById(`likeBtn-${postId}`);
  const likeCountSpan = document.getElementById(`likeCount-${postId}`);
  if(!likeBtn || !likeCountSpan) return;

  const likesRef = ref(db, `posts/${postId}/likesBy`);
  onValue(likesRef, snap => {
    const likesData = snap.val() || {};
    const count = Object.keys(likesData).length;
    likeCountSpan.textContent = count;

    if(currentUser && likesData[currentUser.uid]) {
      likeBtn.style.backgroundColor = "#0d6efd";
      likeBtn.style.color = "#fff";
    } else {
      likeBtn.style.backgroundColor = "";
      likeBtn.style.color = "";
    }
  });

  likeBtn.onclick = async () => {
    if(!currentUser) return notify("Please login to like posts.");

    const userLikeRef = ref(db, `posts/${postId}/likesBy/${currentUser.uid}`);
    const snap = await get(userLikeRef);

    if(snap.exists()) {
      await remove(userLikeRef);
    } else {
      await set(userLikeRef, true);
    }
  };
}

function setupComments(postId) {
  const commentToggleBtn = document.getElementById(`commentToggleBtn-${postId}`);
  const commentsSection = document.getElementById(`comments-${postId}`);
  const commentListDiv = document.getElementById(`commentList-${postId}`);
  const commentCountSpan = document.getElementById(`commentCount-${postId}`);
  const commentInput = document.getElementById(`commentInput-${postId}`);
  const submitCommentBtn = document.getElementById(`submitCommentBtn-${postId}`);

  if (!commentToggleBtn || !commentsSection || !commentListDiv || !commentCountSpan || !commentInput || !submitCommentBtn) return;

  commentToggleBtn.onclick = () => {
    const isVisible = commentsSection.style.display === "block";
    commentsSection.style.display = isVisible ? "none" : "block";
    commentToggleBtn.setAttribute("aria-expanded", !isVisible);
  };

  const commentsRef = ref(db, `comments/${postId}`);
  onValue(commentsRef, snap => {
    const commentsData = snap.val() || {};
    const commentsArr = Object.entries(commentsData).sort((a,b) => a[1].timestamp - b[1].timestamp);
    commentCountSpan.textContent = commentsArr.length;

    commentListDiv.innerHTML = commentsArr.map(([cid, comment]) => `
      <div style="border-bottom:1px dashed #ccc; padding:4px 0;">
        <strong>${escapeHTML(comment.displayName || "Anonymous")}:</strong> ${escapeHTML(comment.text)}
        <br/><small style="color:#666; font-size:0.8em;">${new Date(comment.timestamp).toLocaleString()}</small>
      </div>
    `).join("");
  });

  submitCommentBtn.onclick = async () => {
    if(!currentUser) return notify("Please login to comment.");
    const text = commentInput.value.trim();
    if(text.length === 0) return notify("Comment cannot be empty.");

    const newCommentRef = push(ref(db, `comments/${postId}`));
    await set(newCommentRef, {
      userId: currentUser.uid,
      displayName: currentUser.displayName || "Anonymous",
      text: text,
      timestamp: Date.now()
    });

    // Increment comment count on post (transaction)
    const commentCountRef = ref(db, `posts/${postId}/commentsCount`);
    try {
      await runTransaction(commentCountRef, current => (current || 0) + 1);
    } catch(e) {
      console.error("Failed to increment comment count:", e);
    }

    commentInput.value = "";
  };
}

function setupShare(postId) {
  const shareBtn = document.getElementById(`shareBtn-${postId}`);
  if (!shareBtn) return;
  shareBtn.onclick = () => {
    const url = `${location.origin}${location.pathname}#${postId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        notify("Post link copied to clipboard!");
      }).catch(() => {
        prompt("Copy this URL:", url);
      });
    } else {
      prompt("Copy this URL:", url);
    }
  };
}
