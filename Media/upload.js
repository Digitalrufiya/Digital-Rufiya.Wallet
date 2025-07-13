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

/****************************************************
 * CONFIG & GLOBALS                                 *
 ****************************************************/
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
const db  = getDatabase(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// ––––––––––––––  IPFS Gateways (ordered) ––––––––––––––
const GATEWAYS = [
  "https://gateway.pinata.cloud/ipfs/",
  "https://cloudflare-ipfs.com/ipfs/",
  "https://ipfs.io/ipfs/"
];

/****************************************************
 * IPFS LAZY‑LOADER WITH AUTO‑FALLBACK              *
 ****************************************************/
function attachVideoWithFallback(video) {
  const hash = video.dataset.hash;
  const mime = video.dataset.mime || "video/mp4";
  let gw  = 0;

  const srcEl = document.createElement("source");
  srcEl.type  = mime;
  video.appendChild(srcEl);

  const tryNext = () => {
    if (gw >= GATEWAYS.length) {
      console.error("[IPFS] All gateways failed for", hash);
      return;
    }
    srcEl.src = GATEWAYS[gw++] + hash;
    video.load();
  };

  // First attempt immediately
  tryNext();

  // Fallbacks on error / after 5 s of stall
  video.addEventListener("error", tryNext);
  let stallTimer;
  video.addEventListener("waiting", () => {
    clearTimeout(stallTimer);
    stallTimer = setTimeout(tryNext, 5000); // if still waiting after 5 s → next GW
  });
}

const videoObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const vid = entry.target;
      if (vid.dataset.loaded) return;
      attachVideoWithFallback(vid);
      vid.dataset.loaded = "1";
      videoObserver.unobserve(vid);
    });
  },
  { rootMargin: "300px" }
);

/****************************************************
 * DOM ELEMENTS                                     *
 ****************************************************/
const loginBtn   = document.getElementById("loginBtn");
const logoutBtn  = document.getElementById("logoutBtn");
const uploadForm = document.getElementById("uploadForm");
const mediaFile  = document.getElementById("mediaFile");
const captionInput  = document.getElementById("caption");
const postContainer = document.getElementById("postContainer");

let currentUser = null;
let isAdmin     = false;

/****************************************************
 * UTILITIES                                        *
 ****************************************************/
const escapeHTML = str => str.replace(/[&<>\"]/g, c => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "\"": "&quot;"
})[c]);
const notify = msg => alert(msg);
const checkAdmin = user => user?.email?.toLowerCase() === "digitalrufiya@gmail.com";

/****************************************************
 * AUTH HANDLING                                    *
 ****************************************************/
onAuthStateChanged(auth, user => {
  currentUser = user;
  isAdmin = checkAdmin(user);

  if (user) {
    loginBtn.style.display  = "none";
    logoutBtn.style.display = "inline-block";
    uploadForm.style.display = "block";
    notify(`Welcome, ${escapeHTML(user.displayName || "User")}!`);
    renderPosts();
  } else {
    isAdmin = false;
    loginBtn.style.display  = "inline-block";
    logoutBtn.style.display = "none";
    uploadForm.style.display = "none";
    postContainer.innerHTML = "<p>Please login to see posts.</p>";
  }
});

loginBtn.onclick  = () => signInWithPopup(auth, provider).catch(e => notify("Login failed: " + e.message));
logoutBtn.onclick = () => signOut(auth).catch(e => notify("Logout failed: " + e.message));

/****************************************************
 * UPLOAD NEW POST                                  *
 ****************************************************/
uploadForm.addEventListener("submit", async e => {
  e.preventDefault();
  if (!currentUser) return notify("Please login first.");
  if (!mediaFile.files.length) return notify("Select a file.");
  if (captionInput.value.trim().length < 4) return notify("Caption too short.");

  uploadForm.querySelector("button").disabled = true;
  const file = mediaFile.files[0];
  const fd = new FormData();
  fd.append("file", file);

  try {
    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: { Authorization: pinataJWT }, //  <-- define pinataJWT
      body: fd
    });
    if (!res.ok) throw new Error("Pinata upload failed");
    const { IpfsHash } = await res.json();

    await set(push(ref(db, "posts")), {
      userId: currentUser.uid,
      displayName: currentUser.displayName || "Anonymous",
      photoURL: currentUser.photoURL || "",
      caption: captionInput.value.trim(),
      ipfsHash: IpfsHash,
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
    mediaFile.value   = "";
    notify("Posted successfully!");
  } catch (err) {
    notify("Upload failed: " + err.message);
  } finally {
    uploadForm.querySelector("button").disabled = false;
  }
});

/****************************************************
 * RENDER POSTS LIST                                *
 ****************************************************/
function renderPosts() {
  videoObserver.disconnect();
  onValue(ref(db, "posts"), snap => {
    postContainer.innerHTML = "";
    const posts = snap.val();
    if (!posts) return (postContainer.innerHTML = "<p>No posts yet.</p>");

    // sort by engagement
    const ordered = Object.entries(posts).sort(([, a], [, b]) => {
      const s = p => (p.viewsCount||0) + (p.likesCount||0)*3 + (p.boostsCount||0)*5;
      return s(b) - s(a);
    });

    ordered.forEach(([id, p]) => {
      const card = document.createElement("div");
      card.className = "post-item";

      const ownerHTML = `
        <div style="display:flex;gap:10px;align-items:center;">
          <img src="${p.photoURL || ''}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;">
          <div>
            <strong>${escapeHTML(p.displayName || "Anonymous")}</strong><br>
            <small style="color:#666">${new Date(p.timestamp).toLocaleString()}</small>
          </div>
        </div>`;

      let mediaHTML = "";
      if (p.mediaType === "video") {
        mediaHTML = `<video controls preload="metadata" width="100%" loading="lazy" poster="https://via.placeholder.com/640x360?text=Loading…" data-hash="${p.ipfsHash}" data-mime="${p.mediaMimeType}"></video>`;
      } else {
        mediaHTML = `<img src="${GATEWAYS[0]+p.ipfsHash}" style="max-width:100%;border-radius:6px;">`;
      }

      card.innerHTML = `${ownerHTML}${mediaHTML}<p>${escapeHTML(p.caption)}</p>`;
      postContainer.appendChild(card);

      if (p.mediaType === "video") videoObserver.observe(card.querySelector("video"));
    });
  });
}

/****************************************************
 * FFMPEG COMMAND FOR USERS (DOC COMMENT)           *
 ****************************************************/
/*
ffmpeg -i input.mp4 \
  -vf "scale='min(1280,iw)':-2" \
  -c:v libx264 -profile:v high -preset fast -crf 24 -movflags +faststart \
  -c:a aac -b:a 128k \
  output_720p.mp4
*/
