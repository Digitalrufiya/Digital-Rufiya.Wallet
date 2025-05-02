const TOKENS = {
  DRF: {
    address: "0x7788a60dbC85AB46767F413EC7d51F149AA1bec6",
    symbol: "DRF",
    decimals: 18,
    image: "https://ik.imagekit.io/ttbbg9ocv/1000000655.jpg"
  },
  USDC: {
    address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
    symbol: "USDC",
    decimals: 18,
    image: ""
  },
  USDT: {
    address: "0x55d398326f99059ff775485246999027b3197955",
    symbol: "USDT",
    decimals: 18,
    image: ""
  }
};

const TOKEN_ABI = [
  "function balanceOf(address) view returns (uint256)",
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

    document.getElementById("walletAddress").innerText = userAddress;
    document.getElementById("walletDisplay").innerText = userAddress;
    document.getElementById("bscScanLink").href = `https://bscscan.com/address/${userAddress}`;
    document.getElementById("connectButton").innerText = "Connected";

    generateQRCode(userAddress);
    loadBalances();
    updateReceiveAmount();
  } catch (err) {
    alert("Wallet connection failed: " + err.message);
  }
}

async function loadBalances() {
  await loadTokenBalance(TOKENS.DRF, "drfBalance");
  await loadTokenBalance(TOKENS.USDC, "usdcBalance");
  await loadTokenBalance(TOKENS.USDT, "usdtBalance");
}

async function loadTokenBalance(token, elementId) {
  try {
    const contract = new ethers.Contract(token.address, TOKEN_ABI, provider);
    const balance = await contract.balanceOf(userAddress);
    const formatted = ethers.utils.formatUnits(balance, token.decimals);
    document.getElementById(elementId).innerText = parseFloat(formatted).toFixed(4);
  } catch {
    if (document.getElementById(elementId)) {
      document.getElementById(elementId).innerText = "0.0000";
    }
  }
}

function generateQRCode(address) {
  const qrContainer = document.getElementById("qrcode");
  if (!qrContainer) return;
  qrContainer.innerHTML = "";
  QRCode.toCanvas(address, { width: 180 }, (err, canvas) => {
    if (!err) qrContainer.appendChild(canvas);
  });
}

function copyAddressToClipboard() {
  if (!userAddress) return;
  navigator.clipboard.writeText(userAddress).then(() => {
    alert("Wallet address copied.");
  });
}

// Add token to MetaMask
const addToMetaMask = document.getElementById("addToMetaMask");
if (addToMetaMask) {
  addToMetaMask.addEventListener("click", async () => {
    const selected = document.getElementById("tokenSelect").value;
    const token = TOKENS[selected];
    try {
      await window.ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: token.address,
            symbol: token.symbol,
            decimals: token.decimals,
            image: token.image || ""
          }
        }
      });
    } catch (error) {
      alert("Failed to add token: " + error.message);
    }
  });
}

// Update receiving amount when token changes
const tokenSelect = document.getElementById("tokenSelect");
if (tokenSelect) {
  tokenSelect.addEventListener("change", () => {
    generateQRCode(userAddress);
    updateReceiveAmount();
  });
}

async function updateReceiveAmount() {
  const selected = document.getElementById("tokenSelect").value;
  const token = TOKENS[selected];
  const contract = new ethers.Contract(token.address, TOKEN_ABI, provider);
  const balance = await contract.balanceOf(userAddress);
  const formatted = ethers.utils.formatUnits(balance, token.decimals);
  document.getElementById("receiveAmount").innerText = `Receiving Amount: ${formatted}`;
}

// Auto-connect if already connected
window.addEventListener("load", () => {
  if (window.ethereum && window.ethereum.selectedAddress) {
    connectWallet();
  }
});

const connectBtn = document.getElementById("connectButton");
if (connectBtn) {
  connectBtn.addEventListener("click", connectWallet);
}
