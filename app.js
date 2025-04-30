
let provider, signer, userAddress = "";

async function connectWallet() {
  if (typeof window.ethereum !== "undefined") {
    try {
      provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      signer = provider.getSigner();
      userAddress = await signer.getAddress();

      const addrEls = document.querySelectorAll(".walletAddress, #walletAddress, #receiveAddress");
      addrEls.forEach(el => el.textContent = userAddress);

      if (document.getElementById("qrReceive")) {
        generateQR(userAddress);
      }

      if (document.getElementById("drfBalance")) {
        getBalances();
      }
    } catch (err) {
      console.error("Connection failed:", err);
    }
  } else {
    alert("Please install a Web3 wallet like MetaMask.");
  }
}

async function getBalances() {
  try {
    const contracts = {
      drf: {
        address: "0x7788a60dbC85AB46767F413EC7d51F149AA1bec6",
        symbol: "drfBalance"
      },
      usdc: {
        address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
        symbol: "usdcBalance"
      },
      usdt: {
        address: "0x55d398326f99059ff775485246999027b3197955",
        symbol: "usdtBalance"
      }
    };

    for (let token in contracts) {
      const c = new ethers.Contract(
        contracts[token].address,
        ["function balanceOf(address) view returns (uint256)", "function decimals() view returns (uint8)"],
        provider
      );
      const [balance, decimals] = await Promise.all([c.balanceOf(userAddress), c.decimals()]);
      const element = document.getElementById(contracts[token].symbol);
      if (element) element.textContent = (Number(balance) / 10 ** decimals).toFixed(2);
    }
  } catch (err) {
    console.error("Balance fetch error:", err);
  }
}

function generateQR(address) {
  const qr = new QRCodeStyling({
    width: 200,
    height: 200,
    data: address,
    image: "https://ik.imagekit.io/ttbbg9ocv/1000000655.jpg",
    dotsOptions: { color: "#000", type: "rounded" },
    backgroundOptions: { color: "#ffffff" },
    imageOptions: { crossOrigin: "anonymous", margin: 10 }
  });

  const qrContainer = document.getElementById("qrReceive");
  if (qrContainer) {
    qrContainer.innerHTML = "";
    qr.append(qrContainer);
  }
}

function copyReceiveAddress() {
  const el = document.getElementById("receiveAddress");
  if (el) {
    navigator.clipboard.writeText(el.textContent).then(() => alert("Address copied!"));
  }
}

// Attach only if the button exists
window.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("connectWallet");
  if (btn) btn.addEventListener("click", connectWallet);
});
