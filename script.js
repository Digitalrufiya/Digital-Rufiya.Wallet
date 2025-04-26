const saleContractAddress = "0x82dAa32579728EDAd1b940Ad26f9336845C8A3c7";  // Your Token Sale Contract
const usdcTokenAddress = "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d";   // BSC USDC

let provider, signer, saleContract, usdcContract;

const saleEndTime = new Date("2025-12-31T23:59:59Z"); // SET your sale end time here!

const saleABI = [
  // Minimal ABI
  "function buy(uint256 amount) public",
  "function tokensBought(address buyer) public view returns (uint256)"
];

const usdcABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)"
];

document.getElementById("connectButton").onclick = connectWallet;
document.getElementById("approveButton").onclick = approveUSDC;
document.getElementById("buyButton").onclick = buyTokens;

async function connectWallet() {
  if (window.ethereum) {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    saleContract = new ethers.Contract(saleContractAddress, saleABI, signer);
    usdcContract = new ethers.Contract(usdcTokenAddress, usdcABI, signer);
    document.getElementById("connectButton").style.display = "none";
    document.getElementById("saleInfo").style.display = "block";
    updateUSDCBalance();
    startCountdown();
  } else {
    alert("MetaMask not found!");
  }
}

async function updateUSDCBalance() {
  const address = await signer.getAddress();
  const balance = await usdcContract.balanceOf(address);
  document.getElementById("usdcBalance").innerText = ethers.utils.formatUnits(balance, 18);
}

async function approveUSDC() {
  const amount = document.getElementById("buyAmount").value;
  if (amount <= 0) {
    alert("Enter a valid amount!");
    return;
  }
  const usdcAmount = ethers.utils.parseUnits(amount, 18);
  try {
    const tx = await usdcContract.approve(saleContractAddress, usdcAmount);
    await tx.wait();
    document.getElementById("status").innerText = "Approval successful!";
  } catch (error) {
    console.error(error);
    document.getElementById("status").innerText = "Approval failed!";
  }
}

async function buyTokens() {
  const amount = document.getElementById("buyAmount").value;
  if (amount <= 0) {
    alert("Enter a valid amount!");
    return;
  }
  const usdcAmount = ethers.utils.parseUnits(amount, 18);
  try {
    const tx = await saleContract.buy(usdcAmount);
    await tx.wait();
    document.getElementById("status").innerText = "Purchase successful!";
    updateUSDCBalance();
  } catch (error) {
    console.error(error);
    document.getElementById("status").innerText = "Purchase failed!";
  }
}

function startCountdown() {
  const countdownElement = document.getElementById("countdown");
  setInterval(() => {
    const now = new Date();
    const distance = saleEndTime - now;
    if (distance < 0) {
      countdownElement.innerText = "Sale Ended";
      return;
    }
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    countdownElement.innerText = `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }, 1000);
}
