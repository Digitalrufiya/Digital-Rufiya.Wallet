import { Core } from '@walletconnect/core';
import { WalletKit } from '@reown/walletkit';
import { ethers } from "https://cdn.ethers.io/lib/ethers-5.2.umd.min.js";

// --- Setup WalletKit
const core = new Core({
  projectId: '5c53beb0cbc14bcf6d24f38c9bfb7560'
});

const metadata = {
  name: 'Digitalrufiya Wallet',
  description: 'Web3 DRF Wallet',
  url: 'https://digitalrufiya.github.io/Digitalrufiya-wallet/',
  icons: ['https://ik.imagekit.io/ttbbg9ocv/1000000655.jpg?updatedAt=1745663093226']
};

const walletKit = await WalletKit.init({
  core,
  metadata
});

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

// Connect Wallet
async function connectWallet() {
  const session = await walletKit.connect();
  provider = new ethers.providers.Web3Provider(walletKit.getProvider());
  signer = provider.getSigner();
  userAddress = session.accounts[0];

  updateUI();
}

// Update UI
async function updateUI() {
  const network = await provider.getNetwork();
  const bnbBalance = await provider.getBalance(userAddress);

  networkName.innerText = network.name || 'Unknown';
  userAddressSpan.innerText = userAddress.slice(0, 6) + '...' + userAddress.slice(-4);
  bnbBalanceSpan.innerText = ethers.utils.formatEther(bnbBalance).slice(0, 6);

  // Load DRF Balance
  const drfContract = new ethers.Contract(
    "0x657f33094eD55c2864b0f9De0B11127e08165FAd", // DRF Token Address
    ["function balanceOf(address) view returns (uint)", "function transfer(address to, uint amount) returns (bool)"],
    signer
  );

  const drfBalance = await drfContract.balanceOf(userAddress);
  drfBalanceSpan.innerText = ethers.utils.formatUnits(drfBalance, 18).slice(0, 6);

  walletInfo.style.display = 'block';
  statusText.innerText = 'Wallet Connected!';
}

// Send Tokens
sendButton?.addEventListener('click', () => {
  document.getElementById('sendModal').style.display = 'block';
});

// Confirm Send
document.getElementById('confirmSendButton').addEventListener('click', async () => {
  const recipient = document.getElementById('recipientAddress').value;
  const amount = document.getElementById('sendAmount').value;

  if (!recipient || !amount) {
    alert("Please fill all fields!");
    return;
  }

  try {
    const drfContract = new ethers.Contract(
      "0x657f33094eD55c2864b0f9De0B11127e08165FAd",
      ["function balanceOf(address) view returns (uint)", "function transfer(address to, uint amount) returns (bool)"],
      signer
    );

    const tx = await drfContract.transfer(recipient, ethers.utils.parseUnits(amount, 18));
    await tx.wait();

    document.getElementById('status').innerText = 'Transaction successful!';
    document.getElementById('sendModal').style.display = 'none';
    updateUI();
  } catch (err) {
    console.error(err);
    alert('Transaction failed!');
  }
});

// Close Modal
document.getElementById('closeModal').addEventListener('click', () => {
  document.getElementById('sendModal').style.display = 'none';
});

// Connect Button Click
connectButton.addEventListener('click', connectWallet);
