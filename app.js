// Hardcoded Admin
const ADMIN = {
  email: "digitalrufiya@gmail.com",
  password: "Zivian@2020"
};

// Register new user
function register() {
  const username = document.getElementById('registerUsername').value.trim();
  const password = document.getElementById('registerPassword').value.trim();

  if (!username || !password) {
    alert("Please enter username and password.");
    return;
  }

  let users = JSON.parse(localStorage.getItem('users')) || [];

  const existingUser = users.find(u => u.username === username);
  if (existingUser) {
    alert("Username already exists!");
    return;
  }

  users.push({ username, password });
  localStorage.setItem('users', JSON.stringify(users));
  alert("Registration successful! Please login.");
  window.location.href = "index.html";
}

// Login user
function login() {
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  // Check Admin Login
  if (username === ADMIN.email && password === ADMIN.password) {
    localStorage.setItem('isAdmin', 'true');
    window.location.href = "admin.html";
    return;
  }

  // Check User Login
  let users = JSON.parse(localStorage.getItem('users')) || [];

  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    localStorage.setItem('currentUser', username);
    window.location.href = "wallet.html";
  } else {
    alert("Invalid username or password!");
  }
}

// Logout user
function logout() {
  localStorage.removeItem('currentUser');
  localStorage.removeItem('isAdmin');
  localStorage.removeItem('connectedWallet');
  window.location.href = "index.html";
}

// Logout admin
function logoutAdmin() {
  localStorage.removeItem('isAdmin');
  localStorage.removeItem('currentUser');
  localStorage.removeItem('connectedWallet');
  window.location.href = "index.html";
}

// Connect MetaMask Wallet
async function connectWallet() {
  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const walletAddress = accounts[0];
      document.getElementById('userWalletAddress').innerText = walletAddress;
      localStorage.setItem('connectedWallet', walletAddress);

      const balanceInWei = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [walletAddress, 'latest']
      });

      const balanceInEth = parseFloat(parseInt(balanceInWei, 16) / (10 ** 18)).toFixed(4);
      document.getElementById('userBalance').innerText = balanceInEth + " ETH";

      console.log('Connected wallet:', walletAddress);
    } catch (error) {
      console.error('User denied wallet connection', error);
      alert('Wallet connection failed.');
    }
  } else {
    alert('MetaMask is not installed. Please install it to connect!');
  }
}

// Auto load wallet address and balance
window.addEventListener('load', async () => {
  const savedWallet = localStorage.getItem('connectedWallet');
  if (savedWallet && document.getElementById('userWalletAddress')) {
    document.getElementById('userWalletAddress').innerText = savedWallet;

    if (window.ethereum) {
      const balanceInWei = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [savedWallet, 'latest']
      });
      const balanceInEth = parseFloat(parseInt(balanceInWei, 16) / (10 ** 18)).toFixed(4);
      document.getElementById('userBalance').innerText = balanceInEth + " ETH";
    }
  }
});

// Detect Account Changes
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

// Dummy placeholders for wallet actions
function openSend() {
  alert("Send function coming soon!");
}

function openReceive() {
  alert("Receive function coming soon!");
}

function openExchange() {
  alert("Exchange function coming soon!");
}

function openHistory() {
  alert("Transaction history coming soon!");
}
