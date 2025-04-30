<div class="container">
  <h2>Register</h2>
  <form id="registerForm">
    <input type="email" id="registerEmail" placeholder="Email" required />
    <input type="text" id="wallet" placeholder="Wallet Address" required />
    <input type="password" id="registerPassword" placeholder="Password" required />
    <button type="submit">Register</button>
  </form>

  <div class="toggle">
    Already have an account? <a onclick="toggleForm()">Login</a>
  </div>
</div>



  

 const formTitle = document.getElementById("formTitle");
const emailInput = document.getElementById("registerUsername");
const passwordInput = document.getElementById("registerPassword");
const button = document.querySelector("button");
let isRegistering = true;

function toggleForm() {
  isRegistering = !isRegistering;
  formTitle.textContent = isRegistering ? "Register" : "Login";
  button.textContent = isRegistering ? "Register" : "Login";
  document.querySelector(".toggle").innerHTML = isRegistering
    ? 'Already have an account? <a onclick="toggleForm()">Login</a>'
    : 'Don\'t have an account? <a onclick="toggleForm()">Register</a>';
}

async function sha256(str) {
  const msgBuffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

async function register() {
  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;

  if (!email || !password) {
    alert("Email and Password required.");
    return;
  }

  const hashedPassword = await sha256(password);

  if (isRegistering) {
    if (localStorage.getItem(email)) {
      alert("User already exists.");
      return;
    }
    localStorage.setItem(email, hashedPassword);
    alert("Registered successfully.");
    toggleForm();
  } else {
    const storedHash = localStorage.getItem(email);
    if (!storedHash) {
      alert("User not found.");
      return;
    }
    if (storedHash === hashedPassword) {
      alert("Login successful.");
    } else {
      alert("Incorrect password.");
    }
  }
}




async function register() {
  const email = document.getElementById('registerUsername').value.trim().toLowerCase();
  const password = document.getElementById('registerPassword').value;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert("Please enter a valid email address.");
    return;
  }

  const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');

  if (users.find(u => u.email === email)) {
    alert("This email is already registered!");
    return;
  }

  const passwordHash = await hashSHA256(email + password);
  users.push({ email, passwordHash });
  localStorage.setItem('registeredUsers', JSON.stringify(users));

  alert("Registered successfully! Please login.");
  window.location.href = "index.html";
}







const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
let signer;
let userAddress;
const BSC_CHAIN_ID = '0x38';
const feeReceiver = "0x88253D87990EdD1E647c3B6eD21F57fb061a3040";
const BSC_SCAN_API = 'Your_BSCSCAN_API_KEY';
const PANCAKESWAP_BASE_URL = 'https://pancakeswap.finance/swap';

const tokens = {
  BNB: { symbol: 'BNB', address: null, decimals: 18 },
  DRF: { symbol: 'DRF', address: '0x7788a60dbC85AB46767F413EC7d51F149AA1bec6', decimals: 18 },
  USDT: { symbol: 'USDT', address: '0x55d398326f99059fF775485246999027B3197955', decimals: 18 },
  USDC: { symbol: 'USDC', address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d', decimals: 18 },
};

const erc20Abi = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint amount) returns (bool)"
];

const adminCredentials = { username: "digitalrufiya@gmail.com", password: "Zivian@2020" };
const users = JSON.parse(localStorage.getItem('registeredUsers')) || [];

// -------- Wallet Functions -------- //
async function connectWallet() {
  if (!window.ethereum) return alert("MetaMask not installed!");
  try {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    signer = ethersProvider.getSigner();
    userAddress = await signer.getAddress();
    localStorage.setItem('connectedWallet', userAddress);
    document.getElementById('userWalletAddress').innerText = userAddress;
    loadBalances();
  } catch (err) {
    console.error("Wallet connect failed", err);
  }
}

async function loadBalances() {
  if (!userAddress) return;
  const bnbBal = await ethersProvider.getBalance(userAddress);
  document.getElementById('userBalance').innerText = `${ethers.utils.formatEther(bnbBal)} BNB`;

  const div = document.getElementById('tokenBalances');
  div.innerHTML = '';

  for (const key in tokens) {
    if (tokens[key].address) {
      const contract = new ethers.Contract(tokens[key].address, erc20Abi, signer);
      const balance = await contract.balanceOf(userAddress);
      div.innerHTML += `<p>${key}: ${ethers.utils.formatUnits(balance, tokens[key].decimals)}</p>`;
    }
  }
}

async function sendToken() {
  const recipient = prompt("Enter recipient address:");
  const amount = prompt("Enter amount:");
  const token = prompt("Enter token (BNB, DRF, USDT, USDC):").toUpperCase();
  if (!recipient || !amount || !token || !tokens[token]) return alert("Invalid input");

  const decimals = tokens[token].decimals;
  const fee = (parseFloat(amount) * 0.06).toFixed(decimals);
  const sendAmt = (parseFloat(amount) - parseFloat(fee)).toFixed(decimals);

  if (token === 'BNB') {
    await signer.sendTransaction({ to: recipient, value: ethers.utils.parseEther(sendAmt) });
    await signer.sendTransaction({ to: feeReceiver, value: ethers.utils.parseEther(fee) });
  } else {
    const contract = new ethers.Contract(tokens[token].address, erc20Abi, signer);
    await contract.transfer(recipient, ethers.utils.parseUnits(sendAmt, decimals));
    await contract.transfer(feeReceiver, ethers.utils.parseUnits(fee, decimals));
  }

  alert("Transaction sent.");
}

// -------- UI Interaction -------- //
function openSend() { sendToken(); }

function openReceive() {
  const addr = userAddress || localStorage.getItem('connectedWallet');
  if (!addr) return alert("Connect Wallet First");
  const qrDiv = document.getElementById('transactionArea');
  qrDiv.innerHTML = `<h3>Receive Address</h3><p>${addr}</p><div id="qrcode"></div>`;
  new QRCode(document.getElementById('qrcode'), addr);
}

function openExchange() {
  window.open(`${PANCAKESWAP_BASE_URL}?outputCurrency=${tokens.DRF.address}`, '_blank');
}

async function openHistory() {
  const res = await fetch(`https://api.bscscan.com/api?module=account&action=txlist&address=${userAddress}&startblock=0&endblock=99999999&sort=desc&apikey=${BSC_SCAN_API}`);
  const data = await res.json();
  const div = document.getElementById('transactionArea');
  div.innerHTML = "<h3>Transaction History</h3>";

  data.result.slice(0, 10).forEach(tx => {
    div.innerHTML += `
      <div>
        <p>Hash: <a href="https://bscscan.com/tx/${tx.hash}" target="_blank">${tx.hash.slice(0, 10)}...</a></p>
        <p>From: ${tx.from.slice(0, 6)}... To: ${tx.to.slice(0, 6)}... Value: ${ethers.utils.formatEther(tx.value)} BNB</p>
        <hr/>
      </div>`;
  });
}

// -------- Auth -------- //
function login() {
  const user = document.getElementById('loginUsername').value.trim().toLowerCase();
  const pass = document.getElementById('loginPassword').value;
  if (user === adminCredentials.username && pass === adminCredentials.password) {
    window.location.href = 'admin.html';
  } else if (users.find(u => u.username === user && u.password === pass)) {
    window.location.href = 'wallet.html';
  } else {
    alert("Invalid credentials");
  }
}

function register() {
  const user = document.getElementById('registerUsername').value.trim().toLowerCase();
  const pass = document.getElementById('registerPassword').value;
  if (users.find(u => u.username === user)) return alert("Username already exists!");
  users.push({ username: user, password: pass });
  localStorage.setItem('registeredUsers', JSON.stringify(users));
  alert("Registered successfully");
  window.location.href = "index.html";
}

function logout() {
  localStorage.removeItem('connectedWallet');
  window.location.href = 'index.html';
}

function logoutAdmin() {
  window.location.href = 'index.html';
}

// -------- Events -------- //
window.addEventListener('load', () => {
  const saved = localStorage.getItem('connectedWallet');
  if (saved) document.getElementById('userWalletAddress').innerText = saved;
});

// Ethereum account change
if (window.ethereum) {
  window.ethereum.on('accountsChanged', (accounts) => {
    if (accounts.length > 0) {
      localStorage.setItem('connectedWallet', accounts[0]);
      document.getElementById('userWalletAddress').innerText = accounts[0];
    } else {
      localStorage.removeItem('connectedWallet');
      document.getElementById('userWalletAddress').innerText = 'Not connected';
    }
  });
}

// Optional admin/init methods (only if defined elsewhere)
// checkAdminSession();
// startInactivityMonitor();
// renderUserTable();
// renderTxLogs();
// document.getElementById('exportCSV')?.addEventListener('click', downloadCSV);









// === Libraries & Frameworks ===
import 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js';

// === Global Constants ===
const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
let signer;
let userAddress;
const BSC_CHAIN_ID = '0x38';
const feeReceiver = "0x88253D87990EdD1E647c3B6eD21F57fb061a3040";
const BSC_SCAN_API = 'Your_BSCSCAN_API_KEY';
const PANCAKESWAP_BASE_URL = 'https://pancakeswap.finance/swap';

const tokens = {
  BNB: { symbol: 'BNB', address: null, decimals: 18 },
  DRF: { symbol: 'DRF', address: '0x7788a60dbC85AB46767F413EC7d51F149AA1bec6', decimals: 18 },
  USDT: { symbol: 'USDT', address: '0x55d398326f99059fF775485246999027B3197955', decimals: 18 },
  USDC: { symbol: 'USDC', address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d', decimals: 18 },
};

const erc20Abi = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint amount) returns (bool)"
];

// === Secure Storage & Auth ===
let users = JSON.parse(localStorage.getItem('registeredUsers')) || [];
const adminStorageKey = 'admin_cred_hash';

function hash256(str) {
  return crypto.subtle.digest('SHA-256', new TextEncoder().encode(str)).then(buf =>
    Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
  );
}

// === Registration & Login ===
async function register() {
  const username = document.getElementById('registerUsername').value;
  const password = document.getElementById('registerPassword').value;
  if (users.find(u => u.username === username)) return alert("Username exists");
  const passHash = await hash256(password);
  users.push({ username, password: passHash });
  localStorage.setItem('registeredUsers', JSON.stringify(users));
  alert("Registered successfully");
  window.location.href = "index.html";
}

async function login() {
  const user = document.getElementById('loginUsername').value;
  const pass = document.getElementById('loginPassword').value;
  const passHash = await hash256(pass);
  const adminHash = localStorage.getItem(adminStorageKey);

  if (user === 'digitalrufiya@gmail.com' && passHash === adminHash) {
    sessionStorage.setItem('adminLoggedIn', 'true');
    sessionStorage.setItem('lastActivity', Date.now());
    window.location.href = 'admin.html';
  } else if (users.find(u => u.username === user && u.password === passHash)) {
    sessionStorage.setItem('userLoggedIn', 'true');
    sessionStorage.setItem('lastActivity', Date.now());
    window.location.href = 'wallet.html';
  } else {
    alert("Invalid credentials");
  }
}

// === Wallet Connection ===
async function connectWallet() {
  if (!window.ethereum) return alert("MetaMask not installed!");
  try {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    signer = ethersProvider.getSigner();
    userAddress = await signer.getAddress();
    localStorage.setItem('connectedWallet', userAddress);
    updateWalletDisplay(userAddress);
    loadBalances();
  } catch (err) {
    console.error("Wallet connect failed", err);
  }
}

function updateWalletDisplay(address) {
  const el = document.getElementById('userWalletAddress');
  if (el) el.innerText = address || 'Not connected';
}

async function loadBalances() {
  if (!userAddress) return;
  const bnbBal = await ethersProvider.getBalance(userAddress);
  document.getElementById('userBalance').innerText = `${ethers.utils.formatEther(bnbBal)} BNB`;

  const div = document.getElementById('tokenBalances');
  div.innerHTML = '';
  for (const key in tokens) {
    const token = tokens[key];
    if (token.address) {
      const c = new ethers.Contract(token.address, erc20Abi, signer);
      const b = await c.balanceOf(userAddress);
      div.innerHTML += `<p>${key}: ${ethers.utils.formatUnits(b, token.decimals)}</p>`;
    }
  }
}

// === Admin & Utility Functions ===
function checkAdminSession() {
  if (!sessionStorage.getItem('adminLoggedIn')) window.location.href = 'index.html';
}

function logoutAdmin() {
  sessionStorage.removeItem('adminLoggedIn');
  window.location.href = 'index.html';
}

function logoutUser() {
  sessionStorage.removeItem('userLoggedIn');
  window.location.href = 'index.html';
}

function downloadCSV() {
  const data = users.map(u => `${u.username},${u.password}`).join("\n");
  const blob = new Blob([data], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'user_backup.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function notifyAdmin(message) {
  const notify = document.createElement('div');
  notify.className = 'alert alert-warning position-fixed bottom-0 end-0 m-3';
  notify.innerText = message;
  document.body.appendChild(notify);
  setTimeout(() => document.body.removeChild(notify), 5000);
}

function forgetPassword(username) {
  alert(`Password reset link has been sent to ${username}@email.com`);
}

// === Session Expiry (Updated setInterval) ===
function checkSessionTimeout() {
  const last = parseInt(sessionStorage.getItem('lastActivity'));
  if (!last) return;
  const now = Date.now();
  const isExpired = now - last > 1800000; // 30 minutes
  if (isExpired) {
    if (sessionStorage.getItem('adminLoggedIn')) logoutAdmin();
    if (sessionStorage.getItem('userLoggedIn')) logoutUser();
  }
}

document.addEventListener('mousemove', () => {
  if (sessionStorage.getItem('adminLoggedIn') || sessionStorage.getItem('userLoggedIn')) {
    sessionStorage.setItem('lastActivity', Date.now());
  }
});

setInterval(checkSessionTimeout, 60000); // Check every minute

// === QR Code Generation ===
function openReceive() {
  const addr = userAddress || localStorage.getItem('connectedWallet');
  if (!addr) return alert("Connect Wallet First");
  const qrDiv = document.getElementById('transactionArea');
  qrDiv.innerHTML = `<h3>Receive Address</h3><p>${addr}</p><div id="qrcode"></div>`;
  new QRCode(document.getElementById('qrcode'), addr);
}

// === Page Load Init ===
window.addEventListener('load', () => {
  const saved = localStorage.getItem('connectedWallet');
  if (saved) updateWalletDisplay(saved);
});

if (window.ethereum) {
  window.ethereum.on('accountsChanged', (accounts) => {
    const newAddr = accounts.length > 0 ? accounts[0] : null;
    if (newAddr) {
      localStorage.setItem('connectedWallet', newAddr);
    } else {
      localStorage.removeItem('connectedWallet');
    }
    updateWalletDisplay(newAddr);
  });
}

// === Utility: Fetch Wrapper ===
async function fetchData(url, options = {}) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
}










// ========== CONFIG ==========
const BSC_CHAIN_ID = '0x38';
const feeReceiver = "0x88253D87990EdD1E647c3B6eD21F57fb061a3040";
const PANCAKESWAP_BASE_URL = 'https://pancakeswap.finance/swap';
const BSC_SCAN_API = 'Your_BSCSCAN_API_KEY';
const ADMIN_HASH = "a3bcefaa11a28e88bd70337dd1f9f3e4f4c98ddbbacc1a5efbe21b5021427358";

// ========== GLOBALS ==========
const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
let signer, userAddress;
const tokens = {
  BNB: { symbol: 'BNB', address: null, decimals: 18 },
  DRF: { symbol: 'DRF', address: '0x7788a60dbC85AB46767F413EC7d51F149AA1bec6', decimals: 18 },
  USDT: { symbol: 'USDT', address: '0x55d398326f99059fF775485246999027B3197955', decimals: 18 },
  USDC: { symbol: 'USDC', address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d', decimals: 18 },
};
const erc20Abi = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint amount) returns (bool)"
];
let users = JSON.parse(localStorage.getItem('registeredUsers')) || [];

// ========== UTILITIES ==========

// SHA-256 hashing
async function hashSHA256(input) {
  const encoded = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// CSV export
function exportToCSV(dataArray, filename = "logs.csv") {
  const csv = dataArray.map(row => Object.values(row).join(",")).join("\n");
  const blob = new Blob([csv], { type: 'text/csv' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Fetch external IP
async function fetchData(url) {
  const res = await fetch(url);
  return res.json();
}

// ========== AUTH & SESSION ==========

// Admin login logger
async function logAdminLogin(email) {
  const ip = await fetchData('https://api.ipify.org?format=json');
  const device = navigator.userAgent;
  const timestamp = new Date().toISOString();
  const log = { email, ip: ip?.ip || 'Unknown', device, timestamp };
  localStorage.setItem("adminLoginLog", JSON.stringify(log));
  console.log("Admin login:", log);
}

// Admin timeout
function setupAdminSessionTimeout(minutes = 30) {
  let timer;
  function reset() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      alert("Session expired.");
      sessionStorage.clear();
      window.location.href = "admin.html";
    }, minutes * 60000);
  }
  window.addEventListener("mousemove", reset);
  window.addEventListener("keypress", reset);
  reset();
}

// Login system
async function login() {
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;
  const hash = await hashSHA256(username + password);

  if (hash === ADMIN_HASH) {
    await logAdminLogin(username);
    window.location.href = 'admin.html';
    return;
  }

  for (let u of users) {
    if (await hashSHA256(u.username + password) === hash) {
      window.location.href = 'wallet.html';
      return;
    }
  }

  alert("Invalid credentials");
}

// ========== WALLET & BLOCKCHAIN ==========

// Wallet connect
async function connectWallet() {
  if (!window.ethereum) return alert("MetaMask not installed!");
  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    signer = ethersProvider.getSigner();
    userAddress = accounts[0];
    localStorage.setItem('connectedWallet', userAddress);
    document.getElementById('userWalletAddress')?.innerText = userAddress;
    document.getElementById('wallet-display')?.innerText = userAddress;
    loadBalances();
  } catch (err) {
    console.error("Wallet connect failed", err);
  }
}

// Load balances
async function loadBalances() {
  if (!userAddress) return;
  const bnbBal = await ethersProvider.getBalance(userAddress);
  document.getElementById('userBalance')?.innerText = `${ethers.utils.formatEther(bnbBal)} BNB`;

  const div = document.getElementById('tokenBalances');
  if (div) {
    div.innerHTML = '';
    for (const key in tokens) {
      const token = tokens[key];
      if (token.address) {
        const contract = new ethers.Contract(token.address, erc20Abi, signer);
        const bal = await contract.balanceOf(userAddress);
        div.innerHTML += `<p>${key}: ${ethers.utils.formatUnits(bal, token.decimals)}</p>`;
      }
    }
  }
}

// Send token with fee
async function sendToken() {
  const recipient = prompt("Recipient address:");
  const amount = prompt("Amount:");
  const token = prompt("Token (BNB, DRF, USDT, USDC):").toUpperCase();
  if (!recipient || !amount || !token || !tokens[token]) return alert("Invalid input");

  const fee = (parseFloat(amount) * 0.06).toFixed(tokens[token].decimals);
  const sendAmt = (parseFloat(amount) - parseFloat(fee)).toFixed(tokens[token].decimals);

  if (token === 'BNB') {
    await signer.sendTransaction({ to: recipient, value: ethers.utils.parseEther(sendAmt) });
    await signer.sendTransaction({ to: feeReceiver, value: ethers.utils.parseEther(fee) });
  } else {
    const contract = new ethers.Contract(tokens[token].address, erc20Abi, signer);
    await contract.transfer(recipient, ethers.utils.parseUnits(sendAmt, tokens[token].decimals));
    await contract.transfer(feeReceiver, ethers.utils.parseUnits(fee, tokens[token].decimals));
  }

  alert("Transaction sent.");
}

// ========== UI HANDLERS ==========

function openSend() {
  sendToken();
}

function openReceive() {
  const addr = userAddress || localStorage.getItem('connectedWallet');
  if (!addr) return alert("Connect Wallet First");
  const qrDiv = document.getElementById('transactionArea');
  qrDiv.innerHTML = `<h3>Receive Address</h3><p>${addr}</p><div id="qrcode"></div>`;
  new QRCode(document.getElementById('qrcode'), addr);
}

function openExchange() {
  window.open(`${PANCAKESWAP_BASE_URL}?outputCurrency=${tokens.DRF.address}`, '_blank');
}

async function openHistory() {
  const res = await fetch(`https://api.bscscan.com/api?module=account&action=txlist&address=${userAddress}&startblock=0&endblock=99999999&sort=desc&apikey=${BSC_SCAN_API}`);
  const data = await res.json();
  const div = document.getElementById('transactionArea');
  div.innerHTML = "<h3>Transaction History</h3>";
  data.result.slice(0, 10).forEach(tx => {
    div.innerHTML += `
      <div>
        <p>Hash: <a href="https://bscscan.com/tx/${tx.hash}" target="_blank">${tx.hash.slice(0, 10)}...</a></p>
        <p>From: ${tx.from.slice(0, 6)}... To: ${tx.to.slice(0, 6)}... Value: ${ethers.utils.formatEther(tx.value)} BNB</p>
        <hr/>
      </div>`;
  });
}

// ========== FILE UPLOAD ==========
async function uploadToDrive() {
  const fileInput = document.getElementById('uploadFile');
  const file = fileInput.files[0];
  if (!file) return alert("Please select a file.");

  const reader = new FileReader();
  reader.onload = async function (e) {
    const base64 = e.target.result.split(',')[1];
    const uploadData = {
      contents: {
        fileName: file.name,
        fileBase64: base64,
        mimeType: file.type
      }
    };
    const response = await fetch("https://script.google.com/macros/s/AKfycby9XhmGdvUimYCNDeBUC3SO7_WleuoWS03t-CdGllWvkE4Fyje2MzU-RjHYXwQV9cJJ/exec", {
      method: "POST",
      body: JSON.stringify(uploadData),
      headers: { "Content-Type": "application/json" }
    });
    const result = await response.text();
    alert("Server response: " + result);
  };
  reader.readAsDataURL(file);
}

// ========== INIT ==========

window.addEventListener("DOMContentLoaded", () => {
  const addr = localStorage.getItem("connectedWallet") || sessionStorage.getItem("walletAddress");
  if (addr) {
    userAddress = addr;
    document.getElementById("wallet-display")?.textContent = addr;
    document.getElementById("userWalletAddress")?.textContent = addr;
  }
  const exportBtn = document.getElementById("export-logs");
  if (exportBtn) {
    exportBtn.addEventListener("click", () => {
      const rawLog = localStorage.getItem("adminLoginLog");
      if (!rawLog) return alert("No logs to export.");
      exportToCSV([JSON.parse(rawLog)]);
    });
  }
});











// Logout for user
function logout() {
  localStorage.removeItem('connectedWallet');
  window.location.href = 'index.html';
}

// Logout for admin
function logoutAdmin() {
  window.location.href = 'index.html';
}

// Wallet auto-load
window.addEventListener('load', () => {
  const saved = localStorage.getItem('connectedWallet');
  if (saved && document.getElementById('userWalletAddress')) {
    document.getElementById('userWalletAddress').innerText = saved;
  }
});

// MetaMask account change listener
if (window.ethereum) {
  window.ethereum.on('accountsChanged', (accounts) => {
    const addressDisplay = document.getElementById('userWalletAddress');
    if (accounts.length > 0) {
      localStorage.setItem('connectedWallet', accounts[0]);
      if (addressDisplay) addressDisplay.innerText = accounts[0];
    } else {
      localStorage.removeItem('connectedWallet');
      if (addressDisplay) addressDisplay.innerText = 'Not connected';
    }
  });
}

// Global
const scriptURL = 'https://script.google.com/macros/s/AKfycby9XhmGdvUimYCNDeBUC3SO7_WleuoWS03t-CdGllWvkE4Fyje2MzU-RjHYXwQV9cJJ/exec';
const registerForm = document.getElementById('registerForm');

// Register via Google Apps Script
async function handleRegistration(event) {
  event.preventDefault();

  const email = document.getElementById('email')?.value.trim();
  const wallet = document.getElementById('wallet')?.value.trim();

  if (!email || !wallet) {
    alert('Please enter both email and wallet address.');
    return;
  }

  const formData = new FormData();
  formData.append('action', 'register');
  formData.append('email', email);
  formData.append('wallet', wallet);

  try {
    const response = await fetch(scriptURL, {
      method: 'POST',
      body: formData
    });

    const result = await response.text();
    alert(response.ok ? 'Registration successful!' : `Registration failed: ${result}`);

    if (response.ok && registerForm) {
      registerForm.reset();
    }
  } catch (error) {
    console.error('Registration error:', error);
    alert('Error submitting form. Please try again.');
  }
}

// Attach listener
if (registerForm) {
  registerForm.addEventListener('submit', handleRegistration);
}
