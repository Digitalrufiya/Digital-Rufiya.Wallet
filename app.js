const DRF_TOKEN = "0x7788a60dbC85AB46767F413EC7d51F149AA1bec6";
const USDC_TOKEN = "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d"; // BSC
const USDT_TOKEN = "0x55d398326f99059ff775485246999027b3197955"; // BSC
const FEE_WALLET = "0x88253D87990EdD1E647c3B6eD21F57fb061a3040";

const TOKEN_ABI = [
  "function balanceOf(address) view returns (uint)",
  "function transfer(address,uint) returns (bool)",
  "function decimals() view returns (uint8)"
];

let provider, signer, walletAddress;

window.addEventListener("DOMContentLoaded", async () => {
  if (window.ethereum) {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    walletAddress = await signer.getAddress();

    document.getElementById("walletAddress").textContent = walletAddress;
    document.getElementById("bscLink").href = `https://bscscan.com/address/${walletAddress}`;

    QRCode.toCanvas(document.getElementById("qrcode"), walletAddress, { width: 128 });

    loadBalances();
  } else {
    alert("Please install MetaMask.");
  }
});

async function loadBalances() {
  await loadTokenBalance(DRF_TOKEN, "drfBalance");
  await loadTokenBalance(USDC_TOKEN, "usdcBalance");
  await loadTokenBalance(USDT_TOKEN, "usdtBalance");
}

async function loadTokenBalance(tokenAddress, elementId) {
  const token = new ethers.Contract(tokenAddress, TOKEN_ABI, provider);
  const decimals = await token.decimals();
  const raw = await token.balanceOf(walletAddress);
  const balance = ethers.utils.formatUnits(raw, decimals);
  document.getElementById(elementId).textContent = parseFloat(balance).toFixed(4);
}

function copyAddress() {
  navigator.clipboard.writeText(walletAddress).then(() => {
    alert("Wallet address copied.");
  });
}
