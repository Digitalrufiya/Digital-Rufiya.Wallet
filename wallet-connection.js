// wallet-connection.js
import { Core } from "https://cdn.jsdelivr.net/npm/@walletconnect/core@2.8.5/dist/esm/index.js";
import { WalletKit } from "https://cdn.jsdelivr.net/npm/@reown/walletkit@1.0.6/dist/walletkit.module.js";
import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@6.7.0/dist/ethers.min.js";

// Wallet detection
if (typeof window.ethereum !== 'undefined') {
  console.log('Wallet is available!');
} else {
  console.log('No wallet found. Please install MetaMask.');
}

// Core setup
const core = new Core({
  projectId: '5c53beb0cbc14bcf6d24f38c9bfb7560'
});

// Metadata setup
const metadata = {
  name: 'Digitalrufiya-wallet',
  description: 'DRF Wallet Example',
  url: 'https://reown.com/appkit',
  icons: ['https://assets.reown.com/reown-profile-pic.png']
};

// Token details
const tokenAddress = '0x657f33094eD55c2864b0f9De0B11127e08165FAd';
const tokenABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

let walletKit;
let provider;

// Initialize WalletKit
async function initWalletKit() {
  walletKit = await WalletKit.init({
    core,
    metadata,
    requiredChains: [56] // BSC only
  });
}

// Connect Wallet
export async function connectWallet(isAutoReconnect = false) {
  try {
    if (!walletKit) {
      await initWalletKit();
    }
    const session = await walletKit.connect({
      autoConnectLastSession: isAutoReconnect
    });

    const accounts = session.accounts;
    const address = accounts[0];

    console.log('Connected account:', address);

    document.getElementById('userAddress').innerText = address;
    document.getElementById('walletInfo').style.display = 'block';
    document.getElementById('status').innerText = 'Wallet Connected to BSC!';

    if (!isAutoReconnect) {
      localStorage.setItem('walletConnected', 'true');
    }

    // Initialize ethers provider
    provider = new ethers.BrowserProvider(walletKit.getProvider());

    // Fetch token balance
    await fetchTokenBalance(address);

  } catch (error) {
    console.error('Wallet connection failed:', error);
    document.getElementById('status').innerText = 'Connection failed. Please try again.';
    localStorage.removeItem('walletConnected');
  }
}

// Fetch Token Balance
async function fetchTokenBalance(address) {
  try {
    const tokenContract = new ethers.Contract(tokenAddress, tokenABI, provider);
    const [balance, decimals] = await Promise.all([
      tokenContract.balanceOf(address),
      tokenContract.decimals()
    ]);

    const formattedBalance = ethers.formatUnits(balance, decimals);
    document.getElementById('tokenBalance').innerText = `${formattedBalance} DRF`;
  } catch (error) {
    console.error('Error fetching token balance:', error);
    document.getElementById('tokenBalance').innerText = 'Error fetching balance';
  }
}

// Copy Address
export function copyAddress() {
  const address = document.getElementById('userAddress').innerText;
  navigator.clipboard.writeText(address).then(() => {
    alert('Wallet address copied to clipboard!');
  });
}

// Auto connect if walletConnected is true
window.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('connectButton').addEventListener('click', () => connectWallet(false));
  document.getElementById('userAddress').addEventListener('click', copyAddress);

  if (localStorage.getItem('walletConnected') === 'true') {
    console.log('Attempting auto reconnect...');
    await connectWallet(true);
  }
});
