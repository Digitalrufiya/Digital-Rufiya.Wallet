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

/* -------------------------------------------------- */
/* 🔧 CONFIGURATION                                    */
/* -------------------------------------------------- */
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

/* -------------------------------------------------- */
/* 🌐 IPFS GATEWAYS & LAZY‑LOADER                     */
/* -------------------------------------------------- */
// Gateways are tried in order until one succeeds
const GATEWAYS = [
  "https://gateway.pinata.cloud/ipfs/",
  "https://cloudflare-ipfs.com/ipfs/",
  "https://ipfs.io/ipfs/"
];

/** Build full <source> tags for every gateway */
function buildVideoSources(hash, mime) {
  return GATEWAYS.map(url => `<source src="${url + hash}" type="${mime || "video/mp4"}">`).join("");
}

// One global IntersectionObserver handles every video
const videoObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const video = entry.target;
      if (video.dataset.loaded) return; // already processed

      const hash = video.dataset.hash;
      const mime = video.dataset.mime;
      video.innerHTML = buildVideoSources(hash, mime);
      video.load();
      video.dataset.loaded = "1";
      videoObserver.unobserve(video);
    });
  },
  { rootMargin: "300px" } // start loading a bit before in‑view
);

/* -------------------------------------------------- */
/* 🔖 DOM ELEMENTS                                    */
/* -------------------------------------------------- */
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const uploadForm = document.getElementById("uploadForm");
const mediaFile = document.getElementById("mediaFile");
const captionInput = document.getElementById("caption");
const postContainer = document.getElementById("postContainer");

let currentUser = null;
let isAdmin = false;

/* -------------------------------------------------- */
/* 🛡️  UTILS                                          */
/* -------------------------------------------------- */
function escapeHTML(str) {
  return str.replace(/[&<>\"]/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;"
  })[c]);
}

function notify(msg) {
  alert(msg);
}

function checkAdmin(user) {
  return user?.email?.toLowerCase() === "digitalrufiya@gmail.com";
}

/* -------------------------------------------------- */
/* 👤 AUTH LISTENERS                                  */
/* -------------------------------------------------- */
onAuthStateChanged(auth, user => {
  currentUser = user;
  isAdmin = checkAdmin(user);

  if (user) {
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
    uploadForm.style.display = "block";
    notify(`Welcome, ${escapeHTML(user.displayName || "User")}!`);
    renderPosts(); // Only load posts after login!
  } else {
    isAdmin = false;
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
    uploadForm.style.display = "none";
    postContainer.innerHTML = "<p>Please login to see posts.</p>";
  }
});

loginBtn.onclick = () => signInWithPopup(auth, provider).catch(e => notify("Login failed: " + e.message));
logoutBtn.onclick = () => signOut(auth).catch(e => notify("Logout failed: " + e.message));

/* -------------------------------------------------- */
/* ⬆️  POST UPLOAD                                    */
/* -------------------------------------------------- */
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
      headers: { Authorization: pinataJWT }, // <-- define pinataJWT globally
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
      viewsCount: 0,
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

/* -------------------------------------------------- */
/* 📰 RENDER POSTS                                    */
/* -------------------------------------------------- */
function renderPosts() {
  // Disconnect previous observers to avoid leaks
  videoObserver.disconnect();

  onValue(ref(db, "posts"), snap => {
    postContainer.innerHTML = "";
    const data = snap.val();
    if (!data) {
      postContainer.innerHTML = "<p>No posts yet.</p>";
      return;
    }

    const postsArray = Object.entries(data).sort((a, b) => {
      const pa = a[1];
      const pb = b[1];
      const scoreA = (pa.viewsCount || 0) + (pa.likesCount || 0) * 3 + (pa.boostsCount || 0) * 5;
      const scoreB = (pb.viewsCount || 0) + (pb.likesCount || 0) * 3 + (pb.boostsCount || 0) * 5;
      return scoreB - scoreA;
    });

    for (const [postId, post] of postsArray) {
      const safeName = escapeHTML(post.displayName || "Anonymous");
      const safeCaption = escapeHTML(post.caption);

      const card = document.createElement("div");
      card.className = "post-item";

      /* ---------------- MEDIA BLOCK ---------------- */
      let mediaHTML = "";
      if (post.mediaType === "video") {
        mediaHTML = `<video controls preload="metadata" width="100%" loading="lazy" poster="https://via.placeholder.com/640x360?text=Loading..." data-hash="${post.ipfsHash}" data-mime="${post.mediaMimeType || "video/mp4"}"></video>`;
      } else {
        const imgUrl = `${GATEWAYS[0]}${post.ipfsHash}`;
        mediaHTML = `<img src="${imgUrl}" alt="Uploaded image" style="max-width:100%; border-radius:6px;" />`;
      }

      const likeCountId = `likeCount-${postId}`;
      const commentCountId = `commentCount-${postId}`;
      const boostCountId = `boostCount-${postId}`;

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

      // --- Attach lazy‑loading observer to any new video ---
      if (post.mediaType === "video") {
        const vid = card.querySelector("video[data-hash]");
        if (vid) videoObserver.observe(vid);
      }

      incrementViews(postId);
      setupLikes(postId);
      setupComments(postId);
      setupShare(postId);

      if (isAdmin) {
        const boostBtn = document.getElementById(`boostBtn-${postId}`);
        if (boostBtn) {
          boostBtn.onclick = async () => {
            await update(ref(db, `posts/${postId}`), {
              [`boostedBy/${currentUser.uid}`]: true,
              boostsCount: (post.boostsCount || 0) + 1
            });
            notify("Post boosted!");
            renderPosts();
          };
        }

        const deleteBtn = document.getElementById(`deleteBtn-${postId}`);
        if (deleteBtn) {
          deleteBtn.onclick = async () => {
            if (confirm("Are you sure you want to delete this post?")) {
              await remove(ref(db, `posts/${postId}`));
              notify("Post deleted.");
            }
          };
        }
      }
    }
  }, error => {
    console.error("Failed to load posts:", error);
    if (error.code === "PERMISSION_DENIED") {
      postContainer.innerHTML = "<p>Please login to view posts.</p>";
    } else {
      postContainer.innerHTML = `<p>Error loading posts: ${error.message}</p>`;
    }
  });
}

/* -------------------------------------------------- */
/* 📈 VIEWS / LIKES / COMMENTS / SHARE HANDLERS        */
/* -------------------------------------------------- */
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
  if (!likeBtn || !likeCountSpan) return;

  const likesRef = ref(db, `posts/${
