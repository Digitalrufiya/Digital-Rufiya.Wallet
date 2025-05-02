// DRF Wallet Integration with DRF, USDC, USDT support

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
    document.getElementById("bscScanLink").href = `https://bscscan.com/address/${userAddress}`;
    document.getElementById("connectButton").innerText = "Connected";

    generateQRCode(userAddress);
    document.getElementById("displayAddress").innerText = userAddress;

    loadBalances();
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
  const contract = new ethers.Contract(token.address, TOKEN_ABI, provider);
  const balance = await contract.balanceOf(userAddress);
  const formatted = ethers.utils.formatUnits(balance, token.decimals);
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
    alert("Wallet address copied.");
  });
}

// Handle Token Selection
const tokenSelect = document.getElementById("tokenSelect");
const addToMetaMask = document.getElementById("addToMetaMask");
if (tokenSelect && addToMetaMask) {
  tokenSelect.addEventListener("change", () => {
    const selected = TOKENS[tokenSelect.value];
    document.getElementById("displayAddress").innerText = userAddress;
    generateQRCode(userAddress);
  });

  addToMetaMask.addEventListener("click", async () => {
    const selected = TOKENS[tokenSelect.value];
    try {
      await window.ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: selected.address,
            symbol: selected.symbol,
            decimals: selected.decimals,
            image: selected.image
          }
        }
      });
    } catch (error) {
      alert("MetaMask add token failed");
    }
  });
}

document.getElementById("connectButton").addEventListener("click", connectWallet);

if (window.ethereum && window.ethereum.selectedAddress) {
  connectWallet();
}
