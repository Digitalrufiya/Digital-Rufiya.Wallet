
// Global variables
let provider;
let signer;
let userAddress = "";

// DRF Token Info
const DRF_TOKEN_ADDRESS = "0x7788a60dbC85AB46767F413EC7d51F149AA1bec6";
const DRF_TOKEN_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

// Initialize wallet connection
async function connectWallet() {
  if (typeof window.ethereum === "undefined") {
    alert("Please install MetaMask or another Web3 wallet");
    return;
  }

  provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = provider.getSigner();
  userAddress = await signer.getAddress();

  // Set globally
  window.userAddress = userAddress;

  // Update UI if walletAddress element exists
  const addrEl = document.getElementById("walletAddress");
  if (addrEl) addrEl.textContent = shortenAddress(userAddress);

  // Show balance if balance element exists
  const balanceEl = document.getElementById("drfBalance");
  if (balanceEl) showDRFBalance();

  // Update QR code if element exists
  const qr = document.getElementById("receiveQR");
  if (qr) qr.src = `https://api.qrserver.com/v1/create-qr-code/?data=${userAddress}&size=150x150`;

  const addressText = document.getElementById("receiveAddress");
  if (addressText) addressText.textContent = userAddress;
}

function shortenAddress(addr) {
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

// Fetch and display DRF balance
async function showDRFBalance() {
  const token = new ethers.Contract(DRF_TOKEN_ADDRESS, DRF_TOKEN_ABI, provider);
  const rawBalance = await token.balanceOf(userAddress);
  const decimals = await token.decimals();
  const balance = ethers.utils.formatUnits(rawBalance, decimals);
  document.getElementById("drfBalance").textContent = parseFloat(balance).toFixed(2);
}

// Auto-connect if MetaMask already connected
window.addEventListener("DOMContentLoaded", async () => {
  if (window.ethereum && window.ethereum.selectedAddress) {
    connectWallet();
  }

  const connectBtn = document.getElementById("connectWalletBtn");
  if (connectBtn) connectBtn.addEventListener("click", connectWallet);
});
