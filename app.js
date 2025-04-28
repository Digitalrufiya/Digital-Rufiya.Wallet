// app.js

// Constants
const ADMIN_EMAIL = "digitalrufiya@gmail.com";
const ADMIN_PASSWORD = "Zivian@2020";
const DRF_TOKEN_ADDRESS = "0x7788a60dbC85AB46767F413EC7d51F149AA1bec6";
const FEE_RECEIVER_ADDRESS = "0x7788a60dbC85AB46767F413EC7d51F149AA1bec6"; // Your address
const DRF_TOKEN_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint amount) returns (bool)",
  "function decimals() view returns (uint8)"
];

// Toast system
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerText = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Login
async function login() {
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  if (!username || !password) {
    showToast("Please fill all fields", "error");
    return;
  }

  if (username === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    localStorage.setItem("isAdmin", "true");
    localStorage.setItem("walletUser", username);
    window.location.href = "wallet.html";
    showToast("Admin Login Successful!");
  } else {
    localStorage.setItem("isAdmin", "false");
    localStorage.setItem("walletUser", username);
    window.location.href = "wallet.html";
    showToast("User Login Successful!");
  }
}

// Register
async function register() {
  const username = document.getElementById("registerUsername").value.trim();
  const password = document.getElementById("registerPassword").value.trim();

  if (!username || !password) {
    showToast("Please fill all fields", "error");
    return;
  }

  // Save user locally
  localStorage.setItem("walletUser", username);
  showToast("Registration successful!");
  window.location.href = "index.html";
}

// Logout
function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}

// Wallet Connection
let provider;
let signer;
let userAddress;

async function connectWallet() {
  try {
    if (window.ethereum === undefined) {
      showToast("MetaMask is not installed!", "error");
      return;
    }
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    userAddress = await signer.getAddress();
    document.getElementById("walletAddress").innerText = userAddress;
    showToast("Wallet connected!");
    fetchBalance();
  } catch (err) {
    console.error(err);
    showToast("Wallet connection failed", "error");
  }
}

// Fetch DRF Balance
async function fetchBalance() {
  try {
    const tokenContract = new ethers.Contract(DRF_TOKEN_ADDRESS, DRF_TOKEN_ABI, provider);
    const decimals = await tokenContract.decimals();
    const balance = await tokenContract.balanceOf(userAddress);
    const formatted = ethers.formatUnits(balance, decimals);
    document.getElementById("walletBalance").innerText = `${formatted} DRF`;
  } catch (err) {
    console.error(err);
    showToast("Error fetching balance", "error");
  }
}

// Send DRF Token with 5% Fee
async function sendTokens() {
  const receiver = document.getElementById("sendAddress").value.trim();
  const amountInput = document.getElementById("sendAmount").value.trim();

  if (!receiver || !amountInput) {
    showToast("Fill all fields to send!", "error");
    return;
  }

  try {
    const tokenContract = new ethers.Contract(DRF_TOKEN_ADDRESS, DRF_TOKEN_ABI, signer);
    const decimals = await tokenContract.decimals();
    const amount = ethers.parseUnits(amountInput, decimals);
    const fee = amount * BigInt(5) / BigInt(100);
    const sendAmount = amount - fee;

    // Send 5% fee first
    await tokenContract.transfer(FEE_RECEIVER_ADDRESS, fee);
    // Then send main amount
    await tokenContract.transfer(receiver, sendAmount);

    showToast("Tokens sent successfully!");
    fetchBalance();
  } catch (err) {
    console.error(err);
    showToast("Token sending failed", "error");
  }
}

// Dummy Receive Function (only shows user address)
function receiveTokens() {
  if (!userAddress) {
    showToast("Connect wallet first", "error");
    return;
  }
  navigator.clipboard.writeText(userAddress);
  showToast("Address copied to clipboard!");
}

// Exchange DRF (Dummy, real DEX needed for full exchange)
async function exchangeTokens() {
  const tokenOutAddress = document.getElementById("exchangeTokenOut").value.trim();
  const amountInput = document.getElementById("exchangeAmount").value.trim();

  if (!tokenOutAddress || !amountInput) {
    showToast("Fill all fields to exchange!", "error");
    return;
  }

  try {
    const tokenContract = new ethers.Contract(DRF_TOKEN_ADDRESS, DRF_TOKEN_ABI, signer);
    const decimals = await tokenContract.decimals();
    const amount = ethers.parseUnits(amountInput, decimals);
    const fee = amount * BigInt(5) / BigInt(100);
    const sendAmount = amount - fee;

    // Just transfer fee to admin (dummy)
    await tokenContract.transfer(FEE_RECEIVER_ADDRESS, fee);

    // Normally you should interact with PancakeSwap Router here to swap DRF -> tokenOut
    showToast("Exchange simulated! (5% fee collected)");

    fetchBalance();
  } catch (err) {
    console.error(err);
    showToast("Exchange failed", "error");
  }
}

// Protect wallet.html (if not logged in)
function protectWalletPage() {
  const user = localStorage.getItem("walletUser");
  if (!user) {
    window.location.href = "index.html";
  }
}

// Initialize Wallet Page
function initWallet() {
  protectWalletPage();
  document.getElementById("logoutButton").addEventListener("click", logout);
  document.getElementById("connectWalletBtn").addEventListener("click", connectWallet);
  document.getElementById("sendBtn").addEventListener("click", sendTokens);
  document.getElementById("receiveBtn").addEventListener("click", receiveTokens);
  document.getElementById("exchangeBtn").addEventListener("click", exchangeTokens);
}

// Auto-run
document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("connectWalletBtn")) {
    initWallet();
  }
});
