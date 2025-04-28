// Configuration
const adminUsername = "digitalrufiya@gmail.com";
const adminPassword = "Zivian@2020";
const drfTokenAddress = "0x7788a60dbC85AB46767F413EC7d51F149AA1bec6"; // DRF Contract Address
const feeCollector = "0x82dAa32579728EDAd1b940Ad26f9336845C8A3c7"; // Your Fee Address
const bscChainId = "0x38"; // Binance Smart Chain Mainnet

// Initialize variables
let currentAccount = null;

// Wallet connect function
async function connectWallet() {
  if (typeof window.ethereum !== "undefined") {
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      currentAccount = accounts[0];
      document.getElementById('walletAddress').innerText = shortenAddress(currentAccount);
      showToast("Wallet connected successfully!", "success");
    } catch (error) {
      showToast("Wallet connection failed!", "error");
    }
  } else {
    showToast("MetaMask is not installed!", "error");
  }
}

// Shorten wallet address
function shortenAddress(address) {
  return address.slice(0, 6) + "..." + address.slice(-4);
}

// Send BNB
async function sendBNB() {
  const receiver = document.getElementById("sendTo").value;
  const amount = document.getElementById("sendAmount").value;

  if (!receiver || !amount) {
    showToast("Please enter address and amount.", "error");
    return;
  }

  const sendAmount = (amount * 0.95).toFixed(18);
  const feeAmount = (amount * 0.05).toFixed(18);

  try {
    // Send to receiver
    await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [{
        from: currentAccount,
        to: receiver,
        value: toHex(etherToWei(sendAmount)),
      }]
    });

    // Send fee
    await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [{
        from: currentAccount,
        to: feeCollector,
        value: toHex(etherToWei(feeAmount)),
      }]
    });

    showToast("BNB sent successfully (5% fee collected).", "success");
  } catch (err) {
    showToast("Transaction failed!", "error");
  }
}

// Exchange BNB to DRF (Dummy Function)
async function exchangeTokens() {
  const amount = document.getElementById("exchangeAmount").value;

  if (!amount) {
    showToast("Please enter an amount.", "error");
    return;
  }

  const sendAmount = (amount * 0.95).toFixed(18);
  const feeAmount = (amount * 0.05).toFixed(18);

  try {
    // Here you can call PancakeSwap Router contract later for real swap
    // For now, just simulate transaction fee collection

    await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [{
        from: currentAccount,
        to: feeCollector,
        value: toHex(etherToWei(feeAmount)),
      }]
    });

    showToast(`Exchange simulated! 5% fee collected.`, "success");
  } catch (err) {
    showToast("Exchange failed!", "error");
  }
}

// Receive (just display address)
function receiveBNB() {
  if (currentAccount) {
    navigator.clipboard.writeText(currentAccount);
    showToast("Your address copied to clipboard.", "success");
  }
}

// Helper: Convert ETH to Wei
function etherToWei(eth) {
  return BigInt(Math.floor(eth * 1e18)).toString();
}

// Helper: Hexadecimal converter
function toHex(number) {
  return "0x" + BigInt(number).toString(16);
}

// Toast message
function showToast(message, type) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerText = message;
  if (type === "success") toast.style.background = "#00a884";
  else if (type === "error") toast.style.background = "#ff4d4d";

  document.body.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('show');
  }, 100);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 500);
  }, 3000);
}

// Admin/User Login
function login() {
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;

  if (!username || !password) {
    showToast("Please fill all fields.", "error");
    return;
  }

  if (username === adminUsername && password === adminPassword) {
    localStorage.setItem("loggedIn", "admin");
    window.location.href = "wallet.html";
  } else {
    // For now, all users are accepted
    localStorage.setItem("loggedIn", "user");
    window.location.href = "wallet.html";
  }
}

// Logout
function logout() {
  localStorage.removeItem("loggedIn");
  window.location.href = "index.html";
}

// Protect wallet page
function checkLogin() {
  const status = localStorage.getItem("loggedIn");
  if (!status) {
    window.location.href = "index.html";
  }
}

// Tabs switching
function switchTab(tabName) {
  document.getElementById("sendSection").classList.add("hidden");
  document.getElementById("receiveSection").classList.add("hidden");
  document.getElementById("exchangeSection").classList.add("hidden");

  if (tabName === "send") {
    document.getElementById("sendSection").classList.remove("hidden");
  } else if (tabName === "receive") {
    document.getElementById("receiveSection").classList.remove("hidden");
  } else if (tabName === "exchange") {
    document.getElementById("exchangeSection").classList.remove("hidden");
  }
}

// Auto connect if already connected
if (window.ethereum) {
  window.ethereum.on('accountsChanged', function (accounts) {
    currentAccount = accounts[0] || null;
    if (currentAccount) {
      document.getElementById('walletAddress').innerText = shortenAddress(currentAccount);
    }
  });
}
