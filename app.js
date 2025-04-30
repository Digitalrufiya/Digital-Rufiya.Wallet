const BSC_RPC = "https://bsc-dataseed.binance.org/";
const web3 = new Web3(BSC_RPC);
let userWallet = null;

document.getElementById("connectWallet").onclick = async () => {
  if (window.ethereum) {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    userWallet = window.ethereum.selectedAddress;
    document.getElementById("walletAddress").textContent = userWallet;
    document.getElementById("disconnectWallet").style.display = "inline-block";
    getBalances();
    renderQRCode();
    getTransactions();
  } else {
    alert("Web3 wallet not found.");
  }
};

document.getElementById("disconnectWallet").onclick = () => {
  userWallet = null;
  document.getElementById("walletAddress").textContent = "Disconnected";
  document.getElementById("disconnectWallet").style.display = "none";
};

async function getBalances() {
  const balanceWei = await web3.eth.getBalance(userWallet);
  const balance = web3.utils.fromWei(balanceWei, "ether");
  document.getElementById("drfBalance").textContent = parseFloat(balance).toFixed(4);
  // Simulate token balances for demo
  document.getElementById("usdcBalance").textContent = "120.50";
  document.getElementById("usdtBalance").textContent = "85.33";
}

function renderQRCode() {
  const qrCode = new QRCodeStyling({
    width: 200,
    height: 200,
    data: userWallet,
    dotsOptions: { color: "#000", type: "rounded" },
    backgroundOptions: { color: "#fff" }
  });
  document.getElementById("qrCode").innerHTML = "";
  qrCode.append(document.getElementById("qrCode"));
  document.getElementById("qrWalletAddress").textContent = userWallet;
}

async function getTransactions() {
  const response = await fetch(`https://api.bscscan.com/api?module=account&action=txlist&address=${userWallet}&startblock=0&endblock=99999999&sort=desc&apikey=YourApiKey`);
  const data = await response.json();
  const txList = document.getElementById("transactionList");
  txList.innerHTML = "";
  const txs = data.result.slice(0, 20);
  txs.forEach(tx => {
    const li = document.createElement("li");
    li.innerHTML = `Token: BNB | ${tx.value / 1e18} | ${new Date(tx.timeStamp * 1000).toLocaleString()} | <a href="https://bscscan.com/tx/${tx.hash}" target="_blank">View</a>`;
    txList.appendChild(li);
  });
}

document.getElementById("sendTokenBtn").onclick = () => {
  alert("Sending not enabled in demo version.");
};
