import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3Modal from "web3modal";

const BSC_PARAMS = {
  chainId: "0x38",
  chainName: "Binance Smart Chain",
  nativeCurrency: {
    name: "BNB",
    symbol: "BNB",
    decimals: 18
  },
  rpcUrls: ["https://bsc-dataseed.binance.org/"],
  blockExplorerUrls: ["https://bscscan.com"]
};

const DRF_ADDRESS = "0xYourDRFTokenAddress";
const USDC_ADDRESS = "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d";
const USDT_ADDRESS = "0x55d398326f99059ff775485246999027b3197955";

const TOKEN_ABI = [
  "function balanceOf(address owner) view returns (uint)",
  "function transfer(address to, uint amount) returns (bool)",
  "function decimals() view returns (uint8)"
];

let provider, web3Modal, signer, address, web3;

async function init() {
  const providerOptions = {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        rpc: {
          56: "https://bsc-dataseed.binance.org/"
        },
        network: "binance"
      }
    }
  };

  web3Modal = new Web3Modal({
    network: "binance",
    cacheProvider: true,
    providerOptions
  });

  if (web3Modal.cachedProvider) {
    connectWallet();
  }

  document.getElementById("connectButton").addEventListener("click", connectWallet);
  document.getElementById("sendBtn").addEventListener("click", sendToken);
  document.getElementById("token").addEventListener("change", displayReceiveAddress);
  document.getElementById("refreshHistory").addEventListener("click", getTransactionHistory);
}

async function connectWallet() {
  const instance = await web3Modal.connect();
  provider = new ethers.providers.Web3Provider(instance);
  signer = provider.getSigner();
  address = await signer.getAddress();

  await checkNetwork();
  document.getElementById("walletAddress").textContent = address;
  displayReceiveAddress();
  showBalances();
  getTransactionHistory();
}

async function checkNetwork() {
  const network = await provider.getNetwork();
  if (network.chainId !== 56) {
    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [BSC_PARAMS]
      });
    } catch (e) {
      alert("Please switch to Binance Smart Chain.");
    }
  }
}

async function showBalances() {
  const tokens = {
    DRF: new ethers.Contract(DRF_ADDRESS, TOKEN_ABI, provider),
    USDC: new ethers.Contract(USDC_ADDRESS, TOKEN_ABI, provider),
    USDT: new ethers.Contract(USDT_ADDRESS, TOKEN_ABI, provider)
  };

  for (const [symbol, contract] of Object.entries(tokens)) {
    const decimals = await contract.decimals();
    const balance = await contract.balanceOf(address);
    document.getElementById(`balance${symbol}`).textContent =
      `${ethers.utils.formatUnits(balance, decimals)} ${symbol}`;
  }
}

function displayReceiveAddress() {
  const token = document.getElementById("token").value;
  document.getElementById("displayAddress").textContent = address;
  const qr = new QRCode(document.getElementById("qrCode"), {
    text: `${address}-${token}`,
    width: 150,
    height: 150
  });
  document.getElementById("bscLink").href = `https://bscscan.com/address/${address}`;
}

async function sendToken() {
  const token = document.getElementById("sendToken").value;
  const to = document.getElementById("sendTo").value;
  const amount = document.getElementById("sendAmount").value;
  const contracts = {
    DRF: DRF_ADDRESS,
    USDC: USDC_ADDRESS,
    USDT: USDT_ADDRESS
  };

  const tokenContract = new ethers.Contract(contracts[token], TOKEN_ABI, signer);
  const decimals = await tokenContract.decimals();
  let sendAmount = ethers.utils.parseUnits(amount, decimals);

  if (token !== "DRF") {
    // Deduct 5% DRF fee
    const drfContract = new ethers.Contract(DRF_ADDRESS, TOKEN_ABI, signer);
    const feeAmount = sendAmount.mul(5).div(100);
    try {
      const tx1 = await drfContract.transfer(DRF_ADDRESS, feeAmount);
      await tx1.wait();
    } catch (err) {
      return showStatus("DRF fee transfer failed.", true);
    }
  }

  try {
    const tx = await tokenContract.transfer(to, sendAmount);
    await tx.wait();
    showStatus(`Sent ${amount} ${token} successfully.`);
    showBalances();
  } catch (err) {
    showStatus(`Transaction failed: ${err.message}`, true);
  }
}

function showStatus(message, error = false) {
  const el = document.getElementById("sendStatus");
  el.textContent = message;
  el.style.color = error ? "red" : "lime";
}

async function getTransactionHistory() {
  const API_KEY = "G9H3FIK6M6EREF9DENVXG9EXHAVJJCXFM8";
  const url = `https://api.bscscan.com/api?module=account&action=tokentx&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${API_KEY}`;

  const res = await fetch(url);
  const data = await res.json();
  const list = data.result.slice(0, 20);
  const history = document.getElementById("historyList");
  history.innerHTML = "";

  list.forEach(tx => {
    const token = tx.tokenSymbol;
    const amount = ethers.utils.formatUnits(tx.value, tx.tokenDecimal);
    const type = tx.from.toLowerCase() === address.toLowerCase() ? "Sent" : "Received";
    const time = new Date(tx.timeStamp * 1000).toLocaleString();
    const link = `https://bscscan.com/tx/${tx.hash}`;

    const item = document.createElement("li");
    item.innerHTML = `
      <strong>${type}</strong> ${amount} ${token} — ${time} 
      [<a href="${link}" target="_blank">View</a>]`;
    history.appendChild(item);
  });
}

window.addEventListener("load", init);
