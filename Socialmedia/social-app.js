// app.js

import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@6.7.0/dist/ethers.min.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyB-W_j74lsbmJUFnTbJpn79HM62VLmkQC8",
  authDomain: "drfsocial-23a06.firebaseapp.com",
  projectId: "drfsocial-23a06",
  storageBucket: "drfsocial-23a06.appspot.com",
  messagingSenderId: "608135115201",
  appId: "1:608135115201:web:dc999df2c0f37241ff3f40"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const pinataJWT = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."; // YOUR FULL JWT

const contractAddress = "0x9CF972437e17927C1114F44D2D38aA77c4845d01";
const charityWallet = "0x175390CB3C4E589b40CBe5a0f8c5752a4F1d973b";
const jizyaWallet = "0x175390CB3C4E589b40CBe5a0f8c5752a4F1d973b";

const abi = [
  // Paste full ABI here
];

let providerEthers, signer, contract;

async function initWallet() {
  if (window.ethereum) {
    providerEthers = new ethers.BrowserProvider(window.ethereum);
    signer = await providerEthers.getSigner();
    contract = new ethers.Contract(contractAddress, abi, signer);
  } else {
    alert("Please install MetaMask or use Web3 browser");
  }
}

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const uploadForm = document.getElementById("uploadForm");
const postContainer = document.getElementById("postContainer");

let currentUser = null;

onAuthStateChanged(auth, user => {
  currentUser = user;
  if (user) {
    loginBtn.style.display = "none";
    logoutBtn.style.display = "block";
    uploadForm.style.display = "block";
    initWallet();
    loadPosts();
  } else {
    loginBtn.style.display = "block";
    logoutBtn.style.display = "none";
    uploadForm.style.display = "none";
  }
});

loginBtn.onclick = () => signInWithPopup(auth, provider).catch(console.error);
logoutBtn.onclick = () => signOut(auth);

uploadForm.onsubmit = async e => {
  e.preventDefault();
  const caption = document.getElementById("caption").value.trim();
  const media = document.getElementById("mediaFile").files[0];
  if (!caption || !media || !contract) return alert("Missing fields or wallet not ready");

  const form = new FormData();
  form.append("file", media);
  const ipfsRes = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: { Authorization: pinataJWT },
    body: form
  });
  const { IpfsHash } = await ipfsRes.json();
  const mediaUrl = `https://gateway.pinata.cloud/ipfs/${IpfsHash}`;

  try {
    const tx = await contract.createPost(caption, mediaUrl);
    await tx.wait();
    alert("Post created and reward sent");
    document.getElementById("caption").value = "";
    document.getElementById("mediaFile").value = "";
    loadPosts();
  } catch (err) {
    console.error(err);
    alert("Post failed");
  }
};

async function loadPosts() {
  const postCount = await contract.getPostCount();
  postContainer.innerHTML = "";
  for (let i = postCount - 1; i >= 0; i--) {
    const post = await contract.posts(i);
    const div = document.createElement("div");
    div.className = "post";
    div.innerHTML = `
      <div><strong>${post.author}</strong> (${new Date(Number(post.timestamp) * 1000).toLocaleString()})</div>
      <div>${post.caption}</div>
      ${post.mediaUrl.endsWith(".mp4") ? `<video src="${post.mediaUrl}" controls width="300"></video>` : `<img src="${post.mediaUrl}" width="300" />`}
      <div>
        ❤️ ${post.likes} <button onclick="likePost(${i})">Like</button>
        💬 ${post.comments} <button onclick="commentPost(${i})">Comment</button>
        🔗 <button onclick="sharePost(${i})">Share</button>
      </div>
      <div id="comments-${i}"></div>
    `;
    postContainer.appendChild(div);
  }
}

window.likePost = async i => {
  try {
    const tx = await contract.likePost(i);
    await tx.wait();
    alert("Post liked - token burned");
    loadPosts();
  } catch (err) {
    alert("Failed to like");
  }
};

window.commentPost = async i => {
  const text = prompt("Enter your comment:");
  if (!text) return;
  try {
    const tx = await contract.commentPost(i, text);
    await tx.wait();
    alert("Comment added - token burned");
    loadPosts();
  } catch (err) {
    alert("Failed to comment");
  }
};

window.sharePost = async i => {
  try {
    const tx = await contract.sharePost(i);
    await tx.wait();
    alert("Post shared - reward sent");
    loadPosts();
  } catch (err) {
    alert("Failed to share");
  }
};
