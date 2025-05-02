<script src="https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.umd.min.js"></script>

// Minimal FIXED app.js – DRF Wallet (Safe Version)

const TOKENS = {
  DRF: {
    address: "0x7788a60dbC85AB46767F413EC7d51F149AA1bec6",
    symbol: "DRF",
    decimals: 18
  },
  USDC: {
    address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
    symbol: "USDC",
    decimals: 18
  },
  USDT: {
    address: "0x55d398326f99059ff775485246999027b3197955",
    symbol: "USDT",
    decimals: 18
  }
};

const TOKEN_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

let provider, signer, userAddress;

async function connectWallet() {
  if (!window.ethereum) {
    alert("Web3 wallet not detected. Please install MetaMask.");
    return;
  }

  try {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    userAddress = await signer.getAddress();

    document.getElementById("walletStatus").innerText = "Connected";
    document.getElementById("walletAddress").innerText = userAddress;
    document.getElementById("walletInfo").style.display = "block";
    document.getElementById("bscScanLink").href = `https://bscscan.com/address/${userAddress}`;

    generateQRCode(userAddress);
    loadAllBalances();
    updateTokenDetails();
  } catch (err) {
    console.error(err);
    alert("Wallet connection failed.");
  }
}

async function loadAllBalances() {
  for (let key in TOKENS) {
    const token = TOKENS[key];
    const balance = await getBalance(token.address, token.decimals);
    const el = document.getElementById(`${key.toLowerCase()}Balance`);
    if (el) el.innerText = parseFloat(balance).toFixed(4);
  }
}

async function getBalance(address, decimals) {
  const contract = new ethers.Contract(address, TOKEN_ABI, provider);
  const bal = await contract.balanceOf(userAddress);
  return ethers.utils.formatUnits(bal, decimals);
}

function generateQRCode(address) {
  const qr = document.getElementById("qrcode");
  if (!qr) return;
  qr.innerHTML = "";
  QRCode.toCanvas(address, { width: 180 }, (err, canvas) => {
    if (!err) qr.appendChild(canvas);
  });
}

function copyAddressToClipboard() {
  navigator.clipboard.writeText(userAddress).then(() => {
    alert("Address copied to clipboard!");
  });
}

function updateTokenDetails() {
  const select = document.getElementById("tokenSelect");
  const display = document.getElementById("tokenContract");
  const addBtn = document.getElementById("addToMetaMask");

  if (!select || !display || !addBtn) return;

  const token = TOKENS[select.value];
  display.innerText = `Token Contract: ${token.address}`;

  select.onchange = () => {
    const token = TOKENS[select.value];
    display.innerText = `Token Contract: ${token.address}`;
  };

  addBtn.onclick = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: token.address,
            symbol: token.symbol,
            decimals: token.decimals
          }
        }
      });
    } catch (e) {
      console.error("Add to MetaMask failed.", e);
    }
  };
}

document.getElementById("connectButton").addEventListener("click", connectWallet);

if (window.ethereum && window.ethereum.selectedAddress) {
  connectWallet();
} else {
  document.getElementById("walletStatus").innerText = "Not Connected";
}
  
