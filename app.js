
// Safe Ethers.js-based Wallet Connect + DRF Logic
let provider, signer, userAddress = "";

async function connectWallet() {
  if (typeof window.ethereum === "undefined") {
    alert("MetaMask or compatible Web3 wallet not found.");
    return;
  }

  try {
    provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    userAddress = await signer.getAddress();
    window.userAddress = userAddress;

    const addrEls = document.querySelectorAll("#walletAddress, #receiveAddress");
    addrEls.forEach(el => el.textContent = userAddress);

    if (document.getElementById("receiveQR")) {
      generateQR(userAddress);
    }

    if (document.getElementById("drfBalance")) {
      showDRFBalance();
    }
  } catch (err) {
    console.error("connectWallet error:", err);
  }
}

async function showDRFBalance() {
  const tokenAddress = "0x7788a60dbC85AB46767F413EC7d51F149AA1bec6";
  const abi = [
    "function balanceOf(address) view returns (uint256)",
    "function decimals() view returns (uint8)"
  ];

  try {
    const token = new ethers.Contract(tokenAddress, abi, provider);
    const [raw, dec] = await Promise.all([
      token.balanceOf(userAddress),
      token.decimals()
    ]);
    const balance = ethers.utils.formatUnits(raw, dec);
    document.getElementById("drfBalance").textContent = parseFloat(balance).toFixed(2);
  } catch (e) {
    console.error("Balance error:", e);
  }
}

function generateQR(address) {
  const qrImg = document.getElementById("receiveQR");
  if (qrImg) {
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?data=${address}&size=180x180`;
  }
}

function copyReceiveAddress() {
  const el = document.getElementById("receiveAddress");
  if (el && navigator.clipboard) {
    navigator.clipboard.writeText(el.textContent).then(() =>
      alert("Address copied!")
    );
  }
}

window.addEventListener("DOMContentLoaded", () => {
  if (window.ethereum && window.ethereum.selectedAddress) {
    connectWallet();
  }

  const btn = document.getElementById("connectWalletBtn");
  if (btn) btn.addEventListener("click", connectWallet);
});
