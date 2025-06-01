// ipfs-upload.js

import { userAddress } from './wallet-connect.js';

const uploadForm = document.getElementById("uploadForm");
const statusMsg = document.getElementById("status");

uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!userAddress) {
    alert("Please connect your wallet first.");
    return;
  }

  const role = document.getElementById("role").value;
  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;
  const videoFile = document.getElementById("videoFile").files[0];

  if (!videoFile) {
    alert("Please select a video file.");
    return;
  }

  statusMsg.innerText = "Uploading video to IPFS...";

  try {
    const formData = new FormData();
    formData.append("file", videoFile);

    const res = await fetch("https://api.web3.storage/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer YOUR_WEB3_STORAGE_API_TOKEN`,
      },
      body: formData
    });

    const data = await res.json();

    if (data.cid) {
      const ipfsUrl = `https://ipfs.io/ipfs/${data.cid}`;
      statusMsg.innerHTML = `✅ Uploaded! IPFS URL: <a href="${ipfsUrl}" target="_blank">${ipfsUrl}</a>`;
    } else {
      statusMsg.innerText = "❌ Upload failed.";
    }
  } catch (err) {
    console.error(err);
    statusMsg.innerText = "❌ Error uploading to IPFS.";
  }
});
