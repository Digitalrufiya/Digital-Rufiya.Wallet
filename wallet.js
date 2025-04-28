// wallet.js

import { Core } from "https://cdn.jsdelivr.net/npm/@walletconnect/core@2.8.5/dist/esm/index.js";
import { WalletKit } from "https://cdn.jsdelivr.net/npm/@reown/walletkit@1.0.6/dist/walletkit.module.js";
import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@6.7.0/dist/ethers.min.js";

// Wallet Detection
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
  name: 'Digitalrufiya Wallet',
  description: 'DRF Wallet Example for BSC',
  url: 'https://digitalrufiya.com', // <-- Update your own domain if you have
  icons: ['https://yourdomain.com/logo.png'] // <-- Update your logo URL
};

// Token details
const tokenAddress = '0x657f33094eD55c2864b0f9De0B11127e08165FAd';
const tokenABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

let walletKit;
let provider;

async function initWalletKit() {
  walletKit = await WalletKit.init({
    core,
    metadata,
    requiredChains: [56] // BSC Mainnet
  });
}

async function connectWallet(isAutoReconnect = false) {
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

    // Optional: Check and switch network to BSC if not connected
    await ensureCorrectNetwork();

    // Fetch token balance
    await fetchTokenBalance(address);

  } catch (error) {
    console.error('Wallet connection failed:', error);
    document.getElementById('status').innerText = 'Connection failed. Please try again.';
    localStorage.removeItem('walletConnected');
  }
}

async function ensureCorrectNetwork() {
  const network = await provider.getNetwork();
  if (network.chainId !== 56n) { // 56 for Binance Smart Chain
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x38' }] // 0x38 = 56 in hex
      });
      console.log('Switched to BSC Network');
    } catch (switchError) {
      console.error('Failed to switch network:', switchError);
      document.getElementById('status').innerText = 'Please switch manually to Binance Smart Chain (BSC)';
    }
  }
}

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

function copyAddress() {
  const address = document.getElementById('userAddress').innerText;
  navigator.clipboard.writeText(address).then(() => {
    alert('Wallet address copied to clipboard!');
  });
}

window.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('connectButton').addEventListener('click', () => connectWallet(false));
  document.getElementById('userAddress').addEventListener('click', copyAddress);

  if (localStorage.getItem('walletConnected') === 'true') {
    console.log('Attempting auto reconnect...');
    await connectWallet(true);
  }
});
