// app.js - DRFChain Donation & Token Sale Logic

// === CONFIGURATION ===
const usdcTokenAddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; // USDC Token (Example: Ethereum Mainnet)
const drfTokenAddress = "0x...DRF_TOKEN"; // Your DRF token address
const donationReceiver = "0x88253D87990EdD1E647c3B6eD21F57fb061a3040"; // DRF Charity USDC Receiver
const drfRewardRate = 100; // 1 USDC = 100 DRF (example)

// === INIT ===
window.addEventListener("load", async () => {
  if (typeof window.ethereum !== "undefined") {
    await connectWallet();
  }
});

let userWallet = null;

async function connectWallet() {
  try {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    userWallet = accounts[0];
    document.getElementById("walletAddress").textContent = userWallet;
  } catch (err) {
    alert("Wallet connection failed: " + err.message);
  }
}

async function donate() {
  const amount = parseFloat(document.getElementById("donationAmount").value);
  const referral = document.getElementById("referralCode").value || null;
  const isAnonymous = document.getElementById("anonymousToggle").checked;

  if (!userWallet || isNaN(amount) || amount <= 0) {
    return alert("Please enter a valid donation amount and connect your wallet.");
  }

  const amountInWei = BigInt(amount * 10 ** 6).toString();
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const usdcContract = new ethers.Contract(usdcTokenAddress, [
    "function transfer(address to, uint256 value) public returns (bool)",
    "function approve(address spender, uint256 value) public returns (bool)"
  ], signer);

  try {
    // Approve transfer to charity
    const approvalTx = await usdcContract.approve(donationReceiver, amountInWei);
    await approvalTx.wait();

    // Now transfer (if needed depending on contract logic)
    const transferTx = await usdcContract.transfer(donationReceiver, amountInWei);
    await transferTx.wait();

    // Reward DRF tokens (this is theoretical - your backend or contract handles this)
    const drfTokens = amount * drfRewardRate;
    displayReceipt(amount, drfTokens, referral, isAnonymous);
    alert("Donation successful! DRF reward: " + drfTokens);
  } catch (err) {
    console.error(err);
    alert("Donation failed: " + err.message);
  }
}

function displayReceipt(usdcAmount, drfAmount, referral, isAnonymous) {
  const receiptDiv = document.getElementById("receiptContent");
  const date = new Date().toLocaleString();
  const wallet = isAnonymous ? "Anonymous" : userWallet;

  receiptDiv.innerHTML = `
    <h3>Donation Receipt</h3>
    <p><strong>Date:</strong> ${date}</p>
    <p><strong>From:</strong> ${wallet}</p>
    <p><strong>Amount Donated:</strong> ${usdcAmount} USDC</p>
    <p><strong>DRF Tokens Rewarded:</strong> ${drfAmount}</p>
    ${referral ? `<p><strong>Referral:</strong> ${referral}</p>` : ""}
    <button onclick="window.print()">Download / Print Receipt</button>
  `;

  document.getElementById("receiptModal").style.display = "block";
}

function closeReceiptModal() {
  document.getElementById("receiptModal").style.display = "none";
}

// Optional: Referral link generator
function generateReferralLink() {
  const baseUrl = window.location.href.split('?')[0];
  const refLink = `${baseUrl}?ref=${userWallet}`;
  navigator.clipboard.writeText(refLink);
  alert("Referral link copied to clipboard:")
}

// Load referral from URL if exists
window.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const ref = urlParams.get("ref");
  if (ref) document.getElementById("referralCode").value = ref;
});
