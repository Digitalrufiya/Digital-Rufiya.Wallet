<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Register / Login</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: #f7f7f7;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }
    .container {
      background: #fff;
      padding: 20px 30px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      width: 300px;
    }
    h2 {
      text-align: center;
    }
    input {
      width: 100%;
      margin: 10px 0;
      padding: 10px;
      border-radius: 5px;
      border: 1px solid #ccc;
    }
    button {
      width: 100%;
      padding: 10px;
      margin-top: 10px;
      border: none;
      border-radius: 5px;
      background: #007bff;
      color: #fff;
      cursor: pointer;
    }
    button:hover {
      background: #0056b3;
    }
    .toggle {
      text-align: center;
      margin-top: 15px;
      font-size: 14px;
    }
    .toggle a {
      color: #007bff;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2 id="formTitle">Register</h2>
    <input type="email" id="registerUsername" placeholder="Email" required />
    <input type="password" id="registerPassword" placeholder="Password" required />
    <button onclick="register()">Register</button>

    <div class="toggle">
      Already have an account? <a onclick="toggleForm()">Login</a>
    </div>
  </div>

  <script>
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
          // Redirect or continue session
        } else {
          alert("Incorrect password.");
        }
      }

      // Clear input fields
      passwordInput.value = "";
    }
  </script>
</body>
</html>


async function register() {
  const email = document.getElementById('registerUsername').value.trim().toLowerCase();
  const password = document.getElementById('registerPassword').value;

  // Simple email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert("Please enter a valid email address.");
    return;
  }

  // Prevent duplicate registration
  if (users.find(u => u.email === email)) {
    alert("This email is already registered!");
    return;
  }

  // Hash and store
  const passwordHash = await hashSHA256(email + password);
  users.push({ email, passwordHash });
  localStorage.setItem('registeredUsers', JSON.stringify(users));
  alert("Registered successfully! Please login.");
  window.location.href = "index.html";
}

<!-- wallet.html -->
<!DOCTYPE html>
<html>
<head>
  <title>DRF Wallet</title>
  <script src="https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js"></script>
  <script src="app.js" defer></script>
</head>
<body>
  <h2>Your Wallet</h2>
  <p id="userWalletAddress">Not connected</p>
  <p id="userBalance"></p>
  <div id="tokenBalances"></div>
  <button onclick="connectWallet()">Connect Wallet</button>
  <button onclick="openSend()">Send</button>
  <button onclick="openReceive()">Receive</button>
  <button onclick="openExchange()">Swap DRF</button>
  <button onclick="openHistory()">View History</button>
  <div id="transactionArea"></div>
  <button onclick="logout()">Logout</button>
</body>
</html>

<!-- admin.html -->
<!DOCTYPE html>
<html>
<head>
  <title>Admin Panel</title>
  <script src="app.js" defer></script>
</head>
<body>
  <h2>Welcome Admin</h2>
  <button onclick="logoutAdmin()">Logout</button>
  <!-- Add admin panel elements here -->
</body>
</html>


async function openHistory() {
    const res = await fetch(https://api.bscscan.com/api?module=account&action=txlist&address=${userAddress}&startblock=0&endblock=99999999&sort=desc&apikey=${BSC_SCAN_API});
    const data = await res.json();
    const txs = data.result;
    const historyDiv = document.getElementById('transactionArea');
    historyDiv.innerHTML = '<h3>Transaction History</h3>';

    txs.slice(0, 10).forEach(tx => {
        historyDiv.innerHTML += 
            <div>
                <p>Hash: <a href="https://bscscan.com/tx/${tx.hash}" target="_blank">${tx.hash.slice(0, 10)}...</a></p>
                <p>From: ${tx.from.slice(0, 6)}... To: ${tx.to.slice(0, 6)}... Value: ${ethers.utils.formatEther(tx.value)} BNB</p>
                <hr/>
            </div>;
    });
}

async function login() {
  const email = document.getElementById('loginUsername').value.trim().toLowerCase();
  const password = document.getElementById('loginPassword').value;
  const hash = await hashSHA256(email + password);

  if (hash === ADMIN_HASH) {
    window.location.href = 'admin.html';
    return;
  }

  const matchedUser = users.find(u => u.email === email && u.passwordHash === hash);
  if (matchedUser) {
    window.location.href = 'wallet.html';
  } else {
    alert("Invalid email or password.");
  }
}


function register() {
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;

    if (users.find(u => u.username === username)) {
        alert("Username already exists!");
        return;
    }

    users.push({ username, password });
    localStorage.setItem('registeredUsers', JSON.stringify(users));
    alert("Registered successfully! Now login.");
    window.location.href = "index.html";
}

function logout() {
    localStorage.removeItem('connectedWallet');
    window.location.href = "index.html";
}

window.addEventListener('load', () => {
    const savedWallet = localStorage.getItem('connectedWallet');
    if (savedWallet) document.getElementById('userWalletAddress').innerText = savedWallet;
});

if (window.ethereum) {
    window.ethereum.on('accountsChanged', function (accounts) {
        if (accounts.length > 0) {
            document.getElementById('userWalletAddress').innerText = accounts[0];
            localStorage.setItem('connectedWallet', accounts[0]);
        } else {
            document.getElementById('userWalletAddress').innerText = 'Not connected';
            localStorage.removeItem('connectedWallet');
        }
    });
}

// app.js

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
      const c = new ethers.Contract(tokens[key].address, erc20Abi, signer);
      const b = await c.balanceOf(userAddress);
      div.innerHTML += `<p>${key}: ${ethers.utils.formatUnits(b, tokens[key].decimals)}</p>`;
    }
  }
}

async function sendToken() {
  const recipient = prompt("Enter recipient address:");
  const amount = prompt("Enter amount:");
  const token = prompt("Enter token (BNB, DRF, USDT, USDC):").toUpperCase();
  if (!recipient || !amount || !token || !tokens[token]) return alert("Missing or invalid input");

  const fee = (parseFloat(amount) * 0.06).toFixed(tokens[token].decimals);
  const sendAmt = (parseFloat(amount) - parseFloat(fee)).toFixed(tokens[token].decimals);

  if (token === 'BNB') {
    await signer.sendTransaction({ to: recipient, value: ethers.utils.parseEther(sendAmt) });
    await signer.sendTransaction({ to: feeReceiver, value: ethers.utils.parseEther(fee) });
  } else {
    const c = new ethers.Contract(tokens[token].address, erc20Abi, signer);
    await c.transfer(recipient, ethers.utils.parseUnits(sendAmt, tokens[token].decimals));
    await c.transfer(feeReceiver, ethers.utils.parseUnits(fee, tokens[token].decimals));
  }
  alert("Transaction sent.");
}

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

function login() {
  const user = document.getElementById('loginUsername').value;
  const pass = document.getElementById('loginPassword').value;
  if (user === adminCredentials.username && pass === adminCredentials.password) {
    window.location.href = 'admin.html';
  } else if (users.find(u => u.username === user && u.password === pass)) {
    window.location.href = 'index.html';
  } else {
    alert("Invalid credentials");
  }
}

function register() {
  const user = document.getElementById('registerUsername').value;
  const pass = document.getElementById('registerPassword').value;
  if (users.find(u => u.username === user)) return alert("Username exists");
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

window.addEventListener('load', () => {
  const saved = localStorage.getItem('connectedWallet');
  if (saved) document.getElementById('userWalletAddress').innerText = saved;
});
// Admin login check
checkAdminSession();

// Auto logout timer
startInactivityMonitor();

// Populate data
renderUserTable();
renderTxLogs();

// Export feature
document.getElementById('exportCSV').addEventListener('click', downloadCSV);

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
  return crypto.subtle.digest('SHA-256', new TextEncoder().encode(str)).then(buf => {
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  });
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
    window.location.href = 'admin.html';
  } else if (users.find(u => u.username === user && u.password === passHash)) {
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
      const c = new ethers.Contract(tokens[key].address, erc20Abi, signer);
      const b = await c.balanceOf(userAddress);
      div.innerHTML += `<p>${key}: ${ethers.utils.formatUnits(b, tokens[key].decimals)}</p>`;
    }
  }
}

// === Admin Functions ===
function checkAdminSession() {
  if (!sessionStorage.getItem('adminLoggedIn')) window.location.href = 'index.html';
}

function logoutAdmin() {
  sessionStorage.removeItem('adminLoggedIn');
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

// === Forget Password (Reset simulation) ===
function forgetPassword(username) {
  alert(`Password reset link has been sent to ${username}@email.com`);
}

// === Session Expiry Timer ===
let lastActivity = Date.now();
document.addEventListener('mousemove', () => lastActivity = Date.now());
setInterval(() => {
  if (Date.now() - lastActivity > 1800000) { // 30 mins
    logoutAdmin();
    logout();
  }
}, 60000);

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
  if (saved && document.getElementById('userWalletAddress'))
    document.getElementById('userWalletAddress').innerText = saved;
});

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

// Improved and structured app.js for DRF DApp

// Utility: Fetch wrapper with error handling
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

// Wallet connection (placeholder for MetaMask integration)
async function connectWallet() {
  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const walletAddress = accounts[0];
      sessionStorage.setItem("walletAddress", walletAddress);
      document.getElementById("wallet-display").textContent = walletAddress;
    } catch (err) {
      console.error("User denied wallet access:", err);
    }
  } else {
    alert("MetaMask is not installed.");
  }
}

// Load wallet on page load
window.addEventListener("DOMContentLoaded", () => {
  const walletAddress = sessionStorage.getItem("walletAddress");
  if (walletAddress) {
    const el = document.getElementById("wallet-display");
    if (el) el.textContent = walletAddress;
  }
});

// Admin session timeout
function setupAdminSessionTimeout(timeoutMinutes = 30) {
  let timer;
  function resetTimer() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      alert("Session expired. Logging out.");
      sessionStorage.clear();
      window.location.href = "admin.html";
    }, timeoutMinutes * 60000);
  }

  window.addEventListener("mousemove", resetTimer);
  window.addEventListener("keypress", resetTimer);
  resetTimer();
}

// Device and IP logging
async function logAdminLogin(email) {
  const ip = await fetchData('https://api.ipify.org?format=json');
  const device = navigator.userAgent;
  const timestamp = new Date().toISOString();
  const log = { email, ip: ip?.ip || 'Unknown', device, timestamp };
  console.log("Admin login:", log);
  // Save to storage or backend if needed
  localStorage.setItem("adminLoginLog", JSON.stringify(log));
}

// CSV export utility
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

// Example: usage of exportToCSV on a button click
const exportBtn = document.getElementById("export-logs");
if (exportBtn) {
  exportBtn.addEventListener("click", () => {
    const rawLog = localStorage.getItem("adminLoginLog");
    if (!rawLog) return alert("No logs to export.");
    const logData = [JSON.parse(rawLog)];
    exportToCSV(logData);
  });
}

// Other app logic can be modularized below as needed

async function uploadToDrive() {
    const fileInput = document.getElementById('uploadFile');
    const file = fileInput.files[0];
    if (!file) {
        alert("Please select a file.");
        return;
    }

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
            headers: {
                "Content-Type": "application/json"
            }
        });

        const result = await response.text();
        alert("Server response: " + result);
    };
    reader.readAsDataURL(file);
}
// app.js

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

// Secure admin credentials (hashed value of: digitalrufiya@gmail.com + Zivian@2020)
const ADMIN_HASH = "a3bcefaa11a28e88bd70337dd1f9f3e4f4c98ddbbacc1a5efbe21b5021427358"; // example SHA-256 hash

let users = JSON.parse(localStorage.getItem('registeredUsers')) || [];

// Utility function: SHA-256 hash
async function hashSHA256(input) {
  const encoded = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Connect wallet
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

// Load token balances
async function loadBalances() {
  if (!userAddress) return;
  const bnbBal = await ethersProvider.getBalance(userAddress);
  document.getElementById('userBalance').innerText = `${ethers.utils.formatEther(bnbBal)} BNB`;
  const div = document.getElementById('tokenBalances');
  div.innerHTML = '';
  for (const key in tokens) {
    if (tokens[key].address) {
      const c = new ethers.Contract(tokens[key].address, erc20Abi, signer);
      const b = await c.balanceOf(userAddress);
      div.innerHTML += `<p>${key}: ${ethers.utils.formatUnits(b, tokens[key].decimals)}</p>`;
    }
  }
}

// Send token
async function sendToken() {
  const recipient = prompt("Enter recipient address:");
  const amount = prompt("Enter amount:");
  const token = prompt("Enter token (BNB, DRF, USDT, USDC):").toUpperCase();
  if (!recipient || !amount || !token || !tokens[token]) return alert("Missing or invalid input");

  const fee = (parseFloat(amount) * 0.06).toFixed(tokens[token].decimals);
  const sendAmt = (parseFloat(amount) - parseFloat(fee)).toFixed(tokens[token].decimals);

  if (token === 'BNB') {
    await signer.sendTransaction({ to: recipient, value: ethers.utils.parseEther(sendAmt) });
    await signer.sendTransaction({ to: feeReceiver, value: ethers.utils.parseEther(fee) });
  } else {
    const c = new ethers.Contract(tokens[token].address, erc20Abi, signer);
    await c.transfer(recipient, ethers.utils.parseUnits(sendAmt, tokens[token].decimals));
    await c.transfer(feeReceiver, ethers.utils.parseUnits(fee, tokens[token].decimals));
  }
  alert("Transaction sent.");
}

// UI Handlers
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

// Login
async function login() {
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;
  const hash = await hashSHA256(username + password);

  if (hash === ADMIN_HASH) {
    window.location.href = 'admin.html';
    return;
  }

  const matchedUser = users.find(async u => (await hashSHA256(u.username + password)) === hash);
  if (matchedUser) {
    window.location.href = 'wallet.html';
  } else {
    alert("Invalid credentials");
  }
}

// Register
async function register() {
  const username = document.getElementById('registerUsername').value;
  const password = document.getElementById('registerPassword').value;
  if (users.find(u => u.username === username)) {
    alert("Username already exists!");
    return;
  }

  const hashedPass = await hashSHA256(username + password);
  users.push({ username, passwordHash: hashedPass });
  localStorage.setItem('registeredUsers', JSON.stringify(users));
  alert("Registered successfully! Please login.");
  window.location.href = "index.html";
}

// Logout
function logout() {
  localStorage.removeItem('connectedWallet');
  window.location.href = 'index.html';
}

function logoutAdmin() {
  window.location.href = 'index.html';
}

// Wallet auto-load
window.addEventListener('load', () => {
  const saved = localStorage.getItem('connectedWallet');
  if (saved) document.getElementById('userWalletAddress').innerText = saved;
});

// MetaMask account changes
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
