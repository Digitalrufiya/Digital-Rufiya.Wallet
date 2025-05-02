const DRF_ADDRESS = "0x7788a60dbC85AB46767F413EC7d51F149AA1bec6";
const USDC_ADDRESS = "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d";
const USDT_ADDRESS = "0x55d398326f99059ff775485246999027b3197955";
const BSC_RPC = "https://bsc-dataseed.binance.org/";
const ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

let provider, signer, userAddress;

async function connectWallet() {
  if (typeof window.ethereum === "undefined") {
    notify("MetaMask not found. Install it to continue.");
    return;
  }

  try {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    userAddress = await signer.getAddress();

    document.getElementById("walletAddress").textContent = userAddress;
    document.getElementById("walletInfo").style.display = "block";
    document.getElementById("walletStatus").textContent = "Connected";
    document.getElementById("bscScanLink").href = `https://bscscan.com/address/${userAddress}`;
    
    notify("Wallet connected");
    loadBalances();
    updateReceiveSection();
  } catch (err) {
    console.error("Wallet connection failed", err);
    notify("Connection failed");
  }
}

async function loadBalances() {
  const tokens = [
    { name: "DRF", address: DRF_ADDRESS, elementId: "drfBalance" },
    { name: "USDC", address: USDC_ADDRESS, elementId: "usdcBalance" },
    { name: "USDT", address: USDT_ADDRESS, elementId: "usdtBalance" }
  ];

  for (const token of tokens) {
    try {
      const contract = new ethers.Contract(token.address, ABI, provider);
      const balance = await contract.balanceOf(userAddress);
      const decimals = await contract.decimals();
      const formatted = ethers.utils.formatUnits(balance, decimals);
      document.getElementById(token.elementId).textContent = `${formatted} ${token.name}`;
    } catch (err) {
      document.getElementById(token.elementId).textContent = "-";
    }
  }
}

function updateReceiveSection() {
  const tokenSelect = document.getElementById("tokenSelect");
  const contractLabel = document.getElementById("tokenContract");
  const qrDiv = document.getElementById("qrcode");
  const addBtn = document.getElementById("addToMetaMask");

  if (!tokenSelect || !contractLabel || !qrDiv || !addBtn) return;

  function update() {
    const selected = tokenSelect.value;
    let contract;
    switch (selected) {
      case "DRF":
        contract = DRF_ADDRESS;
        break;
      case "USDC":
        contract = USDC_ADDRESS;
        break;
      case "USDT":
        contract = USDT_ADDRESS;
        break;
    }

    contractLabel.textContent = contract;

    // QR
    qrDiv.innerHTML = "";
    new QRCode(qrDiv, {
      text: userAddress,
      width: 120,
      height: 120
    });

    // Add to MetaMask
    addBtn.onclick = async () => {
      try {
        await window.ethereum.request({
          method: "wallet_watchAsset",
          params: {
            type: "ERC20",
            options: {
              address: contract,
              symbol: selected,
              decimals: 18
            }
          }
        });
        notify(`${selected} added to MetaMask`);
      } catch {
        notify("Failed to add token");
      }
    };
  }

  tokenSelect.onchange = update;
  update();
}
