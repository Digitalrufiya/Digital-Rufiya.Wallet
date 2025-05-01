// app.js - Final Version for DRF Wallet

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

const FEE_RECEIVER = "0x88253D87990EdD1E647c3B6eD21F57fb061a3040";

const TOKEN_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint amount) returns (bool)",
  "function decimals() view returns (uint8)"
];

let provider, signer, userAddress;

async function initWallet() {
  if (!window.ethereum) {
    alert("Please install MetaMask or a Web3 wallet.");
    return;
  }
  provider = new ethers.providers.Web3Provider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  signer = provider.getSigner();
  userAddress = await signer.getAddress();
  console.log("Connected address:", userAddress);
  document.getElementById("walletAddress").innerText = userAddress;
  loadAllBalances();
}

async function loadAllBalances() {
  await loadBalance(DRF);
  await loadBalance(USDC);
  await loadBalance(USDT);
}

async function loadBalance(token) {
  const contract = new ethers.Contract(token.address, TOKEN_ABI, provider);
  const decimals = await contract.decimals();
  const balance = await contract.balanceOf(userAddress);
  const adjusted = ethers.utils.formatUnits(balance, decimals);
  const element = document.getElementById(`${token.symbol.toLowerCase()}Balance`);
  if (element) element.innerText = parseFloat(adjusted).toFixed(4);
}

async function sendTokenWithFee(token, recipient, amountRaw) {
  const contract = new ethers.Contract(token.address, TOKEN_ABI, signer);
  const decimals = await contract.decimals();
  const amount = ethers.utils.parseUnits(amountRaw, decimals);
  const fee = amount.mul(5).div(100);
  const toSend = amount.sub(fee);

  const tx1 = await contract.transfer(recipient, toSend);
  const tx2 = await contract.transfer(FEE_RECEIVER, fee);
  return { tx1, tx2 };
}

function copyAddressToClipboard() {
  if (!userAddress) return;
  navigator.clipboard.writeText(userAddress).then(() => {
    alert("Wallet address copied to clipboard.");
  });
}

window.addEventListener("load", () => {
  if (document.getElementById("walletAddress")) {
    initWallet();
  }
});
