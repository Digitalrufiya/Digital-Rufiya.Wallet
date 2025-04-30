// script.js - Web3 Wallet Connect + Token Balances + QR + Tx History

import Web3Modal from "https://cdn.skypack.dev/web3modal";
import { ethers } from "https://cdn.skypack.dev/ethers";
import QRCode from "https://cdn.skypack.dev/qrcode";

const providerOptions = {};

const web3Modal = new Web3Modal({
  cacheProvider: false,
  providerOptions,
});

let provider, signer, walletAddress;

const DRF_ADDRESS = "0x7788a60dbC85AB46767F413EC7d51F149AA1bec6";
const USDC_ADDRESS = "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d";
const USDT_ADDRESS = "0x55d398326f99059ff775485246999027b3197955";
const ERC20_ABI = ["function balanceOf(address) view returns (uint)", "function decimals() view returns (uint8)"];

async function connectWallet() {
  try {
    const instance = await web3Modal.connect();
    provider = new ethers.BrowserProvider(instance);
    signer = await provider.getSigner();
    walletAddress = await signer.getAddress();
    document.getElementById("walletStatus").innerText = `Connected: ${walletAddress}`;
    updateQR(walletAddress);
    getBalances();
    fetchTxHistory();
  } catch (error) {
    console.error("Wallet connection error:", error);
  }
}

function updateQR(address) {
  QRCode.toCanvas(document.getElementById("qrCanvas"), address, err => {
    if (err) console.error(err);
  });
  document.getElementById("qrWalletAddress").innerText = address;
}

async function getTokenBalance(tokenAddress, label) {
  const token = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
  const balance = await token.balanceOf(walletAddress);
  const decimals = await token.decimals();
  return ethers.formatUnits(balance, decimals);
}

async function getBalances() {
  try {
    const drf = await getTokenBalance(DRF_ADDRESS, "DRF");
    const usdc = await getTokenBalance(USDC_ADDRESS, "USDC");
    const usdt = await getTokenBalance(USDT_ADDRESS, "USDT");
    document.getElementById("drfBalance").innerText = `DRF: ${drf}`;
    document.getElementById("usdcBalance").innerText = `USDC: ${usdc}`;
    document.getElementById("usdtBalance").innerText = `USDT: ${usdt}`;
  } catch (e) {
    console.error("Balance fetch error:", e);
  }
}

async function fetchTxHistory() {
  const api = `https://api.bscscan.com/api?module=account&action=tokentx&address=${walletAddress}&sort=desc&apikey=YourBscScanAPIKey`;
  const res = await fetch(api);
  const { result } = await res.json();

  const last20 = result.slice(0, 20);
  const txList = document.getElementById("txList");
  txList.innerHTML = "";
  for (const tx of last20) {
    const direction = tx.to.toLowerCase() === walletAddress.toLowerCase() ? "Received" : "Sent";
    const row = `
      <li>
        ${tx.tokenSymbol} - ${direction} ${ethers.formatUnits(tx.value, tx.tokenDecimal)} on ${new Date(tx.timeStamp * 1000).toLocaleString()}<br>
        <a href="https://bscscan.com/tx/${tx.hash}" target="_blank">View on BscScan</a>
      </li>
    `;
    txList.innerHTML += row;
  }
}

document.getElementById("connectBtn").addEventListener("click", connectWallet);
