// app.js

// === Configuration ===
let provider;
let signer;
let userAddress;

// Trimmed, correct token addresses
const DRF_TOKEN_ADDRESS  = "0x7788a60dbC85AB46767F413EC7d51F149AA1bec6";
const USDC_TOKEN_ADDRESS = "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d";
const USDT_TOKEN_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";

const tokenABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

// === Connect wallet & initialize UI ===
async function connectWallet() {
  try {
    if (!window.ethereum) throw new Error("Web3 wallet not found.");
    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    userAddress = await signer.getAddress();

    console.log("User Address:", userAddress);

    // Update UI elements
    document.getElementById("walletAddress").innerText = userAddress;
    document.getElementById("bscScanLink").href = `https://bscscan.com/address/${userAddress}`;
    document.getElementById("connectButton").innerText = "Connected";

    // Default token selection
    document.getElementById("tokenSelect").value = "DRF";
    generateQRCode(userAddress);
    updateReceiveAmount();
    await loadBalances();
    await loadTransactionHistory();

  } catch (error) {
    console.error("Error connecting wallet:", error);
    alert(error.message || "Failed to connect wallet.");
  }
}

// === Load all balances ===
async function loadBalances() {
  if (!provider || !userAddress) return;

  try {
    // BNB Balance
    const bnbBal = await provider.getBalance(userAddress);
    document.getElementById("bnbBalance").innerText = ethers.utils.formatEther(bnbBal);

    // DRF Balance
    const drfBal = await getTokenBalance(DRF_TOKEN_ADDRESS);
    document.getElementById("drfBalance").innerText = drfBal;

    // USDC Balance
    const usdcBal = await getTokenBalance(USDC_TOKEN_ADDRESS);
    document.getElementById("usdcBalance").innerText = usdcBal;

    // USDT Balance
    const usdtBal = await getTokenBalance(USDT_TOKEN_ADDRESS);
    document.getElementById("usdtBalance").innerText = usdtBal;

  } catch (error) {
    console.error("Error loading balances:", error);
  }
}

// === Fetch a single token balance ===
async function getTokenBalance(tokenAddress) {
  if (!provider || !userAddress) return "0.00";

  try {
    const contract = new ethers.Contract(tokenAddress, tokenABI, provider);
    const raw = await contract.balanceOf(userAddress);
    const decimals = await contract.decimals();
    const value = raw.div(ethers.BigNumber.from(10).pow(decimals)).toString();
    return parseFloat(value).toFixed(2);
  } catch (error) {
    console.error(`Error fetching balance for ${tokenAddress}:`, error);
    return "0.00";
  }
}

// === Generate QR Code ===
function generateQRCode(address) {
  const container = document.getElementById("qrcode");
  container.innerHTML = ""; // clear any existing
  new QRCode(container, {
    text: address,
    width: 128,
    height: 128
  });
}

// === Update displayed receive amount ===
function updateReceiveAmount() {
  const amount = document.getElementById("amountInput").value || "0";
  const token = document.getElementById("tokenSelect").value;
  document.getElementById("receiveAmountDisplay").innerText = `${amount} ${token}`;
}

// === Load recent token transactions via BscScan ===
async function loadTransactionHistory() {
  if (!userAddress) return;

  const apiKey = "G9H3FIK6M6EREF9DENVXG9EXHAVJJCXFM8";
  const url = `https://api.bscscan.com/api?module=account&action=tokentx&address=${userAddress}`
            + `&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=${apiKey}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const tbody = document.getElementById("txnTableBody");
    tbody.innerHTML = "";

    if (data.status !== "1" || !data.result.length) {
      tbody.innerHTML = "<tr><td colspan='5'>No transactions found</td></tr>";
      return;
    }

    data.result.forEach(tx => {
      const amount = (tx.value / Math.pow(10, tx.tokenDecimal)).toFixed(2);
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><a href="https://bscscan.com/tx/${tx.hash}" target="_blank">
          ${tx.hash.slice(0,10)}...
        </a></td>
        <td>${tx.tokenSymbol}</td>
        <td>${amount}</td>
        <td>${tx.from.toLowerCase() === userAddress.toLowerCase() ? "Sent" : "Received"}</td>
        <td>${new Date(tx.timeStamp*1000).toLocaleString()}</td>
      `;
      tbody.appendChild(row);
    });

  } catch (err) {
    console.error("Failed to fetch transactions:", err);
  }
}

// === Event Listeners ===
document.getElementById("connectButton").addEventListener("click", connectWallet);
document.getElementById("tokenSelect").addEventListener("change", updateReceiveAmount);
document.getElementById("amountInput").addEventListener("input", updateReceiveAmount);
