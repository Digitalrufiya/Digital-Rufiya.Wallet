// swap.js - DRF Wallet Standalone PancakeSwap V2 Integration

const web3 = new Web3(window.ethereum);

const DRF_TOKEN = "0x7788a60dbC85AB46767F413EC7d51F149AA1bec6";
const PANCAKESWAP_ROUTER_V2 = "0x88880F4082DDC60B9065c3DBf955789336573867";
const USDC = "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d";
const USDT = "0x55d398326f99059fF775485246999027B3197955";
const BNB = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"; // Placeholder for native BNB
const FEE_RECEIVER = "0x88253D87990EdD1E647c3B6eD21F57fb061a3040";
const FEE_PERCENT = 1; // 1%

let userAccount = null;

// Connect wallet
async function connectWallet() {
  if (window.ethereum) {
    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      userAccount = accounts[0];
      document.getElementById("walletAddress").innerText = userAccount;
    } catch (err) {
      alert("Wallet connection failed.");
    }
  } else {
    alert("Please install MetaMask or another Web3 wallet.");
  }
}

// Swap tokens
async function swapTokens(fromToken, toToken, amountIn) {
  if (!userAccount) return alert("Connect wallet first.");

  const router = new web3.eth.Contract([
    {
      "name": "swapExactTokensForTokens",
      "type": "function",
      "inputs": [
        {"type": "uint256", "name": "amountIn"},
        {"type": "uint256", "name": "amountOutMin"},
        {"type": "address[]", "name": "path"},
        {"type": "address", "name": "to"},
        {"type": "uint256", "name": "deadline"}
      ],
      "outputs": [{"type": "uint256[]", "name": "amounts"}]
    }
  ], PANCAKESWAP_ROUTER_V2);

  const tokenPath = [fromToken, toToken];
  const amountInWei = web3.utils.toWei(amountIn, "ether");
  const fee = (parseFloat(amountIn) * FEE_PERCENT / 100).toFixed(18);
  const amountAfterFee = (parseFloat(amountIn) - parseFloat(fee)).toFixed(18);
  const feeWei = web3.utils.toWei(fee, "ether");
  const amountAfterFeeWei = web3.utils.toWei(amountAfterFee, "ether");

  // Send fee to FEE_RECEIVER
  const tokenContract = new web3.eth.Contract([
    { "constant": false, "inputs": [ { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" } ], "name": "transfer", "outputs": [ { "name": "", "type": "bool" } ], "type": "function" }
  ], fromToken);

  await tokenContract.methods.transfer(FEE_RECEIVER, feeWei).send({ from: userAccount });

  // Approve router to spend user's tokens
  const approveAbi = [ { "constant": false, "inputs": [ { "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" } ], "name": "approve", "outputs": [ { "name": "", "type": "bool" } ], "type": "function" } ];
  const fromTokenContract = new web3.eth.Contract(approveAbi, fromToken);
  await fromTokenContract.methods.approve(PANCAKESWAP_ROUTER_V2, amountAfterFeeWei).send({ from: userAccount });

  const deadline = Math.floor(Date.now() / 1000) + 60 * 10;
  await router.methods.swapExactTokensForTokens(
    amountAfterFeeWei,
    0,
    tokenPath,
    userAccount,
    deadline
  ).send({ from: userAccount });

  alert("Swap successful!");
}

// UI handler
function handleSwap() {
  const from = document.getElementById("fromToken").value;
  const to = document.getElementById("toToken").value;
  const amount = document.getElementById("amount").value;
  if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
    alert("Enter valid amount");
    return;
  }
  swapTokens(from, to, amount);
}

document.getElementById("connectBtn").addEventListener("click", connectWallet);
document.getElementById("swapBtn").addEventListener("click", handleSwap);
