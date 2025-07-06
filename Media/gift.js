// gifts.js
// Handles wallet connection and sending preset gift amounts to any wallet address

import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.min.js";

class GiftSender {
  constructor(connectBtnId, postsContainerId) {
    this.signer = null;
    this.userAddress = null;
    this.connectBtn = document.getElementById(connectBtnId);
    this.postsContainer = document.getElementById(postsContainerId);

    this.giftOptions = [
      { label: "🌹 Rose", amountEth: "1.0" },
      { label: "💖 Heart", amountEth: "5.0" },
      { label: "🦁 Lion", amountEth: "10.0" },
      { label: "🛡️ Protection", amountEth: "15.0" },
      { label: "🙏 Dua", amountEth: "30.0" }
    ];

    if (!this.connectBtn || !this.postsContainer) {
      console.error("GiftSender: Connect button or posts container not found.");
      return;
    }

    this.setupConnectButton();
  }

  setupConnectButton() {
    this.connectBtn.addEventListener("click", async () => {
      if (!window.ethereum) {
        alert("Please install MetaMask or compatible wallet to send gifts.");
        return;
      }
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        this.signer = provider.getSigner();
        this.userAddress = await this.signer.getAddress();

        this.connectBtn.textContent = `Connected: ${this.userAddress.substring(0,6)}...${this.userAddress.slice(-4)}`;
        this.connectBtn.disabled = true;
        this.renderGiftButtonsForAllPosts();
      } catch (err) {
        alert("Wallet connection failed: " + err.message);
      }
    });
  }

  // Render gift buttons for all posts inside postsContainer
  renderGiftButtonsForAllPosts() {
    const postElements = this.postsContainer.querySelectorAll(".post-item");
    postElements.forEach(postEl => {
      const postId = postEl.dataset.postId;
      // Expect the receiver wallet address is stored in data attribute data-wallet-address
      const receiverWallet = postEl.dataset.walletAddress;
      if (receiverWallet) {
        this.renderGiftButtons(postEl, receiverWallet);
      }
    });
  }

  // Render gift buttons inside a post element
  renderGiftButtons(postElement, receiverWalletAddress) {
    if (!postElement || !receiverWalletAddress) return;

    // Check if gifts container already exists, else create it
    let container = postElement.querySelector(".gifts-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "gifts-container";
      container.style.marginTop = "12px";
      postElement.appendChild(container);
    }
    container.innerHTML = ""; // clear previous buttons

    this.giftOptions.forEach(({ label, amountEth }) => {
      const btn = document.createElement("button");
      btn.textContent = `${label} $${amountEth}`;
      btn.className = "gift-btn";
      btn.style.marginRight = "8px";
      btn.onclick = () => this.sendGift(receiverWalletAddress, amountEth);
      container.appendChild(btn);
    });
  }

  async sendGift(toAddress, amountEth) {
    if (!this.signer) {
      alert("Please connect your wallet first!");
      return;
    }

    if (!ethers.utils.isAddress(toAddress)) {
      alert("Invalid recipient wallet address.");
      return;
    }

    try {
      const tx = await this.signer.sendTransaction({
        to: toAddress,
        value: ethers.utils.parseEther(amountEth),
      });
      alert(`Gift sent! Transaction hash:\n${tx.hash}`);
    } catch (err) {
      alert("Failed to send gift: " + err.message);
    }
  }
}

// Export for use in your app.js
export default GiftSender;
