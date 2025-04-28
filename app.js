// Basic fake database
const users = JSON.parse(localStorage.getItem('users')) || [];

// Admin details
const adminEmail = 'digitalrufiya@gmail.com';
const adminPassword = 'Zivian@2020';

// Show loading spinner
function showSpinner() {
  const spinner = document.getElementById('spinner');
  if (spinner) spinner.style.display = 'block';
}

// Hide loading spinner
function hideSpinner() {
  const spinner = document.getElementById('spinner');
  if (spinner) spinner.style.display = 'none';
}

// Register new user
function register() {
  const username = document.getElementById('registerUsername').value.trim();
  const password = document.getElementById('registerPassword').value.trim();

  if (!username || !password) {
    alert('Please fill all fields.');
    return;
  }

  const userExists = users.find(u => u.username === username);

  if (userExists) {
    alert('Username already exists.');
    return;
  }

  users.push({ username, password });
  localStorage.setItem('users', JSON.stringify(users));
  alert('Registration successful! You can now login.');
  window.location.href = 'index.html';
}

// Login user
function login() {
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  if (!username || !password) {
    alert('Please fill all fields.');
    return;
  }

  if (username === adminEmail && password === adminPassword) {
    localStorage.setItem('loggedIn', 'admin');
    window.location.href = 'wallet.html';
    return;
  }

  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    localStorage.setItem('loggedIn', username);
    window.location.href = 'wallet.html';
  } else {
    alert('Invalid username or password.');
  }
}

// Logout
function logout() {
  localStorage.removeItem('loggedIn');
  window.location.href = 'index.html';
}

// Wallet Connection (BSC)
async function connectWallet() {
  showSpinner();
  try {
    if (!window.ethereum) {
      alert('Please install MetaMask or Trust Wallet.');
      hideSpinner();
      return;
    }

    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const address = accounts[0];

    document.getElementById('walletAddress').innerText = address;
    document.getElementById('walletInfo').style.display = 'block';
    document.getElementById('connectBtn').style.display = 'none';
    document.getElementById('actionButtons').style.display = 'block';
    document.getElementById('status').innerText = 'Wallet connected!';

  } catch (error) {
    console.error('Wallet connection error:', error);
    alert('Failed to connect wallet.');
  }
  hideSpinner();
}

// Send Crypto (5% fee)
async function sendCrypto() {
  const recipient = prompt('Enter recipient address:');
  const amount = prompt('Enter amount to send:');

  if (!recipient || !amount) {
    alert('Recipient and amount are required.');
    return;
  }

  const amountWithFee = parseFloat(amount) * 0.95;

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const tx = await signer.sendTransaction({
      to: recipient,
      value: ethers.parseEther(amountWithFee.toString())
    });

    alert(`Transaction sent! Hash: ${tx.hash}`);
  } catch (error) {
    console.error('Send error:', error);
    alert('Transaction failed.');
  }
}

// Receive Crypto (just shows address)
function receiveCrypto() {
  const address = document.getElementById('walletAddress').innerText;
  navigator.clipboard.writeText(address);
  alert('Your wallet address copied!');
}

// Swap (Exchange) Crypto (5% fee simulated)
async function swapCrypto() {
  const tokenIn = prompt('Enter FROM token address (example: BNB address)');
  const tokenOut = prompt('Enter TO token address (example: DRF address)');
  const amount = prompt('Enter amount to swap:');

  if (!tokenIn || !tokenOut || !amount) {
    alert('All fields required.');
    return;
  }

  alert(`Simulating swap ${parseFloat(amount) * 0.95} (after 5% fee) from ${tokenIn} to ${tokenOut}`);
}

// On wallet.html load
function checkLogin() {
  if (!localStorage.getItem('loggedIn')) {
    window.location.href = 'index.html';
  }
}
