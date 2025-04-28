// app.js

// Check if wallet is connected (MetaMask)
async function connectWallet() {
  if (typeof window.ethereum !== 'undefined') {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const walletAddress = accounts[0];
      sessionStorage.setItem('walletAddress', walletAddress);
      const addressElement = document.getElementById('userWalletAddress');
      if (addressElement) {
        addressElement.innerText = walletAddress;
      }
      return walletAddress;
    } catch (error) {
      console.error('Wallet connection rejected:', error);
      alert('Please connect your wallet to continue.');
      return null;
    }
  } else {
    alert('MetaMask is not installed. Please install it and try again.');
    return null;
  }
}

// Register new user
async function register() {
  const username = document.getElementById('registerUsername').value.trim();
  const password = document.getElementById('registerPassword').value.trim();

  if (!username || !password) {
    alert('Please fill in all fields.');
    return;
  }

  const walletAddress = await connectWallet();
  if (!walletAddress) {
    return;
  }

  // Load existing users
  let users = JSON.parse(localStorage.getItem('users')) || [];

  // Check if username already exists
  if (users.find(u => u.username === username)) {
    alert('Username already exists.');
    return;
  }

  // Save new user
  users.push({ username, password, walletAddress });
  localStorage.setItem('users', JSON.stringify(users));
  alert('Registration successful! Please login.');
  window.location.href = 'index.html';
}

// Login user
function login() {
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  if (!username || !password) {
    alert('Please fill in all fields.');
    return;
  }

  const users = JSON.parse(localStorage.getItem('users')) || [];
  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    alert('Invalid username or password.');
    return;
  }

  // Save session data
  sessionStorage.setItem('currentUser', JSON.stringify(user));
  alert('Login successful!');
  
  // If admin login
  if (username.toLowerCase() === 'admin') {
    window.location.href = 'admin.html';
  } else {
    window.location.href = 'wallet.html';
  }
}

// Load users in Admin Panel
function loadUsers() {
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const userData = document.getElementById('userData');

  if (userData) {
    userData.innerHTML = ''; // Clear existing

    users.forEach(user => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${user.username}</td>
        <td>${user.password}</td>
        <td>${user.walletAddress}</td>
      `;
      userData.appendChild(row);
    });
  }
}

// Admin logout
function logoutAdmin() {
  sessionStorage.removeItem('currentUser');
  sessionStorage.removeItem('walletAddress');
  alert('Logged out.');
  window.location.href = 'index.html';
}

// Wallet page logout
function logout() {
  sessionStorage.removeItem('currentUser');
  sessionStorage.removeItem('walletAddress');
  alert('Logged out.');
  window.location.href = 'index.html';
}

// Functions to open different sections (Send, Receive, Exchange, Transactions)
function openSend() {
  document.getElementById('transactionArea').innerHTML = '<h3>Send Tokens - Feature coming soon!</h3>';
}

function openReceive() {
  document.getElementById('transactionArea').innerHTML = '<h3>Receive Tokens - Feature coming soon!</h3>';
}

function openExchange() {
  document.getElementById('transactionArea').innerHTML = '<h3>Exchange Tokens - Feature coming soon!</h3>';
}

function openHistory() {
  document.getElementById('transactionArea').innerHTML = '<h3>Transaction History - Feature coming soon!</h3>';
}

// Auto-run wallet connection on wallet.html
window.addEventListener('load', () => {
  const walletPage = document.querySelector('.wallet-page');
  if (walletPage) {
    const savedWalletAddress = sessionStorage.getItem('walletAddress');
    if (savedWalletAddress) {
      document.getElementById('userWalletAddress').innerText = savedWalletAddress;
    } else {
      connectWallet();
    }
  }

  // Load users automatically if on admin page
  if (window.location.pathname.includes('admin.html')) {
    loadUsers();
  }
});
