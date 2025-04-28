// app.js

// Login Function
function login() {
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;

  if (username === 'digitalrufiya@gmail.com' && password === 'Zivian@2020') {
    localStorage.setItem('loggedIn', 'true');
    window.location.href = 'wallet.html'; // ✅ Redirect to wallet page
  } else {
    alert('Invalid login credentials. Please try again.');
  }
}

// Register Function (basic fake register)
function register() {
  const username = document.getElementById('registerUsername').value;
  const password = document.getElementById('registerPassword').value;

  if (username && password) {
    // You can extend here to save somewhere
    alert('Registered successfully! Now you can login.');
    window.location.href = 'index.html';
  } else {
    alert('Please fill all fields.');
  }
}

// Wallet Page - Check Login
if (window.location.pathname.includes('wallet.html')) {
  window.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('loggedIn') !== 'true') {
      window.location.href = 'index.html'; // 🔥 Redirect if not logged in
    }
  });
}

// Wallet Connection
let provider;
let signer;

async function connectWallet() {
  if (typeof window.ethereum !== 'undefined') {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();
      const address = await signer.getAddress();
      document.getElementById('walletAddress').innerText = address;
      document.getElementById('connectWalletBtn').style.display = 'none';
      document.getElementById('walletActions').style.display = 'block';
      showStatus('Wallet Connected Successfully!', 'success');
    } catch (error) {
      console.error(error);
      showStatus('Failed to connect wallet.', 'error');
    }
  } else {
    alert('Please install MetaMask!');
  }
}

// Logout Function
function logout() {
  localStorage.removeItem('loggedIn');
  window.location.href = 'index.html';
}

// Utility: Status Message
function showStatus(message, type) {
  const status = document.getElementById('statusMessage');
  status.innerText = message;
  status.className = type; // class 'success' or 'error'
}

// Placeholder functions for send/receive/exchange
function sendCrypto() {
  alert('Send feature is under development...');
}

function receiveCrypto() {
  alert('Receive feature is under development...');
}

function exchangeCrypto() {
  alert('Exchange feature is under development...');
}

