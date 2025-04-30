// script.js - Full Final Version for DRF Wallet

import Web3Modal from "https://cdn.skypack.dev/web3modal";
import WalletConnectProvider from "https://cdn.skypack.dev/@walletconnect/web3-provider";

let web3Modal;
let provider;
let web3;
let selectedAccount;

const BSC_PARAMS = {
  chainId: "0x38",
  chainName: "Binance Smart Chain",
  nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
  rpcUrls: ["https://bsc-dataseed.binance.org/"],
  blockExplorerUrls: ["https://bscscan.com"]
};

const DRF_CONTRACT = "0xYourDRFTokenAddress";
const USDC_CONTRACT = "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d";
const USDT_CONTRACT = "0x55d398326f99059ff775485246999027b3197955";
const OWNER_ADDRESS = "0xYourOwnerWallet"; // Fee collector

const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function name() view returns (string)",
  "function symbol() view returns (string)"
];

window.onload = async () => {
  init();
  document.getElementById("connectWallet").addEventListener("click", connectWallet);
  document.getElementById("sendTokenBtn").addEventListener("click", sendToken);
};

function init() {
  const providerOptions = {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        rpc: {
          56: "https://bsc-dataseed.binance.org/"
        }
      }
    }
  };
  web3Modal = new Web3Modal({
    cacheProvider: false,
    providerOptions
  });
}

async function connectWallet() {
  try {
    provider = await web3Modal.connect();
    web3 = new ethers.providers.Web3Provider(provider);
    const accounts = await web3.listAccounts();
    selectedAccount = accounts[0];

    document.getElementById("walletAddress").innerText = selectedAccount;

    await switchToBSC();
    loadBalances();
    loadTransactionHistory();
  } catch (error) {
    console.error("Wallet connection failed", error);
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

async function loadBalances() {
  const providerEthers = new ethers.providers.Web3Provider(provider);

  const drf = new ethers.Contract(DRF_CONTRACT, ERC20_ABI, providerEthers);
  const usdc = new ethers.Contract(USDC_CONTRACT, ERC20_ABI, providerEthers);
  const usdt = new ethers.Contract(USDT_CONTRACT, ERC20_ABI, providerEthers);

  const drfBal = await drf.balanceOf(selectedAccount);
  const usdcBal = await usdc.balanceOf(selectedAccount);
  const usdtBal = await usdt.balanceOf(selectedAccount);

  document.getElementById("drfBalance").innerText = ethers.utils.formatUnits(drfBal, 18);
  document.getElementById("usdcBalance").innerText = ethers.utils.formatUnits(usdcBal, 18);
  document.getElementById("usdtBalance").innerText = ethers.utils.formatUnits(usdtBal, 18);
}

async function sendToken() {
  const token = document.getElementById("sendToken").value;
  const amount = document.getElementById("sendAmount").value;
  const to = document.getElementById("sendTo").value;

  let tokenAddress;
  if (token === "DRF") tokenAddress = DRF_CONTRACT;
  if (token === "USDC") tokenAddress = USDC_CONTRACT;
  if (token === "USDT") tokenAddress = USDT_CONTRACT;

  const signer = web3.getSigner();
  const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);

  const decimals = await contract.decimals();
  let amountInWei = ethers.utils.parseUnits(amount, decimals);

  if (token === "DRF") {
    const fee = amountInWei.mul(5).div(100);
    const remaining = amountInWei.sub(fee);
    await contract.transfer(to, remaining);
    await contract.transfer(OWNER_ADDRESS, fee);
  } else {
    await contract.transfer(to, amountInWei);
  }

  alert("Transaction sent.");
  loadBalances();
}

async function loadTransactionHistory() {
  const API_KEY = "G9H3FIK6M6EREF9DENVXG9EXHAVJJCXFM8";
  const url = `https://api.bscscan.com/api?module=account&action=tokentx&address=${selectedAccount}&sort=desc&apikey=${API_KEY}`;

  const res = await fetch(url);
  const data = await res.json();

  const list = document.getElementById("transactionList");
  list.innerHTML = "";

  data.result.slice(0, 20).forEach(tx => {
    const type = tx.from.toLowerCase() === selectedAccount.toLowerCase() ? "Sent" : "Received";
    const row = `
      <div class="transaction-item">
        <span>${tx.tokenSymbol}</span>
        <span>${ethers.utils.formatUnits(tx.value, tx.tokenDecimal)}</span>
        <span>${type}</span>
        <span>${new Date(tx.timeStamp * 1000).toLocaleString()}</span>
        <a href="https://bscscan.com/tx/${tx.hash}" target="_blank">View</a>
      </div>`;
    list.innerHTML += row;
  });
}
