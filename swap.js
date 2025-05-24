// swap.js - Fully Standalone PancakeSwap Integration for DRF Wallet DApp

const Web3 = window.Web3;
let web3;
let userAccount;

const pancakeRouterAddress = "0x88880F4082DDC60B9065c3DBf955789336573867"; // PancakeSwap V2
const feeReceiver = "0x88253D87990EdD1E647c3B6eD21F57fb061a3040"; // Fee in USDC

// Token Contracts
const TOKENS = {
  DRF: {
    address: "0x7788a60dbC85AB46767F413EC7d51F149AA1bec6",
    decimals: 18,
  },
  USDC: {
    address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
    decimals: 18,
  },
  USDT: {
    address: "0x55d398326f99059ff775485246999027b3197955",
    decimals: 18,
  },
  BNB: {
    address: "BNB",
    decimals: 18,
  },
};

const routerABI = [...]; // Add PancakeSwap V2 Router ABI here

async function initWeb3() {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const accounts = await web3.eth.getAccounts();
    userAccount = accounts[0];
    checkNetwork();
  } else {
    alert("Please install MetaMask or use a Web3-enabled browser.");
  }
}

async function checkNetwork() {
  const chainId = await web3.eth.getChainId();
  if (chainId !== 56) {
    alert("Please switch to BSC Mainnet in MetaMask.");
  }
}

function getAmountWithFee(amountIn, decimals) {
  const fee = (amountIn * 0.01).toFixed(decimals);
  const netAmount = (amountIn - fee).toFixed(decimals);
  return { netAmount, fee };
}

async function executeSwap(fromToken, toToken, amountInRaw) {
  const router = new web3.eth.Contract(routerABI, pancakeRouterAddress);
  const decimals = TOKENS[fromToken].decimals;
  const amountIn = web3.utils.toBN(amountInRaw * 10 ** decimals);

  const { netAmount, fee } = getAmountWithFee(amountInRaw, decimals);
  const netAmountBN = web3.utils.toBN(netAmount * 10 ** decimals);
  const feeAmountBN = web3.utils.toBN(fee * 10 ** decimals);

  // Approve and transfer fee to USDC address
  if (fromToken !== "BNB") {
    const tokenContract = new web3.eth.Contract(ERC20_ABI, TOKENS[fromToken].address);
    await tokenContract.methods.approve(pancakeRouterAddress, amountIn.toString()).send({ from: userAccount });
    if (fromToken !== "USDC") {
      const feeToken = new web3.eth.Contract(ERC20_ABI, TOKENS["USDC"].address);
      await feeToken.methods.transfer(feeReceiver, feeAmountBN.toString()).send({ from: userAccount });
    } else {
      await tokenContract.methods.transfer(feeReceiver, feeAmountBN.toString()).send({ from: userAccount });
    }
  }

  const path = [TOKENS[fromToken].address, TOKENS[toToken].address];
  const deadline = Math.floor(Date.now() / 1000) + 60 * 20;

  if (fromToken === "BNB") {
    await router.methods.swapExactETHForTokens(
      0,
      path,
      userAccount,
      deadline
    ).send({ from: userAccount, value: netAmountBN.toString() });
  } else if (toToken === "BNB") {
    await router.methods.swapExactTokensForETH(
      netAmountBN.toString(),
      0,
      path,
      userAccount,
      deadline
    ).send({ from: userAccount });
  } else {
    await router.methods.swapExactTokensForTokens(
      netAmountBN.toString(),
      0,
      path,
      userAccount,
      deadline
    ).send({ from: userAccount });
  }

  alert("Swap completed successfully!");
}

function handleSwapClick() {
  const fromToken = document.getElementById("fromToken").value;
  const toToken = document.getElementById("toToken").value;
  const amount = parseFloat(document.getElementById("swapAmount").value);

  if (!fromToken || !toToken || !amount || fromToken === toToken) {
    alert("Invalid swap details.");
    return;
  }
  executeSwap(fromToken, toToken, amount);
}

document.getElementById("connectWalletBtn").addEventListener("click", initWeb3);
document.getElementById("swapNowBtn").addEventListener("click", handleSwapClick);

// Note: You must define ERC20_ABI and routerABI in your project for this script to work.
