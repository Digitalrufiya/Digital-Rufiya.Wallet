// gifts.js

// Import ethers.js from CDN for wallet connection and sending gifts
import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.min.js";

const giftOptions = [
  { label: "🌹 Rose", amount: "1.0" },
  { label: "💖 Heart", amount: "5.0" },
  { label: "🦁 Lion", amount: "10.0" },
  { label: "🛡️ Protection", amount: "15.0" },
  { label: "🙏 Dua", amount: "30.0" },
];

let signer;
let userAddress;

const giftsContainerId = "postGiftsContainer"; // ID for gifts container inside each post

// Connect wallet button setup
export function setupWalletConnect(connectBtnId) {
  const connectBtn = document.getElementById(connectBtnId);
  if (!connectBtn) return;

  connectBtn.onclick = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask or another Ethereum wallet.");
      return;
    }

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();
      userAddress = await signer.getAddress();

      connectBtn.textContent = `Connected: ${userAddress.substring(0, 6)}...${userAddress.slice(-4)}`;
      connectBtn.disabled = true;
    } catch (err) {
      alert("Wallet connection failed: " + err.message);
    }
  };
}

// Add gifting buttons inside a post container element (pass the post ID and post owner's wallet)
export function addGiftButtons(postId, receiverWalletAddress) {
  if (!receiverWalletAddress) return;

  // Find the post card element by postId (assumes post item has id = post-{postId})
  const postCard = document.querySelector(`.post-item[data-post-id="${postId}"]`);
  if (!postCard) return;

  // Create gifts container div
  let giftsContainer = postCard.querySelector(`#${giftsContainerId}`);
  if (!giftsContainer) {
    giftsContainer = document.createElement("div");
    giftsContainer.id = giftsContainerId;
    giftsContainer.style.marginTop = "10px";
    postCard.appendChild(giftsContainer);
  }
  giftsContainer.innerHTML = ""; // clear previous

  giftOptions.forEach(({ label, amount }) => {
    const btn = document.createElement("button");
    btn.textContent = `${label} $${amount}`;
    btn.style.marginRight = "6px";
    btn.onclick = () => sendGift(receiverWalletAddress, amount);
    giftsContainer.appendChild(btn);
  });
}

// Send gift as ETH/BNB/Native token to receiver wallet
async function sendGift(toAddress, amountEth) {
  if (!signer) {
    alert("Please connect your wallet first!");
    return;
  }

  try {
    const tx = await signer.sendTransaction({
      to: toAddress,
      value: ethers.utils.parseEther(amountEth),
    });
    alert(`Gift sent! Tx Hash: ${tx.hash}`);
  } catch (err) {
    alert("Failed to send gift: " + err.message);
  }
}
