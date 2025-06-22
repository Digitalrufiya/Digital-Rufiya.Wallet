// app.js
import Web3 from "https://cdn.jsdelivr.net/npm/web3@4.0.3/+esm";

// Contract Info
const contractAddress = "0x9CF972437e17927C1114F44D2D38aA77c4845d01"; // DRFM
const contractABI = [ /* ... (PASTE YOUR FULL ABI HERE) ... */ ];

// Pinata JWT
const pinataJWT = "Bearer eyJhbGciOiJIUzI1NiIs...YOUR_JWT_HERE";

let web3;
let contract;
let currentAccount = null;

const connectBtn = document.getElementById("connectBtn");
const uploadForm = document.getElementById("uploadForm");
const postContainer = document.getElementById("postContainer");

connectBtn.onclick = async () => {
  if (window.ethereum) {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      currentAccount = accounts[0];
      contract = new web3.eth.Contract(contractABI, contractAddress);
      connectBtn.innerText = currentAccount.slice(0, 6) + "..." + currentAccount.slice(-4);
      loadPosts();
    } catch (err) {
      alert("Connection rejected");
    }
  } else {
    alert("Please install MetaMask");
  }
};

uploadForm.onsubmit = async (e) => {
  e.preventDefault();
  const file = document.getElementById("mediaFile").files[0];
  const caption = document.getElementById("caption").value.trim();

  if (!file || caption.length < 4 || !currentAccount) {
    alert("Please connect wallet and complete the form.");
    return;
  }

  const fd = new FormData();
  fd.append("file", file);

  try {
    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: { Authorization: pinataJWT },
      body: fd
    });

    const { IpfsHash } = await res.json();
    const mediaType = file.type.startsWith("video") ? 1 : 0;

    await contract.methods.post(IpfsHash, mediaType).send({ from: currentAccount });
    alert("Post uploaded successfully!");
    document.getElementById("uploadForm").reset();
    loadPosts();
  } catch (err) {
    console.error(err);
    alert("Upload failed");
  }
};

async function loadPosts() {
  postContainer.innerHTML = "<p>Loading...</p>";
  try {
    const count = await contract.methods.totalPosts().call();
    postContainer.innerHTML = "";
    for (let i = count - 1; i >= 0; i--) {
      const post = await contract.methods.getPost(i).call();
      const mediaUrl = `https://gateway.pinata.cloud/ipfs/${post.ipfsHash}`;
      const mediaHtml =
        post.mediaType == 1
          ? `<video src="${mediaUrl}" controls></video>`
          : `<img src="${mediaUrl}" style="max-width:100%"/>`;

      const div = document.createElement("div");
      div.className = "post-item";
      div.innerHTML = `
        <div><strong>${post.author}</strong> (${new Date().toLocaleString()})</div>
        <div>${mediaHtml}</div>
        <p>Likes: ${post.likes}</p>
      `;
      postContainer.appendChild(div);
    }
  } catch (err) {
    console.error(err);
    postContainer.innerHTML = "<p>Failed to load posts.</p>";
  }
}
