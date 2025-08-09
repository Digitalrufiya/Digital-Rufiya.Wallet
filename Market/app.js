// app.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getDatabase, ref, push, set, get } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";
import {
  getAuth,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const pinataJWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI0MjA3ZmYxYS05MDU2LTRkZTktOGE2Yi1lM2JiZTA1YmY0YmEiLCJlbWFpbCI6ImRpZ2l0YWxydWZpeWF1bml2ZXJzaXR5QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI1MTNlNTlkNmE3NmY2YmE5NTY3MyIsInNjb3BlZEtleVNlY3JldCI6ImFkZTE0YWI1ODRlYzQyZWIzMjBkZWMxMGQzYWMxYzcxODkxN2QzM2Q2ZmRkNmM1NzA0OWRiM2RjY2U3ZWIzNzciLCJleHAiOjE3ODYyNjcyNjd9.mDau-cuVEKe9j-USepb4ju6NdVBY3y78hZaHfiKJZM0";

const firebaseConfig = {
  apiKey: "AIzaSyDBxNIIuYonkgF9m8QYdUFDOXIXAM6FYqA",
  authDomain: "drfmarket-place.firebaseapp.com",
  projectId: "drfmarket-place",
  storageBucket: "drfmarket-place.firebasestorage.app",
  messagingSenderId: "752616443115",
  appId: "1:752616443115:web:73b71924daf66ae9c882ae",
  measurementId: "G-MV9JQZHLLY",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const $ = (id) => document.getElementById(id);

const loginBtn = $("loginBtn");
const logoutBtn = $("logoutBtn");

const uploadForm = $("uploadForm");
const fileInput = $("mediaFile");
const titleInput = $("productTitle");
const priceInput = $("productPrice");
const locationInput = $("productLocation");
const contactInput = $("productContact");
const paymentLinkInput = $("paymentLink");

const progressContainer = $("prog");
const progressBar = $("progBar");

const postContainer = $("postContainer");
const searchInput = $("searchInput");

const menuToggle = document.getElementById("menuToggle");
const primaryNav = document.getElementById("primaryNav");

let currentUser = null;
let postsData = [];

function escapeHTML(str) {
  return str.replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[m]));
}

function toggleMenu() {
  if (primaryNav.style.display === "flex") {
    primaryNav.style.display = "none";
  } else {
    primaryNav.style.display = "flex";
  }
}

function initResponsiveMenu() {
  if (window.innerWidth <= 600) {
    primaryNav.style.display = "none";
  }
  menuToggle.addEventListener("click", toggleMenu);

  [...primaryNav.querySelectorAll("a")].forEach((a) => {
    a.addEventListener("click", () => {
      if (window.innerWidth <= 600) {
        primaryNav.style.display = "none";
      }
    });
  });

  document.addEventListener("click", (e) => {
    const target = e.target;
    if (
      window.innerWidth <= 600 &&
      !primaryNav.contains(target) &&
      target !== menuToggle
    ) {
      primaryNav.style.display = "none";
    }
  });
}

function setActiveNavLink() {
  [...primaryNav.querySelectorAll("a")].forEach((a) => {
    if (location.pathname.endsWith(a.getAttribute("href"))) {
      a.classList.add("active");
    } else {
      a.classList.remove("active");
    }
  });
}

function lazyLoadVideo(video) {
  video.dataset.loaded = false;
  video.oncanplay = () => (video.dataset.loaded = "true");
  video.onerror = () => {
    if (!video.retryCount) video.retryCount = 0;
    if (video.retryCount < 3) {
      setTimeout(() => {
        video.src = video.dataset.src; // retry loading
        video.load();
        video.retryCount++;
      }, 2 ** video.retryCount * 1000);
    }
  };
  video.src = video.dataset.src;
  video.load();
}

const videoObserver = new IntersectionObserver(
  (entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        lazyLoadVideo(entry.target);
        obs.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.25 }
);

async function shareProduct(product) {
  if (navigator.share) {
    try {
      await navigator.share({
        title: product.productTitle || "DRFMedia product",
        text: `Check out this product: ${product.productTitle}`,
        url: location.origin + "/media.html#" + product.id,
      });
    } catch {
      alert("Share cancelled or failed");
    }
  } else {
    const shareUrl = location.origin + "/media.html#" + product.id;
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("Link copied to clipboard:\n" + shareUrl);
    } catch {
      alert("Sharing not supported on this browser");
    }
  }
}

function renderPosts() {
  const term = searchInput.value.trim().toLowerCase();
  postContainer.innerHTML = "";

  for (const post of postsData) {
    const captionMatch = (post.caption || "").toLowerCase().includes(term);
    const titleMatch = (post.productTitle || "").toLowerCase().includes(term);
    const locationMatch = (post.productLocation || "").toLowerCase().includes(term);

    if (term && !captionMatch && !titleMatch && !locationMatch) {
      continue;
    }

    const article = document.createElement("article");
    article.className = "post-item";
    article.innerHTML = `
      <header class="post-owner">
        <img class="avatar" src="${post.photoURL || "https://via.placeholder.com/40"}" alt="User avatar" />
        <div>
          <div>${escapeHTML(post.displayName || "Anon")}</div>
          <time class="post-time" datetime="${new Date(post.timestamp).toISOString()}">
            ${new Date(post.timestamp).toLocaleString()}
          </time>
        </div>
      </header>
      <div class="post-caption">${escapeHTML(post.caption || "")}</div>
      <div class="post-media" id="media-${post.id}"></div>
      <div class="product-info">
        <div><strong>Product:</strong> ${escapeHTML(post.productTitle || "")}</div>
        <div class="product-price">Price: MVR ${post.productPrice ? Number(post.productPrice).toFixed(2) : "0.00"}</div>
        ${
          post.productLocation
            ? `<div><strong>Location:</strong> ${escapeHTML(post.productLocation)}</div>`
            : ""
        }
        <div class="product-contact"><strong>Contact:</strong> ${escapeHTML(post.productContact || "")}</div>
      </div>
      <div class="buttons">
        <a href="https://wa.me/${encodeURIComponent(post.productContact.replace(/[^0-9]/g, ""))}" target="_blank" rel="noopener" aria-label="Contact Seller on WhatsApp">Contact Seller</a>
        ${
          post.paymentLink
            ? `<a href="${post.paymentLink}" target="_blank" rel="noopener" class="btn" style="background:#28a745">Pay Now</a>`
            : ""
        }
        <button class="btn" style="background:#17a2b8">Share</button>
      </div>
    `;

    const mediaContainer = article.querySelector(`#media-${post.id}`);
    if (post.type && post.cid) {
      const url = "https://gateway.pinata.cloud/ipfs/" + post.cid;
      if (post.type.startsWith("video/")) {
        const video = document.createElement("video");
        video.controls = true;
        video.dataset.src = url;
        video.preload = "none";
        mediaContainer.appendChild(video);
        videoObserver.observe(video);
      } else if (post.type.startsWith("image/")) {
        const img = document.createElement("img");
        img.src = url;
        img.alt = post.productTitle || "Product image";
        img.onload = () => (img.dataset.loaded = "true");
        mediaContainer.appendChild(img);
      }
    }

    article.querySelector("button.btn").onclick = () => shareProduct(post);

    postContainer.appendChild(article);
  }
}

searchInput.addEventListener("input", renderPosts);

loginBtn.onclick = () => {
  signInWithPopup(auth, provider).catch((e) =>
    alert("Google sign-in failed: " + e.message)
  );
};

logoutBtn.onclick = () => signOut(auth);

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  if (user) {
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
    uploadForm.style.display = "block";
  } else {
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
    uploadForm.style.display = "none";
  }
});

uploadForm.onsubmit = async (e) => {
  e.preventDefault();
  if (!currentUser) {
    alert("Please sign in first");
    return;
  }

  const file = fileInput.files[0];
  if (!file) {
    alert("Select a media file");
    return;
  }
  if (titleInput.value.trim().length < 2) {
    alert("Product title must be at least 2 characters");
    return;
  }
  if (!priceInput.value || Number(priceInput.value) < 0) {
    alert("Enter a valid price");
    return;
  }
  if (!contactInput.value.trim() || contactInput.value.trim().length < 5) {
    alert("Enter valid WhatsApp or phone contact");
    return;
  }

  progressContainer.style.display = "block";
  progressBar.style.width = "0%";

  try {
    // Prepare upload to Pinata
    const data = new FormData();
    data.append("file", file);

    const metadata = {
      name: file.name,
      keyvalues: {
        uploadedBy: currentUser.uid,
        productTitle: titleInput.value.trim(),
      },
    };
    data.append("pinataMetadata", JSON.stringify(metadata));

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "https://api.pinata.cloud/pinning/pinFileToIPFS");
    xhr.setRequestHeader("Authorization", "Bearer " + pinataJWT);

    xhr.upload.onprogress = (evt) => {
      if (evt.lengthComputable) {
        const percent = (evt.loaded / evt.total) * 100;
        progressBar.style.width = percent.toFixed(2) + "%";
      }
    };

    const uploadPromise = new Promise((resolve, reject) => {
      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error("Pinata upload failed: " + xhr.statusText));
        }
      };
      xhr.onerror = () => reject(new Error("Pinata upload failed"));
    });

    xhr.send(data);

    const pinataResp = await uploadPromise;
    const cid = pinataResp.IpfsHash;

    // Save post metadata to Firebase Realtime DB
    const postsRef = ref(db, "posts");
    const newPostRef = push(postsRef);
    await set(newPostRef, {
      uid: currentUser.uid,
      displayName: currentUser.displayName || "Anon",
      photoURL: currentUser.photoURL || "",
      timestamp: Date.now(),
      caption: escapeHTML(titleInput.value.trim()),
      productTitle: escapeHTML(titleInput.value.trim()),
      productPrice: Number(priceInput.value),
      productLocation: escapeHTML(locationInput.value.trim()),
      productContact: escapeHTML(contactInput.value.trim()),
      paymentLink: paymentLinkInput.value.trim() || null,
      type: file.type,
      cid,
      id: newPostRef.key,
    });

    uploadForm.reset();
    progressContainer.style.display = "none";
    progressBar.style.width = "0%";

    alert("Product posted successfully!");
    await fetchPosts();
  } catch (error) {
    alert("Upload failed: " + error.message);
    progressContainer.style.display = "none";
    progressBar.style.width = "0%";
  }
};

async function fetchPosts() {
  const postsRef = ref(db, "posts");
  const snapshot = await get(postsRef);
  if (!snapshot.exists()) {
    postsData = [];
    renderPosts();
    return;
  }
  postsData = Object.values(snapshot.val());
  postsData.sort((a, b) => b.timestamp - a.timestamp);
  renderPosts();
}

window.addEventListener("load", () => {
  initResponsiveMenu();
  setActiveNavLink();
  fetchPosts();
});
