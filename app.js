// Admin credentials
const ADMIN_USERNAME = "digitalrufiya@gmail.com";
const ADMIN_PASSWORD = "Zivian@2020";

// Local Storage keys
const USERS_KEY = "drf_wallet_users";
const SESSION_KEY = "drf_wallet_session";

// Handle Registration
function register() {
  const username = document.getElementById('registerUsername').value.trim();
  const password = document.getElementById('registerPassword').value.trim();

  if (!username || !password) {
    alert("Please fill all fields.");
    return;
  }

  let users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];

  if (users.find(user => user.username === username)) {
    alert("Username already exists!");
    return;
  }

  users.push({ username, password, walletAddress: "" });
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  alert("Registration successful! Please login.");
  window.location.href = "index.html";
}

// Handle Login
function login() {
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    sessionStorage.setItem(SESSION_KEY, "admin");
    window.location.href = "admin.html";
    return;
  }

  let users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    sessionStorage.setItem(SESSION_KEY, username);
    window.location.href = "wallet.html";
  } else {
    alert("Invalid username or password!");
  }
}

// Handle Admin Logout
function logoutAdmin() {
  sessionStorage.removeItem(SESSION_KEY);
  window.location.href = "index.html";
}

// Handle User Logout
function logoutUser() {
  sessionStorage.removeItem(SESSION_KEY);
  window.location.href = "index.html";
}

// Show Admin Users List
function loadAdminPage() {
  if (sessionStorage.getItem(SESSION_KEY) !== "admin") {
    window.location.href = "index.html";
    return;
  }

  const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  const userData = document.getElementById('userData');

  users.forEach(user => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${user.username}</td>
      <td>${user.password}</td>
      <td>${user.walletAddress || '-'}</td>
    `;
    userData.appendChild(row);
  });
}

// Wallet Connect, Send, Receive, Exchange Functions
let currentWalletAddress = "";

// Connect to Wallet
async function connectWallet() {
  if (typeof window.ethereum === 'undefined') {
    alert("Please install MetaMask!");
    return;
  }

  try {
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    currentWalletAddress = accounts[0];
    document.getElementById('walletAddress').innerText = currentWalletAddress;
    saveWalletAddress(currentWalletAddress);
    showToast("Wallet connected successfully!");
  } catch (error) {
    console.error(error);
    alert("Wallet connection failed.");
  }
}

// Save wallet address after connection
function saveWalletAddress(address) {
  const username = sessionStorage.getItem(SESSION_KEY);
  if (!username || username === "admin") return;

  let users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  const index = users.findIndex(u => u.username === username);
  if (index !== -1) {
    users[index].walletAddress = address;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
}

// Send Tokens (5% fee)
async function sendTokens() {
  const recipient = document.getElementById('sendTo').value.trim();
  const amount = parseFloat(document.getElementById('sendAmount').value.trim());

  if (!recipient || !amount) {
    alert("Please fill recipient and amount.");
    return;
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  const fee = amount * 0.05;
  const sendAmount = amount - fee;

  try {
    await signer.sendTransaction({
      to: recipient,
      value: ethers.parseEther(sendAmount.toString())
    });

    // Send fee to admin
    await signer.sendTransaction({
      to: "0x7788a60dbC85AB46767F413EC7d51F149AA1bec6", // DRF Collection Address
      value: ethers.parseEther(fee.toString())
    });

    showToast(`Sent ${sendAmount} BNB! Fee ${fee} BNB sent to admin.`);
  } catch (error) {
    console.error(error);
    alert("Transaction failed.");
  }
}

// Receive Token (just wallet connect shows address)

// Exchange Token (5% fee simulation)
async function exchangeTokens() {
  const amount = parseFloat(document.getElementById('exchangeAmount').value.trim());

  if (!amount) {
    alert("Enter amount to exchange.");
    return;
  }

  const fee = amount * 0.05;
  const received = amount - fee;

  showToast(`Exchanged ${amount} DRF tokens! After 5% fee, you get ${received} DRF tokens.`);
}

// Toast Notifications
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerText = message;
  document.body.appendChild(toast);
  setTimeout(() => { toast.remove(); }, 3000);
}

// Auto Load
window.onload = function() {
  if (window.location.pathname.includes("admin.html")) {
    loadAdminPage();
  }
};
