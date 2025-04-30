
// swap.js - Handles DRF token swapping using PancakeSwap and Ethers.js

import { ethers } from "https://cdn.ethers.io/lib/ethers-5.7.2.umd.min.js";

const drfTokenAddress = "0x7788a60dbC85AB46767F413EC7d51F149AA1bec6";
const feeReceiver = "0x88253D87990EdD1E647c3B6eD21F57fb061a3040";
const pancakeRouterAddress = "0x10ED43C718714eb63d5aA57B78B54704E256024E"; // PancakeSwap v2
const drfAbi = [
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function transfer(address recipient, uint256 amount) public returns (bool)"
];
const routerAbi = [
  "function swapExactTokensForTokensSupportingFeeOnTransferTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external"
];

let provider, signer, userAddress;

async function connectWallet() {
  if (window.ethereum) {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    userAddress = await signer.getAddress();
    document.getElementById("connectBtn").textContent = userAddress.substring(0, 6) + "..." + userAddress.slice(-4);
  } else {
    alert("Please install MetaMask or another Web3 wallet.");
  }
}

async function performSwap() {
  const amount = document.getElementById("swap-amount").value;
  const targetToken = document.getElementById("token-select").value;

  if (!amount || amount <= 0) return alert("Enter a valid amount");

  const tokenMap = {
    "USDC": "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
    "USDT": "0x55d398326f99059fF775485246999027B3197955",
    "BNB": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", // placeholder for native BNB
    "WBNB": "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
  };

  const tokenOut = tokenMap[targetToken];
  const drf = new ethers.Contract(drfTokenAddress, drfAbi, signer);
  const router = new ethers.Contract(pancakeRouterAddress, routerAbi, signer);

  const amountIn = ethers.utils.parseUnits(amount, 18);
  const fee = amountIn.mul(5).div(100);
  const swapAmount = amountIn.sub(fee);

  try {
    document.getElementById("swap-status").textContent = "Approving and preparing swap...";
    await drf.approve(pancakeRouterAddress, amountIn);

    await drf.transfer(feeReceiver, fee); // send 5% fee first

    const path = [drfTokenAddress, tokenOut];
    const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

    await router.swapExactTokensForTokensSupportingFeeOnTransferTokens(
      swapAmount,
      0,
      path,
      userAddress,
      deadline
    );

    document.getElementById("swap-status").textContent = "Swap complete.";
  } catch (err) {
    console.error(err);
    document.getElementById("swap-status").textContent = "Swap failed.";
  }
}

window.connectWallet = connectWallet;
window.performSwap = performSwap;

if (window.ethereum) {
  window.ethereum.on("accountsChanged", () => window.location.reload());
  window.ethereum.on("chainChanged", () => window.location.reload());
}
