let provider;
let signer;
let userAddress;

const DRF_TOKEN_ADDRESS = "0x7788a60dbC85AB46767F413EC7d51F149AA1bec6"; // ✅ Your DRF Token
const USDC_TOKEN_ADDRESS = "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d"; // ✅ USDC on BSC
const USDT_TOKEN_ADDRESS = "0x55d398326f99059ff775485246999027b3197955"; // ✅ USDT on BSC

const tokenABI = [
  "function balanceOf(address) view returns (uint)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

// Connect wallet and load balances
async function connectWallet() {
  try {
    if (!window.ethereum) throw new Error("Web3 wallet not found.");
    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    userAddress = await signer.getAddress();

    console.log("User Address:", userAddress);  // Debugging the wallet address

    if (!userAddress) {
      alert("Failed to fetch wallet address.");
      return;
    }

    // Display user address in UI
    document.getElementById("walletAddress").innerText = userAddress;
    document.getElementById("walletDisplay").innerText = userAddress;
    document.getElementById("bscScanLink").href = `https://bscscan.com/address/${userAddress}`;
    document.getElementById("connectButton").innerText = "Connected";

    tokenSelect.value = "DRF";
    generateQRCode(userAddress);
    updateReceiveAmount();
    await loadBalances();
    await loadTransactionHistory();
  } catch (error) {
    console.error("Error connecting wallet:", error);
    alert("Failed to connect wallet.");
  }
}

// Load token balances
async function loadBalances() {
  if (!provider || !userAddress) return;

  try {
    const bnbBalance = await provider.getBalance(userAddress);
    document.getElementById("bnbBalance").innerText = ethers.utils.formatEther(bnbBalance);

    const drfBalance = await getTokenBalance(DRF_TOKEN_ADDRESS);
    console.log("DRF Balance:", drfBalance);  // Debugging DRF balance
    document.getElementById("drfBalance").innerText = drfBalance;

    const usdcBalance = await getTokenBalance(USDC_TOKEN_ADDRESS);
    console.log("USDC Balance:", usdcBalance);  // Debugging USDC balance
    document.getElementById("usdcBalance").innerText = usdcBalance;

    const usdtBalance = await getTokenBalance(USDT_TOKEN_ADDRESS);
    console.log("USDT Balance:", usdtBalance);  // Debugging USDT balance
    document.getElementById("usdtBalance").innerText = usdtBalance;
  } catch (error) {
    console.error("Error loading balances:", error);
  }
}

// Get balance of a specific token
async function getTokenBalance(tokenAddress) {
  if (!userAddress) {
    console.log("No user address to fetch token balance.");
    return "0.00";  // Return 0 if no user address
  }

  try {
    const contract = new ethers.Contract(tokenAddress, tokenABI, provider);
    console.log(`Fetching balance for contract: ${tokenAddress}`); // Debugging token contract address
    const balance = await contract.balanceOf(userAddress);
    console.log(`Raw balance for ${tokenAddress}:`, balance.toString());  // Debugging raw balance

    const decimals = await contract.decimals();
    console.log(`Decimals for ${tokenAddress}:`, decimals); // Debugging decimals for token

    const formattedBalance = (balance / Math.pow(10, decimals)).toFixed(2);
    return formattedBalance;
  } catch (error) {
    console.error(`Error fetching token balance: ${tokenAddress}`, error);
    return "0.00";  // Return 0 on error
  }
}

// Generate QR code for receiving tokens
function generateQRCode(address) {
  const qr = new QRCode(document.getElementById("qrcode"), {
    text: address,
    width: 128,
    height: 128,
  });
}

// Update receive amount display
function updateReceiveAmount() {
  const amount = document.getElementById("amountInput").value;
  const selectedToken = document.getElementById("tokenSelect").value;
  document.getElementById("receiveAmountDisplay").innerText = `${amount} ${selectedToken}`;
}

// Load recent token transactions using BscScan API
async function loadTransactionHistory() {
  if (!userAddress) return;

  const apiKey = "G9H3FIK6M6EREF9DENVXG9EXHAVJJCXFM8"; // ✅ Your BscScan API Key
  const url = `https://api.bscscan.com/api?module=account&action=tokentx&address=${userAddress}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    const tbody = document.getElementById("txnTableBody");
    if (data.status !== "1") {
      tbody.innerHTML = "<tr><td colspan='5'>No transactions found</td></tr>";
      return;
    }

    const txns = data.result;
    tbody.innerHTML = "";

    txns.forEach(tx => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td><a href="https://bscscan.com/tx/${tx.hash}" target="_blank">${tx.hash.slice(0, 10)}...</a></td>
        <td>${tx.method || "-"}</td>
        <td>${(tx.value / Math.pow(10, tx.tokenDecimal)).toFixed(2)}</td>
        <td>${tx.tokenSymbol}</td>
        <td>${new Date(tx.timeStamp * 1000).toLocaleString()}</td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error("Failed to fetch transactions", err);
  }
}

// Event listeners
document.getElementById("connectButton").addEventListener("click", connectWallet);
document.getElementById("amountInput").addEventListener("input", updateReceiveAmount);
document.getElementById("tokenSelect").addEventListener("change", updateReceiveAmount);
