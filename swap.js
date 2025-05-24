// swap.js
// Standalone DRF Wallet Swap Handler using PancakeSwap V2

const web3 = new Web3(window.ethereum);
const routerAddress = "0x10ED43C718714eb63d5aA57B78B54704E256024E"; // PancakeSwap V2 Router
const routerAbi = [
  // Simplified ABI for swapping
  {
    "name": "swapExactETHForTokensSupportingFeeOnTransferTokens",
    "type": "function",
    "inputs": [
      {"name": "amountOutMin", "type": "uint256"},
      {"name": "path", "type": "address[]"},
      {"name": "to", "type": "address"},
      {"name": "deadline", "type": "uint256"}
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "name": "swapExactTokensForTokensSupportingFeeOnTransferTokens",
    "type": "function",
    "inputs": [
      {"name": "amountIn", "type": "uint256"},
      {"name": "amountOutMin", "type": "uint256"},
      {"name": "path", "type": "address[]"},
      {"name": "to", "type": "address"},
      {"name": "deadline", "type": "uint256"}
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "name": "getAmountsOut",
    "type": "function",
    "inputs": [
      {"name": "amountIn", "type": "uint256"},
      {"name": "path", "type": "address[]"}
    ],
    "outputs": [
      {"name": "amounts", "type": "uint256[]"}
    ],
    "stateMutability": "view"
  }
];

const tokenAddresses = {
  BNB: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
  USDC: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
  USDT: "0x55d398326f99059fF775485246999027B3197955",
  DRF: "0x7788a60dbC85AB46767F413EC7d51F149AA1bec6"
};

const feeReceiver = "0x88253D87990EdD1E647c3B6eD21F57fb061a3040";

async function connectWallet() {
  try {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const accounts = await web3.eth.getAccounts();
    document.getElementById("walletAddress").innerText = accounts[0];
  } catch (err) {
    alert("Wallet connection failed.");
  }
}

async function getSwapEstimate(fromToken, toToken, amountIn) {
  const router = new web3.eth.Contract(routerAbi, routerAddress);
  if (fromToken === "BNB") fromToken = tokenAddresses.BNB;
  if (toToken === "BNB") toToken = tokenAddresses.BNB;

  try {
    const path = [tokenAddresses[fromToken], tokenAddresses[toToken]];
    const amounts = await router.methods.getAmountsOut(web3.utils.toWei(amountIn), path).call();
    return web3.utils.fromWei(amounts[1]);
  } catch (err) {
    return "0";
  }
}

async function executeSwap() {
  const fromToken = document.getElementById("fromToken").value;
  const toToken = document.getElementById("toToken").value;
  const amount = document.getElementById("fromAmount").value;

  const accounts = await web3.eth.getAccounts();
  const router = new web3.eth.Contract(routerAbi, routerAddress);

  const path = [tokenAddresses[fromToken], tokenAddresses[toToken]];
  const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
  const amountOutMin = 0; // For simplicity (can be replaced by slippage setting)

  if (fromToken === "BNB") {
    await router.methods
      .swapExactETHForTokensSupportingFeeOnTransferTokens(
        amountOutMin,
        path,
        accounts[0],
        deadline
      )
      .send({ from: accounts[0], value: web3.utils.toWei(amount) });
  } else {
    // Token approval must be done externally before swap
    await router.methods
      .swapExactTokensForTokensSupportingFeeOnTransferTokens(
        web3.utils.toWei(amount),
        amountOutMin,
        path,
        accounts[0],
        deadline
      )
      .send({ from: accounts[0] });
  }
}

document.getElementById("connectWallet").onclick = connectWallet;
document.getElementById("swapButton").onclick = executeSwap;
