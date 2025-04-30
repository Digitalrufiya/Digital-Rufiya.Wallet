
// === CONFIG ===
const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
const BSC_CHAIN_ID = '0x38';
const feeReceiver = "0x88253D87990EdD1E647c3B6eD21F57fb061a3040";
const BSC_SCAN_API = 'Your_BSCSCAN_API_KEY';
const ADMIN_HASH = "a3bcefaa11a28e88bd70337dd1f9f3e4f4c98ddbbacc1a5efbe21b5021427358";
const scriptURL = 'https://script.google.com/macros/s/AKfycby9XhmGdvUimYCNDeBUC3SO7_WleuoWS03t-CdGllWvkE4Fyje2MzU-RjHYXwQV9cJJ/exec';

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

let signer, userAddress;
let users = JSON.parse(localStorage.getItem('registeredUsers')) || [];

// === UTILS ===
async function hashSHA256(input) {
  const encoded = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function updateWalletDisplay(address) {
  const el = document.getElementById('userWalletAddress') || document.getElementById('wallet-display');
  if (el) el.innerText = address || 'Not connected';
}

function notify(message, type = "info") {
  const alertBox = document.createElement('div');
  alertBox.className = `alert alert-${type}`;
  alertBox.style.position = "fixed";
  alertBox.style.bottom = "20px";
  alertBox.style.right = "20px";
  alertBox.style.zIndex = "9999";
  alertBox.innerText = message;
  document.body.appendChild(alertBox);
  setTimeout(() => document.body.removeChild(alertBox), 5000);
}

// === WALLET ===
async function connectWallet() {
  if (!window.ethereum) return alert("MetaMask not installed!");
  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    userAddress = accounts[0];
    signer = ethersProvider.getSigner();
    localStorage.setItem('connectedWallet', userAddress);
    updateWalletDisplay(userAddress);
    loadBalances();
  } catch (err) {
    console.error("Wallet connect failed:", err);
  }
}

async function loadBalances() {
  if (!userAddress) return;
  const bnbBal = await ethersProvider.getBalance(userAddress);
  document.getElementById('userBalance').innerText = \`\${ethers.utils.formatEther(bnbBal)} BNB\`;

  const div = document.getElementById('tokenBalances');
  if (div) {
    div.innerHTML = '';
    for (const key in tokens) {
      const token = tokens[key];
      if (token.address) {
        const contract = new ethers.Contract(token.address, erc20Abi, signer);
        const balance = await contract.balanceOf(userAddress);
        div.innerHTML += \`<p>\${key}: \${ethers.utils.formatUnits(balance, token.decimals)}</p>\`;
      }
    }
  }
}

// === TRANSACTIONS ===
async function sendToken() {
  const recipient = prompt("Enter recipient address:");
  const amount = prompt("Enter amount:");
  const token = prompt("Enter token (BNB, DRF, USDT, USDC):").toUpperCase();
  if (!recipient || !amount || !token || !tokens[token]) return alert("Invalid input");

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
  notify("Transaction sent!", "success");
}

function openReceive() {
  const addr = userAddress || localStorage.getItem('connectedWallet');
  if (!addr) return alert("Connect Wallet First");
  const qrDiv = document.getElementById('transactionArea');
  qrDiv.innerHTML = \`<h3>Receive Address</h3><p>\${addr}</p><div id="qrcode"></div>\`;
  new QRCode(document.getElementById('qrcode'), addr);
}

function openExchange() {
  window.open(\`\${PANCAKESWAP_BASE_URL}?outputCurrency=\${tokens.DRF.address}\`, '_blank');
}

async function openHistory() {
  const res = await fetch(\`https://api.bscscan.com/api?module=account&action=txlist&address=\${userAddress}&startblock=0&endblock=99999999&sort=desc&apikey=\${BSC_SCAN_API}\`);
  const data = await res.json();
  const div = document.getElementById('transactionArea');
  div.innerHTML = "<h3>Transaction History</h3>";
  data.result.slice(0, 10).forEach(tx => {
    div.innerHTML += \`
      <div>
        <p>Hash: <a href="https://bscscan.com/tx/\${tx.hash}" target="_blank">\${tx.hash.slice(0, 10)}...</a></p>
        <p>From: \${tx.from.slice(0, 6)}... To: \${tx.to.slice(0, 6)}... Value: \${ethers.utils.formatEther(tx.value)} BNB</p>
        <hr/>
      </div>\`;
  });
}

// === AUTH ===
async function login() {
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;
  const hash = await hashSHA256(username + password);

  if (hash === ADMIN_HASH) {
    sessionStorage.setItem("adminLoggedIn", "true");
    window.location.href = 'admin.html';
    return;
  }

  const matchedUser = users.find(u => u.username === username && u.passwordHash === hash);
  if (matchedUser) {
    window.location.href = 'wallet.html';
  } else {
    alert("Invalid credentials");
  }
}

function protectAdminPanel() {
  if (!sessionStorage.getItem("adminLoggedIn")) {
    alert("Access denied. Please log in as admin.");
    window.location.href = "index.html";
  }
}

// === Google Drive Upload ===
async function uploadToDrive() {
  const fileInput = document.getElementById('uploadFile');
  const file = fileInput?.files[0];
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
    const response = await fetch(scriptURL, {
      method: "POST",
      body: JSON.stringify(uploadData),
      headers: { "Content-Type": "application/json" }
    });
    const result = await response.text();
    notify("Upload response: " + result, "info");
  };
  reader.readAsDataURL(file);
}

// === INIT ===
window.addEventListener("load", () => {
  const saved = localStorage.getItem("connectedWallet");
  if (saved) {
    userAddress = saved;
    updateWalletDisplay(saved);
  }

  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const email = document.getElementById('email')?.value.trim();
      const wallet = document.getElementById('wallet')?.value.trim();
      if (!email || !wallet) return alert("Enter both email and wallet.");

      const formData = new FormData();
      formData.append('action', 'register');
      formData.append('email', email);
      formData.append('wallet', wallet);

      try {
        const res = await fetch(scriptURL, { method: 'POST', body: formData });
        const result = await res.text();
        notify(res.ok ? 'Registration successful!' : 'Failed: ' + result, res.ok ? "success" : "danger");
        if (res.ok) registerForm.reset();
      } catch (err) {
        console.error('Error:', err);
        notify("Registration error", "danger");
      }
    });
  }
});

if (window.ethereum) {
  window.ethereum.on('accountsChanged', accounts => {
    if (accounts.length > 0) {
      localStorage.setItem('connectedWallet', accounts[0]);
      updateWalletDisplay(accounts[0]);
    } else {
      localStorage.removeItem('connectedWallet');
      updateWalletDisplay(null);
    }
  });
}


// === DASHBOARD HANDLERS ===

// USER DASHBOARD
function renderUserDashboard() {
  const addr = localStorage.getItem('connectedWallet');
  if (!addr) return;

  document.getElementById('dash-wallet-address')?.innerText = addr;

  loadBalances(); // Already sets balance display

  openHistory();  // Loads recent transactions

  const loginTime = sessionStorage.getItem('userLoginTime');
  if (loginTime) {
    document.getElementById('session-info')?.innerText = "Logged in at: " + new Date(loginTime).toLocaleString();
  }
}

// ADMIN DASHBOARD
function renderAdminDashboard() {
  const userList = JSON.parse(localStorage.getItem('registeredUsers') || "[]");
  const drfSent = parseFloat(localStorage.getItem('drfSent') || "0");

  document.getElementById('total-users')?.innerText = userList.length;
  document.getElementById('drf-sent')?.innerText = drfSent.toFixed(2) + " DRF";
  document.getElementById('admin-session')?.innerText = "Logged in at: " + new Date().toLocaleString();
}

// HANDLER FOR SEND / RECEIVE / SWAP BUTTONS ON DASHBOARD
function setupDashboardActions() {
  document.getElementById('btn-send')?.addEventListener('click', openSend);
  document.getElementById('btn-receive')?.addEventListener('click', openReceive);
  document.getElementById('btn-swap')?.addEventListener('click', openExchange);
}
