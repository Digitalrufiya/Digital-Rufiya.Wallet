// app.js

let web3;
let provider;
let selectedAccount;
let qrCode;
const DRF_CONTRACT = "0x7788a60dbC85AB46767F413EC7d51F149AA1bec6";
const DRF_ABI = [
  { "constant": true, "inputs": [{ "name": "owner", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "balance", "type": "uint256" }], "type": "function" }
];

const web3Modal = new Web3Modal.default({
  cacheProvider: true
});

async function connectWallet() {
  provider = await web3Modal.connect();
  web3 = new Web3(provider);

  const accounts = await web3.eth.getAccounts();
  selectedAccount = accounts[0];
  document.getElementById("userAddress").textContent = selectedAccount;

  provider.on("accountsChanged", connectWallet);

  await switchToBSC();
  showDisconnectButton();
  await loadBalances();
  generateQRCode(selectedAccount);
  trackGas();
}

function showDisconnectButton() {
  document.getElementById("connectButton").style.display = "none";
  document.getElementById("disconnectButton").style.display = "inline-block";
}

function disconnectWallet() {
  web3Modal.clearCachedProvider();
  window.location.reload();
}

async function switchToBSC() {
  const bscParams = {
    chainId: "0x38",
    chainName: "BSC Mainnet",
    nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
    rpcUrls: ["https://bsc-dataseed.binance.org/"],
    blockExplorerUrls: ["https://bscscan.com"]
  };
  try {
    await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: "0x38" }] });
  } catch (err) {
    if (err.code === 4902) {
      await window.ethereum.request({ method: "wallet_addEthereumChain", params: [bscParams] });
    }
  }
}

async function loadBalances() {
  const bnb = await web3.eth.getBalance(selectedAccount);
  document.getElementById("bnbBalance").textContent = web3.utils.fromWei(bnb, "ether");

  const drf = new web3.eth.Contract(DRF_ABI, DRF_CONTRACT);
  const drfBal = await drf.methods.balanceOf(selectedAccount).call();
  document.getElementById("drfBalance").textContent = web3.utils.fromWei(drfBal, "ether");
}

async function trackGas() {
  const price = await web3.eth.getGasPrice();
  document.getElementById("gasPrice").textContent = web3.utils.fromWei(price, 'gwei') + " Gwei";
}

function generateQRCode(address) {
  qrCode = new QRCodeStyling({
    width: 200,
    height: 200,
    data: address,
    image: "https://ik.imagekit.io/ttbbg9ocv/1000000655.jpg",
    dotsOptions: { color: "#000", type: "rounded" },
    backgroundOptions: { color: "#fff" }
  });
  qrCode.append(document.getElementById("qrCode"));
}

function downloadQRCode() {
  qrCode.download({ name: "drf-wallet", extension: "png" });
}

function handleSwap() {
  const amount = document.getElementById("swapAmount").value;
  const direction = document.getElementById("swapDirection").value;
  alert("Swap initiated (UI only): " + direction + " - Amount: " + amount);
  // Swap contract integration goes here
}

function downloadCSV() {
  const txList = document.getElementById("txList").innerText.split("\n");
  const blob = new Blob(["Transactions\n" + txList.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "transactions.csv";
  a.click();
}

document.getElementById("connectButton").onclick = connectWallet;
document.getElementById("disconnectButton").onclick = disconnectWallet;

if (web3Modal.cachedProvider) connectWallet();
