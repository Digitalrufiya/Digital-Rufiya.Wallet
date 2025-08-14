// app.js (or inside your <script type="module">)

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getDatabase, ref, push, set, get } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";
import { getAuth, signInWithPopup, signOut, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const pinataJWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI0MjA3ZmYxYS05MDU2LTRkZTktOGE2Yi1lM2JiZTA1YmY0YmEiLCJlbWFpbCI6ImRpZ2l0YWxydWZpeWF1bml2ZXJzaXR5QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI1MTNlNTlkNmE3NmY2YmE5NTY3MyIsInNjb3BlZEtleVNlY3JldCI6ImFkZTE0YWI1ODRlYzQyZWIzMjBkZWMxMGQzYWMxYzcxODkxN2QzM2Q2ZmRkNmM1NzA0OWRiM2RjY2U3ZWIzNzciLCJleHAiOjE3ODYyNjcyNjd9.mDau-cuVEKe9j-USepb4ju6NdVBY3y78hZaHfiKJZM0";

const firebaseConfig = {
  apiKey: "AIzaSyDBxNIIuYonkgF9m8QYdUFDOXIXAM6FYqA",
  authDomain: "drfmarket-place.firebaseapp.com",
  projectId: "drfmarket-place",
  storageBucket: "drfmarket-place.firebasestorage.app",
  messagingSenderId: "752616443115",
  appId: "1:752616443115:web:73b71924daf66ae9c882ae",
  measurementId: "G-MV9JQZHLLY"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const $ = (id) => document.getElementById(id);
const login = $("loginBtn"),
  logout = $("logoutBtn");
const upload = $("uploadForm"),
  fileIn = $("mediaFile"),
  titleIn = $("productTitle"),
  priceIn = $("productPrice"),
  locationIn = $("productLocation"),
  contactIn = $("productContact"),
  paymentLinkIn = $("paymentLink");
const prog = $("prog"),
  bar = $("progBar");
const posts = $("postContainer"),
  qIn = $("searchInput"),
  nav = $("primaryNav");

let user = null,
  all = [];

const escapeHTML = (s) =>
  s.replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[m]));

async function getGatewayUrl(cid) {
  const gateways = [
    "https://gateway.pinata.cloud/ipfs/",
    "https://cloudflare-ipfs.com/ipfs/",
    "https://ipfs.io/ipfs/",
  ];
  for (const g of gateways) {
    try {
      const res = await fetch(g + cid, { method: "HEAD" });
      if (res.ok) return g + cid;
    } catch {}
  }
  return null;
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

const observer = new IntersectionObserver(
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

async function shareProduct(p) {
  if (navigator.share) {
    try {
      await navigator.share({
        title: p.productTitle || 'DRFMedia product',
        text: `Check out this product: ${p.productTitle}`,
        url: location.origin + '/media.html#' + p.id
      });
    } catch (err) {
      alert('Share cancelled or failed');
    }
  } else {
    const shareUrl = location.origin + '/media.html#' + p.id;
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard:\n' + shareUrl);
    } catch {
      alert('Sharing not supported on this browser');
    }
  }
}

async function render() {
  const term = qIn.value.trim().toLowerCase();
  posts.innerHTML = "";
  for (const p of all) {
    if (term && !(p.caption || "").toLowerCase().includes(term) && !(p.productTitle || "").toLowerCase().includes(term) && !(p.productLocation || "").toLowerCase().includes(term))
      continue;

    const card = document.createElement("article");
    card.className = "post-item";
    card.innerHTML = `
      <header class="post-owner">
        <img class="avatar" src="${p.photoURL || "https://via.placeholder.com/40"}" alt="User avatar" />
        <div>
          <div>${escapeHTML(p.displayName || "Anon")}</div>
          <time class="post-time" datetime="${new Date(p.timestamp).toISOString()}">
            ${new Date(p.timestamp).toLocaleString()}
          </time>
        </div>
      </header>
      <div class="post-caption">${escapeHTML(p.caption || "")}</div>
      <div class="post-media" id="m-${p.id}"></div>
      <div class="product-info">
        <div><strong>Product:</strong> ${escapeHTML(p.productTitle || "")}</div>
        <div class="product-price">Price: MVR ${p.productPrice ? Number(p.productPrice).toFixed(2) : "0.00"}</div>
        ${p.productLocation ? `<div><strong>Location:</strong> ${escapeHTML(p.productLocation)}</div>` : ""}
        <div class="product-contact"><strong>Contact:</strong> ${escapeHTML(p.productContact || "")}</div>
      </div>
      <div class="buttons">
        <a href="https://wa.me/${encodeURIComponent(p.productContact.replace(/[^0-9]/g, ''))}" target="_blank" rel="noopener" aria-label="Contact Seller on WhatsApp">Contact Seller</a>
        ${p.paymentLink ? `<a href="${p.paymentLink}" target="_blank" rel="noopener" class="btn" aria-label="Pay Seller">Pay Seller</a>` : ""}
        <button class="btn" type="button" aria-label="Share product" data-id="${p.id}">Share</button>
      </div>
    `;
    posts.append(card);

    const holder = card.querySelector(`#m-${p.id}`);

    if (p.mediaType === "video") {
      const url = await getGatewayUrl(p.ipfsHash);
      if (url) {
        const v = document.createElement("video");
        v.controls = true;
        v.playsInline = true;
        v.preload = "metadata";
        v.dataset.src = url;
        observer.observe(v);
        holder.replaceWith(v);
      } else {
        holder.textContent = "Video unavailable.";
      }
    } else {
      const img = document.createElement("img");
      img.src = "https://gateway.pinata.cloud/ipfs/" + p.ipfsHash;
      img.alt = "Product media";
      holder.replaceWith(img);
    }
  }

  posts.querySelectorAll(".buttons button.btn").forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute("data-id");
      const post = all.find(x => x.id === id);
      if (post) shareProduct(post);
    };
  });
}

async function getPosts() {
  const snap = await get(ref(db, "posts"));
  const obj = snap.val() || {};
  all = Object.entries(obj)
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.timestamp - a.timestamp);
  render();
}

login.onclick = () => signInWithPopup(auth, provider);
logout.onclick = () => signOut(auth);
onAuthStateChanged(auth, (u) => {
  user = u;
  login.style.display = u ? "none" : "block";
  logout.style.display = u ? "block" : "none";
  upload.style.display = u ? "block" : "none";
  primaryNav.style.display = u ? "flex" : "none";
  getPosts();
});
qIn.oninput = render;

upload.onsubmit = async (e) => {
  e.preventDefault();
  if (!fileIn.files[0]) return alert("Choose a product image/video");
  if (titleIn.value.trim().length < 2) return alert("Product Title too short");
  if (!priceIn.value || Number(priceIn.value) < 0) return alert("Invalid price");
  if (contactIn.value.trim().length < 5) return alert("Enter valid contact info");

  const file = fileIn.files[0];
  upload.querySelector("button").disabled = true;
  prog.style.display = "block";
  bar.style.width = "0";

  try {
    // Upload to Pinata IPFS
    const fd = new FormData();
    fd.append("file", file);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "https://api.pinata.cloud/pinning/pinFileToIPFS");
    xhr.setRequestHeader("Authorization", "Bearer " + pinataJWT);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) bar.style.width = (e.loaded / e.total) * 100 + "%";
    };
    const cid = await new Promise((res, rej) => {
      xhr.onload = () => {
        try {
          const response = JSON.parse(xhr.responseText);
          if (response && response.IpfsHash) {
            res(response.IpfsHash);
          } else {
            rej("Pinata upload failed: No IpfsHash returned");
          }
        } catch {
          rej("Pinata upload failed: Invalid response");
        }
      };
      xhr.onerror = () => rej("Pinata upload failed: Network error");
      xhr.send(fd);
    });

    // Save post to Firebase DB
    const newRef = push(ref(db, "posts"));
    await set(newRef, {
      userId: user.uid,
      displayName: user.displayName || "Anon",
      photoURL: user.photoURL || "",
      caption: "",
      ipfsHash: cid,
      mediaType: file.type.startsWith("video") ? "video" : "image",
      timestamp: Date.now(),
      productTitle: titleIn.value.trim(),
      productPrice: Number(priceIn.value),
      productLocation: locationIn.value.trim(),
      productContact: contactIn.value.trim(),
      paymentLink: paymentLinkIn.value.trim(),
    });

    // Reset form UI
    fileIn.value = "";
    titleIn.value = "";
    priceIn.value = "";
    locationIn.value = "";
    contactIn.value = "";
    paymentLinkIn.value = "";
    bar.style.width = "100%";
    setTimeout(() => (prog.style.display = "none"), 400);
    getPosts();
  } catch (e) {
    alert(e);
    prog.style.display = "none";
  } finally {
    upload.querySelector("button").disabled = false;
  }
};
