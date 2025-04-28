// --- ADMIN INFO ---
const adminEmail = "digitalrufiya@gmail.com";
const adminPassword = "Zivian@2020";

// --- SIMULATED DATABASE (for fake user storage) ---
let users = JSON.parse(localStorage.getItem("users")) || [];

// --- LOGIN FUNCTION ---
function login() {
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  if (!username || !password) {
    alert("Please enter both username and password.");
    return;
  }

  if (username === adminEmail && password === adminPassword) {
    alert("Admin logged in successfully!");
    window.location.href = "wallet.html"; // Redirect to wallet page
  } else {
    const userFound = users.find(user => user.username === username && user.password === password);
    if (userFound) {
      alert("User logged in successfully!");
      window.location.href = "wallet.html"; // Redirect to wallet page
    } else {
      alert("Invalid login. Please try again or register.");
    }
  }
}

// --- REGISTER FUNCTION ---
function register() {
  const username = document.getElementById('registerUsername').value.trim();
  const password = document.getElementById('registerPassword').value.trim();

  if (!username || !password) {
    alert("Please fill both fields.");
    return;
  }

  const existingUser = users.find(user => user.username === username);
  if (existingUser) {
    alert("User already exists. Please login.");
    return;
  }

  users.push({ username, password });
  localStorage.setItem("users", JSON.stringify(users));
  alert("Registration successful! Please login.");
  window.location.href = "index.html"; // Redirect to login page
}

// --- WALLET CONNECTION SECTION ---
async function connectWallet() {
  if (typeof window.ethereum === 'undefined') {
    alert("No crypto wallet found. Please install MetaMask!");
    return;
  }

  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const userAddress = accounts[0];
    document.getElementById('userAddress').innerText = userAddress;
    document.getElementById('walletInfo').style.display = 'block';
    document.getElementById('status').innerText = 'Wallet Connected!';
  } catch (error) {
    console.error(error);
    alert("Wallet connection failed!");
  }
}

function disconnectWallet() {
  document.getElementById('userAddress').innerText = '';
  document.getElementById('walletInfo').style.display = 'none';
  document.getElementById('status').innerText = 'Wallet Disconnected!';
}

// --- COPY ADDRESS ---
function copyAddress() {
  const address = document.getElementById('userAddress').innerText;
  if (address) {
    navigator.clipboard.writeText(address)
      .then(() => alert('Wallet address copied!'))
      .catch(err => alert('Failed to copy address.'));
  }
}

// --- AUTO ADD EVENTS IF ELEMENTS EXIST ---
window.addEventListener('DOMContentLoaded', () => {
  const connectBtn = document.getElementById('connectButton');
  const disconnectBtn = document.getElementById('disconnectButton');
  const userAddress = document.getElementById('userAddress');

  if (connectBtn) connectBtn.addEventListener('click', connectWallet);
  if (disconnectBtn) disconnectBtn.addEventListener('click', disconnectWallet);
  if (userAddress) userAddress.addEventListener('click', copyAddress);
});
