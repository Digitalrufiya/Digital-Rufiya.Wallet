// === app.js ===
let userAddress = null;
const USDC_ADDRESS = "0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"; // USDC (mainnet example)
const RECEIVER_ADDRESS = "0x88253D87990EdD1E647c3B6eD21F57fb061a3040";

const connectButton = document.getElementById("connectWallet");
const donateButton = document.getElementById("donateNow");
const amountInput = document.getElementById("donationAmount");
const anonymousToggle = document.getElementById("anonymousToggle");
const referralDisplay = document.getElementById("referralCode");

window.onload = async () => {
  // Handle referral code from URL
  const urlParams = new URLSearchParams(window.location.search);
  const ref = urlParams.get("ref");
  if (ref) {
    referralDisplay.textContent = ref;
    referralDisplay.style.display = "block";
  }
};

async function connectWallet() {
  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      userAddress = accounts[0];
      connectButton.textContent = "Connected: " + userAddress.slice(0, 6) + "..." + userAddress.slice(-4);
    } catch (error) {
      alert("Connection rejected.");
    }
  } else {
    alert("Please install MetaMask to use this DApp.");
  }
}

async function donateUSDC() {
  if (!userAddress) {
    alert("Please connect your wallet first.");
    return;
  }

  const amount = parseFloat(amountInput.value);
  if (isNaN(amount) || amount <= 0) {
    alert("Enter a valid donation amount.");
    return;
  }

  const anonymous = anonymousToggle.checked;
  const referral = referralDisplay.textContent || "N/A";

  const usdcDecimals = 6;
  const amountInWei = BigInt(amount * 10 ** usdcDecimals);

  const usdcABI = [
    "function transfer(address recipient, uint256 amount) public returns (bool)",
    "function decimals() view returns (uint8)"
  ];
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const usdc = new ethers.Contract(USDC_ADDRESS, usdcABI, signer);

  try {
    const tx = await usdc.transfer(RECEIVER_ADDRESS, amountInWei);
    await tx.wait();
    alert("Donation successful. Generati
