// swap.js

const providerOptions = {
  walletconnect: {
    package: window.WalletConnectProvider.default,
    options: {
      rpc: {
        56: "https://bsc-dataseed.binance.org/"
      },
      chainId: 56
    }
  }
};

let web3;
let account;

const web3Modal = new window.Web3Modal.default({
  network: "binance",
  cacheProvider: true,
  providerOptions
});

const connectBtn = document.getElementById("connectBtn");
const swapBtn = document.getElementById("swapBtn");
const statusDiv = document.getElementById("status");

const DRF_TOKEN = "0xAfD7c3AbEd83578D80F43F4d3822cB1713cCC03d";
const PANCAKE_ROUTER = "0x10ED43C718714eb63d5aA57B78B54704E256024E";
const TOKENS = {
  BNB: { symbol: "BNB", address: "BNB", decimals: 18 },
  USDC: { symbol: "USDC", address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d", decimals: 18 },
  USDT: { symbol: "USDT", address: "0x55d398326f99059fF775485246999027B3197955", decimals: 18 },
  DRF: { symbol: "DRF", address: DRF_TOKEN, decimals: 18 },
};

connectBtn.onclick = async () => {
  try {
    const provider = await web3Modal.connect();
    web3 = new Web3(provider);
    const accounts = await web3.eth.getAccounts();
    account = accounts[0];
    connectBtn.style.display = "none";
    swapBtn.style.display = "inline-block";
    statusDiv.innerText = `Connected: ${account.substring(0, 6)}...${account.slice(-4)}`;
  } catch (err) {
    console.error("Connection error:", err);
    statusDiv.innerText = "Wallet connection failed.";
  }
};

swapBtn.onclick = async () => {
  const fromToken = document.getElementById("fromToken").value;
  const toToken = document.getElementById("toToken").value;
  const amount = parseFloat(document.getElementById("fromAmount").value);
  if (!web3 || !account) return alert("Please connect your wallet.");
  if (!amount || amount <= 0) return alert("Invalid amount");
  if (fromToken === toToken) return alert("Cannot swap same tokens");

  const router = new web3.eth.Contract([
    {
      inputs: [
        { name: "amountIn", type: "uint256" },
        { name: "amountOutMin", type: "uint256" },
        { name: "path", type: "address[]" },
        { name: "to", type: "address" },
        { name: "deadline", type: "uint256" },
      ],
      name: "swapExactETHForTokensSupportingFeeOnTransferTokens",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [
        { name: "amountIn", type: "uint256" },
        { name: "amountOutMin", type: "uint256" },
        { name: "path", type: "address[]" },
        { name: "to", type: "address" },
        { name: "deadline", type: "uint256" },
      ],
      name: "swapExactTokensForTokensSupportingFeeOnTransferTokens",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    }
  ], PANCAKE_ROUTER);

  const from = TOKENS[fromToken];
  const to = TOKENS[toToken];
  const deadline = Math.floor(Date.now() / 1000) + 60 * 20;
  const amountIn = web3.utils.toWei(amount.toString(), "ether");
  const path = [from.address, to.address];

  try {
    if (fromToken === "BNB") {
      await router.methods
        .swapExactETHForTokensSupportingFeeOnTransferTokens(
          0,
          path,
          account,
          deadline
        )
        .send({ from: account, value: amountIn });
    } else {
      const tokenContract = new web3.eth.Contract([
        {
          name: "approve",
          type: "function",
          inputs: [
            { type: "address", name: "spender" },
            { type: "uint256", name: "amount" }
          ],
          outputs: [{ type: "bool", name: "" }],
          constant: false,
          payable: false,
        }
      ], from.address);

      await tokenContract.methods.approve(PANCAKE_ROUTER, amountIn).send({ from: account });
      await router.methods
        .swapExactTokensForTokensSupportingFeeOnTransferTokens(
          amountIn,
          0,
          path,
          account,
          deadline
        )
        .send({ from: account });
    }
    statusDiv.innerText = "✅ Swap successful!";
  } catch (err) {
    console.error("Swap error:", err);
    statusDiv.innerText = `❌ Swap failed: ${err.message}`;
  }
};
