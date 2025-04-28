// Constants
const adminEmail = 'digitalrufiya@gmail.com';
const adminPassword = 'Zivian@2020';

// Global Variables
let provider, signer, userAddress;

// Loading spinner show/hide
function showSpinner() {
  const spinner = document.createElement('div');
  spinner.className = 'spinner';
  spinner.id = 'spinner';
  document.body.appendChild(spinner);
}

function hideSpinner() {
  const spinner = document.getElementById('spinner');
  if (spinner) spinner.remove();
}

// Login Function
function login() {
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;

  if (username === adminEmail && password === adminPassword) {
    alert('Login successful!');
    localStorage.setItem('isLoggedIn', 'true');
    window.location.href = 'wallet.html';
  } else {
    alert('Invalid login details!');
  }
}

// Logout Function
function logout() {
  localStorage.removeItem('isLoggedIn');
  window.location.href = 'index.html';
}

// Wallet Connect
async function connectWallet() {
  try {
    showSpinner();
    if (window.ethereum) {
      provider = new ethers.BrowserProvider(window.ethereum);
      signer = await provider.getSigner();
      userAddress = await signer.getAddress();

      document.getElementById('userAddress').innerText = userAddress;
      document.getElementById('walletInfo').style.display = 'block';
      document.getElementById('connectButton').style.display = 'none';
      document.getElementById('logoutButton').style.display = 'block';

      hideSpinner();
      alert('Wallet connected!');
    } else {
      hideSpinner();
      alert('No wallet found. Install MetaMask!');
    }
  } catch (error) {
    hideSpinner();
    console.error(error);
    alert('Wallet connection failed!');
  }
}

// Send Tokens
async function sendTokens() {
  const recipient = prompt('Enter recipient address:');
  const amount = prompt('Enter amount to send (in BNB):');

  if (!recipient || !amount) {
    alert('Recipient or amount missing.');
    return;
  }

  try {
    showSpinner();

    const value = ethers.parseEther(amount);
    const charge = value * 5n / 100n; // 5% charge
    const finalValue = value - charge;

    const tx = await signer.sendTransaction({
      to: recipient,
      value: finalValue
    });

    await tx.wait();
    hideSpinner();
    alert('Transaction successful with 5% charge!');
  } catch (error) {
    hideSpinner();
    console.error(error);
    alert('Transaction failed!');
  }
}

// Receive Tokens (copy address)
function receiveTokens() {
  navigator.clipboard.writeText(userAddress)
    .then(() => {
      alert('Wallet address copied!');
    })
    .catch(() => {
      alert('Failed to copy address.');
    });
}

// Dummy Exchange Function
async function exchangeTokens() {
  const amount = prompt('Enter amount of BNB to exchange:');

  if (!amount) {
    alert('Amount is missing.');
    return;
  }

  try {
    showSpinner();

    const bnbAmount = ethers.parseEther(amount);
    const charge = bnbAmount * 5n / 100n; // 5% charge
    const finalAmount = bnbAmount - charge;

    // Simulate swap (no real swap happening here!)
    setTimeout(() => {
      hideSpinner();
      alert(`Exchange successful! You received tokens minus 5% fee.`);
    }, 2000);

  } catch (error) {
    hideSpinner();
    console.error(error);
    alert('Exchange failed.');
  }
}

// Auto reconnect
window.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'index.html';
  }

  if (window.location.pathname.includes('wallet.html')) {
    document.getElementById('connectButton').addEventListener('click', connectWallet);
    document.getElementById('logoutButton').addEventListener('click', logout);
    document.getElementById('sendButton').addEventListener('click', sendTokens);
    document.getElementById('receiveButton').addEventListener('click', receiveTokens);
    document.getElementById('exchangeButton').addEventListener('click', exchangeTokens);
  }
});
