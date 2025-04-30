import Web3Modal from "https://cdn.jsdelivr.net/npm/web3modal";
import WalletConnectProvider from "https://cdn.jsdelivr.net/npm/@walletconnect/web3-provider";

let web3, provider, account;
const DRF_CONTRACT = "0xYourDRFTokenAddress";
const USDC_CONTRACT = "0xYourUSDCAddress";
const USDT_CONTRACT = "0xYourUSDTAddress";
const DRF_FEE_RECEIVER = "0xYourDRFFeeReceiverAddress";

// ERC20 ABI (simplified)
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 value) returns (bool)",
  "function decimals() view returns (uint8)"
];

const web3Modal = new Web3Modal({
  cacheProvider: true,
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        rpc: {
          56: "https://bsc-dataseed.binance.org/"
        },
        network: "binance"
      }
    }
  }
});

document.getElementById("connectButton").onclick = async () => {
  provider = await web3Modal.connect();
  web3 = new ethers.providers.Web3Provider(provider);
  const network = await web3.getNetwork();

  if (network.chainId !== 56) {
    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x38" }]
      });
    } catch (err) {
      alert("Switch to Binance Smart Chain failed.");
      return;
    }
  }

  const signer = web3.getSigner();
  account = await signer.getAddress();

  document.getElementById("connectButton").textContent = account.slice(0, 6) + "..." + account.slice(-4);

  loadBalances();
  loadQRs();
  loadHistory();
};

async function loadBalances() {
  const signer = web3.getSigner();

  const drf = new ethers.Contract(DRF_CONTRACT, ERC20_ABI, signer);
  const usdc = new ethers.Contract(USDC_CONTRACT, ERC20_ABI, signer);
  const usdt = new ethers.Contract(USDT_CONTRACT, ERC20_ABI, signer);

  const [drfBal, usdcBal, usdtBal] = await Promise.all([
    drf.balanceOf(account),
    usdc.balanceOf(account),
    usdt.balanceOf(account)
  ]);

  document.getElementById("drf-balance").textContent = ethers.utils.formatUnits(drfBal, 18);
  document.getElementById("usdc-balance").textContent = ethers.utils.formatUnits(usdcBal, 18);
  document.getElementById("usdt-balance").textContent = ethers.utils.formatUnits(usdtBal, 18);
}

function loadQRs() {
  ["DRF", "USDC", "USDT"].forEach(token => {
    const el = document.getElementById(`qr-${token.toLowerCase()}`);
    el.innerHTML = "";
    new QRCode(el, {
      text: JSON.stringify({ address: account, token }),
      width: 128,
      height: 128
    });

    document.getElementById(`addr-${token.toLowerCase()}`).textContent = account;
    document.getElementById(`copy-${token.toLowerCase()}`).onclick = () => {
      navigator.clipboard.writeText(account);
      alert("Address copied!");
    };
    document.getElementById(`bscscan-${token.toLowerCase()}`).href = `https://bscscan.com/address/${account}`;
  });
}

async function sendToken(tokenAddress, amount) {
  const signer = web3.getSigner();
  const token = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
  const decimals = await token.decimals();

  const amt = ethers.utils.parseUnits(amount, decimals);
  const fee = amt.mul(5).div(100);
  const finalAmt = amt.sub(fee);

  const recipient = prompt("Enter recipient address:");
  if (!recipient) return;

  await token.transfer(recipient, finalAmt);
  await token.transfer(DRF_FEE_RECEIVER, fee);
  alert("Sent with 5% DRF fee.");
  loadBalances();
}

document.getElementById("send-drf").onclick = () => sendToken(DRF_CONTRACT, prompt("Amount of DRF to send:"));
document.getElementById("send-usdc").onclick = () => sendToken(USDC_CONTRACT, prompt("Amount of USDC to send:"));
document.getElementById("send-usdt").onclick = () => sendToken(USDT_CONTRACT, prompt("Amount of USDT to send:"));

async function loadHistory() {
  const url = `https://api.bscscan.com/api?module=account&action=tokentx&address=${account}&startblock=0&endblock=99999999&page=1&offset=20&sort=desc&apikey=YourBscScanAPIKey`;

  const res = await fetch(url);
  const data = await res.json();

  if (!data.result) return;

  const table = document.getElementById("history-table");
  table.innerHTML = `
    <tr>
      <th>Token</th>
      <th>Type</th>
      <th>Amount</th>
      <th>Time</th>
      <th>Link</th>
    </tr>
  `;

  data.result.forEach(tx => {
    const type = tx.from.toLowerCase() === account.toLowerCase() ? "Sent" : "Received";
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${tx.tokenSymbol}</td>
      <td>${type}</td>
      <td>${ethers.utils.formatUnits(tx.value, tx.tokenDecimal)}</td>
      <td>${new Date(tx.timeStamp * 1000).toLocaleString()}</td>
      <td><a href="https://bscscan.com/tx/${tx.hash}" target="_blank">View</a></td>
    `;
    table.appendChild(row);
  });
}
