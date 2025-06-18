// DRF Charity Donation Logic - app.js

const USDC_ADDRESS = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; // Mainnet USDC (example, update if needed)
const DRF_REWARD_RATIO = 1; // 1 DRF per 1 USDC (you can change this)
const DRF_TOKEN_ADDRESS = "0x..."; // Your DRF token address
const DONATION_RECEIVER = "0x88253D87990EdD1E647c3B6eD21F57fb061a3040"; // DRFChain.org Charity Wallet

let connectedAccount = null;

window.addEventListener("load", async () => {
  if (window.ethereum) {
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    connectedAccount = accounts[0];
    document.getElementById("userWallet").textContent = shortenAddress(connectedAccount);
  }
});

document.getElementById("donateBtn").addEventListener("click", async () => {
  const usdcAmount = parseFloat(document.getElementById("donationAmount").value);
  const isAnonymous = document.getElementById("anonymousToggle").checked;
  const ref = new URLSearchParams(window.location.search).get("ref") || "none";

  if (!connectedAccount || isNaN(usdcAmount) || usdcAmount <= 0) {
    alert("Please enter a valid amount and connect wallet");
    return;
  }

  const amountInWei = BigInt(usdcAmount * 1e6).toString();
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const usdc = new ethers.Contract(USDC_ADDRESS, ["function transfer(address to, uint256 amount) public returns (bool)"], signer);

  try {
    const tx = await usdc.transfer(DONATION_RECEIVER, amountInWei);
    await tx.wait();
    
    showReceipt(usdcAmount, connectedAccount, ref, isAnonymous);
    alert("Donation successful! May Allah reward you.");

    if (!isAnonymous) {
      // Optional: Send referral or donor record to your backend or Google Apps Script
    }

    // Trigger reward token (simulate logic here or call backend to airdrop)
    console.log(`Reward: ${usdcAmount * DRF_REWARD_RATIO} DRF for ${connectedAccount}`);

  } catch (err) {
    console.error(err);
    alert("Transaction failed. Please try again.");
  }
});

function showReceipt(amount, wallet, ref, isAnon) {
  const now = new Date().toLocaleString();
  const receiptHTML = `
    <div id="receiptContent" style="background:#fff; padding:20px; font-family:sans-serif;">
      <h2>DRF Charity Donation Receipt</h2>
      <p><strong>Amount:</strong> ${amount} USDC</p>
      <p><strong>Donor Wallet:</strong> ${isAnon ? "Anonymous" : wallet}</p>
      <p><strong>Referral:</strong> ${ref}</p>
      <p><strong>Date:</strong> ${now}</p>
      <p>May Allah reward you for supporting the orphans and needy.</p>
    </div>`;

  const receiptWindow = window.open("", "PrintReceipt", "width=600,height=600");
  receiptWindow.document.write(receiptHTML);
  receiptWindow.document.close();
  receiptWindow.print();
}

function shortenAddress(addr) {
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}
