
const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
let signer;
let userAddress;

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

const ADMIN_HASH = "2728990fe7028653e95854a3524a5d4ec7b66a99625beeb271c8e9ec3414f050";
let users = JSON.parse(localStorage.getItem('registeredUsers')) || [];

async function hashSHA256(input) {
  const encoded = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function connectWallet() {
  if (!window.ethereum) return alert("MetaMask not installed!");
  try {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    signer = ethersProvider.getSigner();
    userAddress = await signer.getAddress();
    localStorage.setItem('connectedWallet', userAddress);
    document.getElementById('wallet-display').textContent = userAddress;
  } catch (err) {
    console.error("Wallet connect failed", err);
  }
}

async function loadBalances() {
  if (!userAddress) return;
  const bnbBal = await ethersProvider.getBalance(userAddress);
  document.getElementById('userBalance')?.innerText = `${ethers.utils.formatEther(bnbBal)} BNB`;
  const div = document.getElementById('tokenBalances');
  if (div) {
    div.innerHTML = '';
    for (const key in tokens) {
      if (tokens[key].address) {
        const c = new ethers.Contract(tokens[key].address, erc20Abi, signer);
        const b = await c.balanceOf(userAddress);
        div.innerHTML += `<p>${key}: ${ethers.utils.formatUnits(b, tokens[key].decimals)}</p>`;
      }
    }
  }
}

async function login() {
  const email = document.getElementById('loginUsername').value.trim().toLowerCase();
  const password = document.getElementById('loginPassword').value;
  const hash = await hashSHA256(email + password);

  if (hash === ADMIN_HASH) {
    sessionStorage.setItem('adminLoggedIn', 'true');
    window.location.href = 'admin.html';
    return;
  }

  const matchedUser = users.find(u => u.email === email && u.passwordHash === hash);
  if (matchedUser) {
    localStorage.setItem('connectedUser', email);
    window.location.href = 'wallet.html';
  } else {
    alert("Invalid credentials.");
  }
}

async function handleRegister(event) {
  event.preventDefault();
  const email = document.getElementById('registerEmail').value.trim().toLowerCase();
  const password = document.getElementById('registerPassword').value;
  if (users.find(u => u.email === email)) {
    alert("Email already registered!");
    return;
  }
  const hashedPass = await hashSHA256(email + password);
  users.push({ email, passwordHash: hashedPass });
  localStorage.setItem('registeredUsers', JSON.stringify(users));
  alert("Registration successful! You can now login.");
  window.location.href = "index.html";
}

function logout() {
  localStorage.removeItem('connectedWallet');
  sessionStorage.removeItem('adminLoggedIn');
  localStorage.removeItem('connectedUser');
  window.location.href = 'index.html';
}

window.connectWallet = connectWallet;
window.login = login;
window.handleRegister = handleRegister;
window.logout = logout;
