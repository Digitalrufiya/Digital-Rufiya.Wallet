// wallet-connect.js

let userAddress = "";

async function connectWallet() {
  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      userAddress = accounts[0];
      document.getElementById("connectWallet").innerText = shortenAddress(userAddress);
    } catch (err) {
      alert("🛑 Wallet connection failed.");
    }
  } else {
    alert("🔌 Please install MetaMask or another Web3 wallet.");
  }
}

function shortenAddress(addr) {
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

// Auto-connect if already connected
window.addEventListener("DOMContentLoaded", async () => {
  if (window.ethereum && window.ethereum.selectedAddress) {
    userAddress = window.ethereum.selectedAddress;
    document.getElementById("connectWallet").innerText = shortenAddress(userAddress);
  }
  document.getElementById("connectWallet").addEventListener("click", connectWallet);
});

export { userAddress };
