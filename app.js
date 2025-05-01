// app.js – DRF Wallet Final Integrated Version

const DRF = {
  address: "0x7788a60dbC85AB46767F413EC7d51F149AA1bec6",
  symbol: "DRF"
};
const USDC = {
  address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
  symbol: "USDC"
};
const USDT = {
  address: "0x55d398326f99059ff775485246999027b3197955",
  symbol: "USDT"
};

const TOKEN_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

let provider, signer, userAddress;

async function connectWallet() {
  try {
    if (!window.ethereum) throw new Error("Web3 wallet not found.");

    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    userAddress = await signer.getAddress();

    document.getElementById("walletStatus").innerText = "Connected";
    document.getElementById("walletAddress").innerText = userAddress;
    document.getElementById("walletInfo").style.display = "block";
    document.getElementById("bscScanLink").href = `https://bscscan.com/address/${userAddress}`;

    generateQRCode(userAddress);
    loadBalances();
  } catch (err) {
    alert("Wallet connection failed: " + err.message);
  }
}

async function loadBalances() {
  await loadTokenBalance(DRF, "drfBalance");
  await loadTokenBalance(USDC, "usdcBalance");
  await loadTokenBalance(USDT, "usdtBalance");
}

async function loadTokenBalance(token, elementId) {
  const contract = new ethers.Contract(token.address, TOKEN_ABI, provider);
  const decimals = await contract.decimals();
  const balance = await contract.balanceOf(userAddress);
  const formatted = ethers.utils.formatUnits(balance, decimals);
  document.getElementById(elementId).innerText = parseFloat(formatted).toFixed(4);
}

function generateQRCode(address) {
  const qrContainer = document.getElementById("qrcode");
  qrContainer.innerHTML = "";
  QRCode.toCanvas(address, { width: 180 }, (err, canvas) => {
    if (!err) qrContainer.appendChild(canvas);
  });
}

function copyAddressToClipboard() {
  navigator.clipboard.writeText(userAddress).then(() => {
    alert("Wallet address copied to clipboard.");
  });
}

document.getElementById("connectButton").addEventListener("click", connectWallet);

// Auto-connect if permission already granted
if (window.ethereum && window.ethereum.selectedAddress) {
  connectWallet();
} else {
  document.getElementById("walletStatus").innerText = "Not Connected";
} 
