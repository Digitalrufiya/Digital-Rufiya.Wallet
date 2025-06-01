// DRFT.js - Core functionality for DRFTube frontend

// Wallet connection
async function connectWallet() {
  if (window.ethereum) {
    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      const walletAddress = accounts[0];
      document.getElementById("wallet-address").innerText = `Connected: ${walletAddress}`;
    } catch (err) {
      console.error("User denied wallet connection", err);
    }
  } else {
    alert("Please install MetaMask to use DRFTube.");
  }
}

// Share video and reward
function rewardShare(userAddress, videoId) {
  // Simulate backend reward logic or smart contract call
  console.log(`Rewarding ${userAddress} for sharing video ${videoId}`);
  // Here you would integrate with smart contract or backend logic
}

// Handle video upload (simplified)
function handleVideoUpload() {
  const input = document.getElementById("video-input");
  const file = input.files[0];
  if (file) {
    alert("Video uploaded and sent to Filecoin via IPFS (simulated)");
    // Simulate backend logic / IPFS integration
  } else {
    alert("No video selected.");
  }
}

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("connect-btn").addEventListener("click", connectWallet);
  document.getElementById("upload-btn").addEventListener("click", handleVideoUpload);
});
