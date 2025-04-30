// script.js - Fully Enhanced DRF Wallet DApp

// --- Imports and Global Variables ---
import Web3Modal from "https://cdn.skypack.dev/web3modal";
import WalletConnectProvider from "https://cdn.skypack.dev/@walletconnect/web3-provider";

let web3Modal;
let provider;
let web3; // ethers provider
let selectedAccount;

// BSC Network parameters
const BSC_PARAMS = {
  chainId: "0x38",
  chainName: "Binance Smart Chain",
  nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
  rpcUrls: ["https://bsc-dataseed.binance.org/"],
  blockExplorerUrls: ["https://bscscan.com"]
};

// Replace with your actual DRF contract address
const DRF_CONTRACT = "0xYourDRFTokenAddress";
// USDC and USDT contract addresses on BSC
const USDC_CONTRACT = "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d";
const USDT_CONTRACT = "0x55d398326f99059ff775485246999027b3197955";

// Fee collector address (owner)
const OWNER_ADDRESS = "0xYourOwnerWallet";

// Replace with your BscScan API key
const BSCSCAN_API_KEY = "YourBscScanApiKey";

// Standard ERC20 ABI (subset)
const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function name() view returns (string)",
  "function symbol() view returns (string)"
];

// For storing token contract instances after connection
let tokenContracts = {};

window.onload = async () => {
  init();
  document.getElementById("connectWallet").addEventListener("click", connectWallet);
  document.getElementById("sendForm").addEventListener("submit", sendToken);
  document.getElementById("swapForm").addEventListener("submit", swapTokens);

  document.getElementById("maxSendBtn").addEventListener("click", fillMaxSend);
  document.getElementById("maxSwapBtn").addEventListener("click", fillMaxSwap);
};

// --- Initialization ---
function init() {
  const providerOptions = {
    walletconnect: {
      package: WalletConnectProvider,
      options: { rpc: { 56: "https://bsc-dataseed.binance.org/" } }
    }
  };
  web3Modal = new Web3Modal({
    cacheProvider: false,
    providerOptions,
    theme: "light"
  });
}

// --- Toast Notifications ---
function showToast(message, type = "info") {
  // Type can be "info", "success", "error"
  let bgColor;
  switch (type) {
    case "success":
      bgColor = "#10b981";
      break;
    case "error":
      bgColor = "#ef4444";
      break;
    case "info":
    default:
      bgColor = "#2563eb";
      break;
  }
  Toastify({
    text: message,
    duration: 3000,
    gravity: "top",
    position: "right",
    backgroundColor: bgColor
  }).showToast();
}

// --- Connect Wallet ---
async function connectWallet() {
  try {
    provider = await web3Modal.connect();
    web3 = new ethers.providers.Web3Provider(provider);
    const accounts = await web3.listAccounts();
    selectedAccount = accounts[0];
    document.getElementById("connectWallet").innerText = selectedAccount.slice(0, 6) + "..." + selectedAccount.slice(-4);
    showToast("Wallet connected", "success");
    
    await switchToBSC();
    await loadBalances();
    await loadGasFee();
    loadTransactionHistory();
    renderReceiveSection();
  } catch (error) {
    console.error("Wallet connection failed", error);
    showToast("Wallet connection failed", "error");
  }
}

async function switchToBSC() {
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: BSC_PARAMS.chainId }]
    });
  } catch (switchError) {
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [BSC_PARAMS]
      });
    }
  }
}

// --- Load Balances ---
async function loadBalances() {
  const providerEthers = new ethers.providers.Web3Provider(provider);
  // Create contract instances
  tokenContracts.DRF = new ethers.Contract(DRF_CONTRACT, ERC20_ABI, providerEthers);
  tokenContracts.USDC = new ethers.Contract(USDC_CONTRACT, ERC20_ABI, providerEthers);
  tokenContracts.USDT = new ethers.Contract(USDT_CONTRACT, ERC20_ABI, providerEthers);

  try {
    const drfBal = await tokenContracts.DRF.balanceOf(selectedAccount);
    const usdcBal = await tokenContracts.USDC.balanceOf(selectedAccount);
    const usdtBal = await tokenContracts.USDT.balanceOf(selectedAccount);

    document.getElementById("drfBalance").innerText = ethers.utils.formatUnits(drfBal, 18);
    document.getElementById("usdcBalance").innerText = ethers.utils.formatUnits(usdcBal, 18);
    document.getElementById("usdtBalance").innerText = ethers.utils.formatUnits(usdtBal, 18);
  } catch (error) {
    console.error("Error loading balances:", error);
    showToast("Error loading balances", "error");
  }
}

// --- Gas Fee Estimator ---
async function loadGasFee() {
  try {
    // Get current gas price in wei
    const gasPriceWei = await web3.getGasPrice();
    // Convert to Gwei
    const gasPriceGwei = ethers.utils.formatUnits(gasPriceWei, "gwei");
    document.getElementById("gasFeeDisplay").innerText = `Gas Price: ${parseFloat(gasPriceGwei).toFixed(2)} Gwei`;
  } catch (error) {
    console.error("Error fetching gas price:", error);
    document.getElementById("gasFeeDisplay").innerText = "Gas Price: --";
  }
}

// --- Render Receive Section (QR Code and Address) ---
function renderReceiveSection() {
  // In a real app you might generate a per-token QR code.
  // Here we simply show the wallet address with copy & view on BscScan.
  const container = document.getElementById("receiveContainer");
  container.innerHTML = `
    <div class="qr-card">
      <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${selectedAccount}" alt="QR Code">
      <p id="qrWalletAddress">${selectedAccount}</p>
      <button class="copy-btn" onclick="copyAddress()">Copy Address</button>
      <a href="https://bscscan.com/address/${selectedAccount}" target="_blank" class="copy-btn">View on BscScan</a>
    </div>
  `;
}

function copyAddress() {
  navigator.clipboard.writeText(selectedAccount)
    .then(() => showToast("Address copied!", "success"))
    .catch(() => showToast("Error copying address", "error"));
}

// --- Send Token Functionality ---
async function sendToken(e) {
  e.preventDefault();
  const token = document.getElementById("sendToken").value;
  const recipient = document.getElementById("recipient").value;
  const amount = document.getElementById("amount").value;

  if (!recipient || !amount) {
    showToast("Please fill in all fields", "error");
    return;
  }

  let tokenAddress;
  if (token === "DRF") tokenAddress = DRF_CONTRACT;
  if (token === "USDC") tokenAddress = USDC_CONTRACT;
  if (token === "USDT") tokenAddress = USDT_CONTRACT;

  try {
    const signer = web3.getSigner();
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
    const decimals = await contract.decimals();
    let amountInWei = ethers.utils.parseUnits(amount, decimals);

    showToast(`Sending ${amount} ${token}...`, "info");

    if (token === "DRF") {
      // Apply 5% fee for DRF sends
      const fee = amountInWei.mul(5).div(100);
      const remaining = amountInWei.sub(fee);
      const tx1 = await contract.transfer(recipient, remaining);
      const tx2 = await contract.transfer(OWNER_ADDRESS, fee);
      await tx1.wait();
      await tx2.wait();
    } else {
      const tx = await contract.transfer(recipient, amountInWei);
      await tx.wait();
    }
    showToast("Transaction successful", "success");
    await loadBalances();
    loadTransactionHistory();
  } catch (error) {
    console.error("Send failed:", error);
    showToast("Send transaction failed", "error");
  }
}

// --- Swap Tokens Functionality (Logic Only) ---
async function swapTokens(e) {
  e.preventDefault();
  // In this template, the swap logic is a placeholder
  // Future development can integrate PancakeSwap Router for live swaps.
  const swapFrom = document.getElementById("swapFrom").value;
  const swapTo = document.getElementById("swapTo").value;
  const amount = document.getElementById("swapAmount").value;
  if (swapFrom === swapTo) {
    showToast("Choose two different tokens", "error");
    return;
  }
  showToast("Swap functionality coming soon!", "info");
}

// --- "Max" Button Logic ---
async function fillMaxSend() {
  // Fill the send amount with the full token balance
  const token = document.getElementById("sendToken").value;
  let balance;
  if (token === "DRF") {
    balance = await tokenContracts.DRF.balanceOf(selectedAccount);
    balance = ethers.utils.formatUnits(balance, 18);
  } else if (token === "USDC") {
    balance = await tokenContracts.USDC.balanceOf(selectedAccount);
    balance = ethers.utils.formatUnits(balance, 18);
  } else if (token === "USDT") {
    balance = await tokenContracts.USDT.balanceOf(selectedAccount);
    balance = ethers.utils.formatUnits(balance, 18);
  }
  document.getElementById("amount").value = balance;
}

async function fillMaxSwap() {
  // Fill the swap amount with the full token balance of the 'swapFrom' token.
  const token = document.getElementById("swapFrom").value;
  let balance;
  if (token === "DRF") {
    balance = await tokenContracts.DRF.balanceOf(selectedAccount);
    balance = ethers.utils.formatUnits(balance, 18);
  } else if (token === "USDC") {
    balance = await tokenContracts.USDC.balanceOf(selectedAccount);
    balance = ethers.utils.formatUnits(balance, 18);
  } else if (token === "USDT") {
    balance = await tokenContracts.USDT.balanceOf(selectedAccount);
    balance = ethers.utils.formatUnits(balance, 18);
  }
  document.getElementById("swapAmount").value = balance;
}

// --- Transaction History ---
async function loadTransactionHistory() {
  const url = `https://api.bscscan.com/api?module=account&action=tokentx&address=${selectedAccount}&sort=desc&apikey=${BSCSCAN_API_KEY}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const list = document.getElementById("transactionHistory");
    list.innerHTML = "";
    data.result.slice(0, 20).forEach(tx => {
      const type = tx.from.toLowerCase() === selectedAccount.toLowerCase() ? "Sent" : "Received";
      const item = document.createElement("li");
      item.className = "transaction-item";
      item.innerHTML = `
        <span>${tx.tokenSymbol}</span>
        <span>${ethers.utils.formatUnits(tx.value, tx.tokenDecimal)}</span>
        <span>${type}</span>
        <span>${new Date(tx.timeStamp * 1000).toLocaleString()}</span>
        <a href="https://bscscan.com/tx/${tx.hash}" target="_blank">View</a>
      `;
      list.appendChild(item);
    });
  } catch (error) {
    console.error("Error fetching transaction history:", error);
    showToast("Error fetching transactions", "error");
  }
}
