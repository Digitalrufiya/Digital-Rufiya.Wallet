// app.js — DRFM Social DApp (No Backend, Smart Contract & IPFS Only)

import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@6.7.0/+esm";

// === CONFIG ===
const pinataJWT = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI4MDFmMDAxNy04YjZkLTQ2YjYtOGIwZi04Y2NkZWU5NzE4ODIiLCJlbWFpbCI6ImRpZ2l0YWxydWZpeWFAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjNkODdmOWVkOTA0ZGY4OTI2NTRjIiwic2NvcGVkS2V5U2VjcmV0IjoiYTI3OWU4ODU0ZDQ0YWY2Y2IxNzA0N2RhOThhYTc3MmExOTAyMmFhYTIwOTQ5YjEzN2Y5ZmIxMDI3YzAzYmY5ZiIsImV4cCI6MTc4MDQyMzA3Mn0.YpqewbjW7gAVyPSKYiO9Ym9QhddKc_1vm8CJIoXDQyA";
const contractAddress = "0x9CF972437e17927C1114F44D2D38aA77c4845d01";

import contractABI from "./drfm-abi.js";

let provider, signer, contract;

async function connectWallet() {
  if (!window.ethereum) return alert("MetaMask required");
  provider = new ethers.BrowserProvider(window.ethereum);
  signer = await provider.getSigner();
  contract = new ethers.Contract(contractAddress, contractABI, signer);
  const address = await signer.getAddress();
  document.getElementById("walletAddress").textContent = address;
  loadPosts();
}

document.getElementById("connectBtn").onclick = connectWallet;

document.getElementById("uploadForm").onsubmit = async (e) => {
  e.preventDefault();
  const fileInput = document.getElementById("mediaFile");
  const caption = document.getElementById("caption").value.trim();
  const file = fileInput.files[0];
  if (!file || !caption) return alert("File and caption required");

  // Upload to IPFS via Pinata
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: { Authorization: pinataJWT },
    body: fd
  });
  const data = await res.json();
  const ipfsHash = data.IpfsHash;
  const mediaType = file.type.startsWith("video") ? 1 : 0;

  // Call contract
  try {
    const tx = await contract.post(ipfsHash, mediaType);
    await tx.wait();
    alert("Posted successfully");
    loadPosts();
  } catch (err) {
    console.error(err);
    alert("Post failed: " + err.message);
  }
};

async function loadPosts() {
  const container = document.getElementById("postContainer");
  container.innerHTML = "<p>Loading...</p>";

  const total = await contract.totalPosts();
  let html = "";
  for (let i = total - 1; i >= 0; i--) {
    const post = await contract.getPost(i);
    const url = `https://gateway.pinata.cloud/ipfs/${post.ipfsHash}`;
    html += `
      <div class="post">
        <div class="post-header">
          <span>${post.author.slice(0, 6)}...${post.author.slice(-4)}</span>
        </div>
        ${post.mediaType === 1
          ? `<video src="${url}" controls></video>`
          : `<img src="${url}" loading="lazy">`
        }
        <p><strong>Likes:</strong> ${post.likes}</p>
        <p><strong>Flagged:</strong> ${post.flagged ? 'Yes' : 'No'}</p>
        <button onclick="like(${i})">❤️ Like</button>
        <div class="comment-section">
          <input type="text" placeholder="Comment..." id="comment-${i}"/>
          <button onclick="comment(${i})">💬 Send</button>
        </div>
      </div>
    `;
  }
  container.innerHTML = html;
}

window.like = async (id) => {
  const tx = await contract.likePost(id);
  await tx.wait();
  loadPosts();
};

window.comment = async (id) => {
  const text = document.getElementById("comment-"+id).value.trim();
  if (!text) return alert("Enter comment");
  const tx = await contract.commentOnPost(id, text);
  await tx.wait();
  loadPosts();
};
