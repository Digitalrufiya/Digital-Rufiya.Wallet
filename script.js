let provider;
let signer;
let userAddress;

const DRF_TOKEN_ADDRESS = "0x7788a60dbC85AB46767F413EC7d51F149AA1bec6";
const DRF_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

const connectButton = document.getElementById("connectButton");
const disconnectButton = document.getElementById("disconnectButton");

connectButton.onclick = async () => {
  if (window.ethereum) {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();
      userAddress = await signer.getAddress();
      document.getElementById("userAddress").textContent = userAddress;
      connectButton.style.display = "none";
      disconnectButton.style.display = "inline-block";
      await switchToBSC();
      getBalances();
    } catch (err) {
      alert("Connection failed: " + err.message);
    }
  } else {
    alert("Please install a Web3 wallet like MetaMask or Trust Wallet");
  }
};

disconnectButton.onclick = () => {
  provider = null;
  signer = null;
  userAddress = null;
  document.getElementById("userAddress").textContent = "Not connected";
  document.getElementById("bnbBalance").textContent = "-";
  document.getElementById("drfBalance").textContent = "-";
  document.getElementById("gasPrice").textContent = "-";
  connectButton.style.display = "inline-block";
  disconnectButton.style.display = "none";
};

async function switchToBSC() {
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x38" }]
    });
  } catch (switchError) {
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: "0x38",
          chainName: "Binance Smart Chain",
          nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
          rpcUrls: ["https://bsc-dataseed.binance.org/"],
          blockExplorerUrls: ["https://bscscan.com"]
        }]
      });
    }
  }
}

async function getBalances() {
  if (!signer || !userAddress) return;
  const bnbBalance = await provider.getBalance(userAddress);
  document.getElementById("bnbBalance").textContent = ethers.utils.formatEther(bnbBalance);

  const token = new ethers.Contract(DRF_TOKEN_ADDRESS, DRF_ABI, provider);
  const decimals = await token.decimals();
  const balance = await token.balanceOf(userAddress);
  document.getElementById("drfBalance").textContent = (balance / 10 ** decimals).toFixed(4);

  const gas = await provider.getGasPrice();
  document.getElementById("gasPrice").textContent = `${ethers.utils.formatUnits(gas, "gwei")} Gwei`;
}

function downloadQR() {
  const address = userAddress || "Wallet not connected";
  const canvas = document.createElement("canvas");
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${address}&size=200x200`;
  const link = document.createElement("a");
  link.href = qrCodeUrl;
  link.download = "drf_wallet_qr.png";
  link.click();
}

function swapUI() {
  const amount = document.getElementById("swapAmount").value;
  const type = document.getElementById("swapType").value;
  alert(`Swap simulation: ${amount} ${type === "bnbToDrf" ? "BNB → DRF" : "DRF → BNB"}`);
}
