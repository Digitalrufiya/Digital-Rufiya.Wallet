let provider;
let signer;
let userAddress;

const connectButton = document.getElementById('connectButton');
const sendButton = document.getElementById('sendButton');
const walletInfo = document.getElementById('walletInfo');
const statusText = document.getElementById('status');

const networkName = document.getElementById('networkName');
const userAddressSpan = document.getElementById('userAddress');
const bnbBalanceSpan = document.getElementById('bnbBalance');
const drfBalanceSpan = document.getElementById('drfBalance');

// Modal Elements
const sendModal = document.getElementById('sendModal');
const closeModal = document.getElementById('closeModal');
const recipientAddressInput = document.getElementById('recipientAddress');
const sendAmountInput = document.getElementById('sendAmount');
const confirmSendButton = document.getElementById('confirmSendButton');

// Success Animation Element
const successAnimation = document.getElementById('successAnimation');

// Your DRF Token Contract
const DRF_TOKEN_ADDRESS = '0x657f33094eD55c2864b0f9De0B11127e08165FAd';
const DRF_TOKEN_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint amount) returns (bool)"
];

// Initialize Web3Modal
const web3Modal = new window.Web3Modal.default({
  cacheProvider: false,
  providerOptions: {
    walletconnect: {
      package: window.WalletConnectProvider.default,
      options: {
        rpc: {
          56: "https://bsc-dataseed.binance.org/"
        },
        network: "binance",
      }
    }
  }
});

// Connect Wallet
async function connectWallet() {
  try {
    const instance = await web3Modal.connect();
    provider = new ethers.providers.Web3Provider(instance);
    signer = provider.getSigner();
    userAddress = await signer.getAddress();

    updateUI();
    setupListeners(instance);
  } catch (err) {
    console.error('Connection failed:', err);
    showToast('Connection failed. Please try again.', 'error');
  }
}

// Update UI after connection
async function updateUI() {
  const network = await provider.getNetwork();
  const bnbBalance = await provider.getBalance(userAddress);

  networkName.innerText = network.name || 'Unknown';
  userAddressSpan.innerText = userAddress.slice(0, 6) + '...' + userAddress.slice(-4);
  bnbBalanceSpan.innerText = ethers.utils.formatEther(bnbBalance).slice(0, 6);

  const drfContract = new ethers.Contract(DRF_TOKEN_ADDRESS, DRF_TOKEN_ABI, signer);
  const drfBalance = await drfContract.balanceOf(userAddress);
  drfBalanceSpan.innerText = ethers.utils.formatUnits(drfBalance, 18).slice(0, 6);

  walletInfo.style.display = 'block';
  statusText.innerText = 'Wallet connected!';
}

// Copy address to clipboard
userAddressSpan.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(userAddress);
    showToast('Address copied to clipboard!', 'success');
  } catch (err) {
    console.error('Failed to copy:', err);
    showToast('Failed to copy address.', 'error');
  }
});

// Send DRF tokens with Modal
sendButton.addEventListener('click', () => {
  sendModal.style.display = 'block';
});

closeModal.addEventListener('click', () => {
  sendModal.style.display = 'none';
});

confirmSendButton.addEventListener('click', async () => {
  const recipient = recipientAddressInput.value;
  const amount = sendAmountInput.value;

  if (!recipient || !amount) {
    showToast('Please fill all fields!', 'warning');
    return;
  }

  try {
    const drfContract = new ethers.Contract(DRF_TOKEN_ADDRESS, DRF_TOKEN_ABI, signer);
    const tx = await drfContract.transfer(recipient, ethers.utils.parseUnits(amount, 18));
    statusText.innerText = 'Transaction sent! Waiting for confirmation...';
    showToast('Transaction sent. Waiting for confirmation...', 'info');
    await tx.wait();
    statusText.innerText = 'Transaction confirmed!';
    showToast('Transaction Confirmed!', 'success');
    showSuccessAnimation();
    sendModal.style.display = 'none';
    updateUI();
  } catch (err) {
    console.error('Transaction failed:', err);
    showToast('Transaction failed. See console for details.', 'error');
  }
});

// Show Success Animation
function showSuccessAnimation() {
  successAnimation.style.display = 'block';
  setTimeout(() => {
    successAnimation.style.display = 'none';
  }, 2000);
}

// Toastify Wrapper
function showToast(message, type = 'success') {
  Toastify({
    text: message,
    duration: 3000,
    gravity: 'top',
    position: 'center',
    backgroundColor: type === 'error' ? "#e74c3c" : (type === 'warning' ? "#f1c40f" : "#2ecc71"),
  }).showToast();
}

// Wallet listeners
function setupListeners(instance) {
  instance.on('accountsChanged', () => window.location.reload());
  instance.on('chainChanged', () => window.location.reload());
  instance.on('disconnect', () => {
    web3Modal.clearCachedProvider();
    window.location.reload();
  });
}

// Connect wallet button
connectButton.addEventListener('click', connectWallet);

// Close modal clicking outside
window.onclick = function(event) {
  if (event.target == sendModal) {
    sendModal.style.display = "none";
  }
};
