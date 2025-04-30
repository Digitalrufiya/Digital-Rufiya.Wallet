import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3Modal from "web3modal";

const DRF_ADDRESS = "0xYourDRFTokenAddress";
const USDC_ADDRESS = "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d";
const USDT_ADDRESS = "0x55d398326f99059ff775485246999027b3197955";

const BSC_PARAMS = {
  chainId: "0x38",
  chainName: "Binance Smart Chain",
  nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
  rpcUrls: ["https://bsc-dataseed.binance.org/"],
  blockExplorerUrls: ["https://bscscan.com"]
};

let web3Modal, provider, signer, userAddress;
const tokenContracts = {};
const TOKEN_ABI = [
  "function balanceOf(address) view returns (uint)",
  "function decimals() view returns (uint8)",
  "function transfer(address, uint256) returns (bool)"
];

async function init() {
  web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions: {
      walletconnect: {
        package: WalletConnectProvider,
        options: { rpc: { 56: "https://bsc-dataseed.binance.org/" } }
      }
    }
  });

  if (web3Modal.cachedProvider) await connectWallet();

  document.getElementById("connectButton").onclick = connectWallet;
  document.getElementById("sendBtn").onclick = sendToken;
  document.getElementById("token").onchange = generateQRCode;
  document.getElementById("refreshHistory").onclick = getTransactionHistory;
  document.getElementById("swapBtn").onclick = simulateSwap;
}

async function connectWallet() {
  const instance = await web3Modal.connect();
  provider = new ethers.providers.Web3Provider(instance);
  signer = provider.getSigner();
  userAddress = await signer.getAddress();

  await switchToBSC();
  initTokenContracts();
  displayWalletInfo();
}

async function switchToBSC() {
  const network = await provider.getNetwork();
  if (network.chainId !== 56) {
    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [BSC_PARAMS]
      });
    } catch (e) {
      alert("Please switch to BSC manually.");
    }
  }
}

function initTokenContracts() {
  tokenContracts["DRF"] = new ethers.Contract(DRF_ADDRESS, TOKEN_ABI, signer);
  tokenContracts["USDC"] = new ethers.Contract(USDC_ADDRESS, TOKEN_ABI, signer);
  tokenContracts["USDT"] = new ethers.Contract(USDT_ADDRESS, TOKEN_ABI, signer);
}

async function displayWalletInfo() {
  document.getElementById("walletAddress").textContent = userAddress;
  generateQRCode();

  for (const [symbol, contract] of Object.entries(tokenContracts)) {
    const decimals = await contract.decimals();
    const balance = await contract.balanceOf(userAddress);
    document.getElementById(`balance${symbol}`).textContent =
      `${ethers.utils.formatUnits(balance, decimals)} ${symbol}`;
  }

  getTransactionHistory();
}

function generateQRCode() {
  const token = document.getElementById("token").value;
  const qrContainer = document.getElementById("qrCode");
  qrContainer.innerHTML = "";
  new QRCode(qrContainer, { text: userAddress, width: 150, height: 150 });
  document.getElementById("displayAddress").textContent = userAddress;
  document.getElementById("bscLink").href = `https://bscscan.com/address/${userAddress}`;
}

async function sendToken() {
  const token = document.getElementById("sendToken").value;
  const to = document.getElementById("sendTo").value.trim();
  const amount = document.getElementById("sendAmount").value.trim();

  if (!to || !amount) return showStatus("Fill all fields.", true);

  const contract = tokenContracts[token];
  const decimals = await contract.decimals();
  const sendAmount = ethers.utils.parseUnits(amount, decimals);

  try {
    if (token !== "DRF") {
      const drfFee = sendAmount.mul(5).div(100);
      const drf = tokenContracts["DRF"];
      await (await drf.transfer(DRF_ADDRESS, drfFee)).wait();
    }

    const tx = await contract.transfer(to, sendAmount);
    await tx.wait();
    showStatus(`Sent ${amount} ${token} successfully.`);
    displayWalletInfo();
  } catch (err) {
    showStatus(`Error: ${err.message}`, true);
  }
}

function showStatus(message, error = false) {
  const el = document.getElementById("sendStatus");
  el.textContent = message;
  el.style.color = error ? "red" : "limegreen";
}

async function getTransactionHistory() {
  const API_KEY = "G9H3FIK6M6EREF9DENVXG9EXHAVJJCXFM8";
  const res = await fetch(`https://api.bscscan.com/api?module=account&action=tokentx&address=${userAddress}&sort=desc&apikey=${API_KEY}`);
  const data = await res.json();
  const list = data.result.slice(0, 20);
  const history = document.getElementById("historyList");
  history.innerHTML = "";

  list.forEach(tx => {
    const type = tx.from.toLowerCase() === userAddress.toLowerCase() ? "Sent" : "Received";
    const amount = ethers.utils.formatUnits(tx.value, tx.tokenDecimal);
    const time = new Date(tx.timeStamp * 1000).toLocaleString();
    const li = document.createElement("li");
    li.innerHTML = `<strong>${type}</strong> ${amount} ${tx.tokenSymbol} — ${time} 
    <a href="https://bscscan.com/tx/${tx.hash}" target="_blank">[BscScan]</a>`;
    history.appendChild(li);
  });
}

function simulateSwap() {
  const fromToken = document.getElementById("swapFrom").value;
  const toToken = document.getElementById("swapTo").value;
  const amount = document.getElementById("swapAmount").value;

  const fee = amount * 0.05;
  const netAmount = amount - fee;

  document.getElementById("swapResult").innerText = 
    `Swapping ${amount} ${fromToken} to ${netAmount.toFixed(4)} ${toToken} (5% DRF fee applied)`;
}

window.addEventListener("load", init);
