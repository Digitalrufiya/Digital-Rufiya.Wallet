const drfAddress = "0x7788a60dbC85AB46767F413EC7d51F149AA1bec6";
const usdcAddress = "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d";
const usdtAddress = "0x55d398326f99059ff775485246999027b3197955";
const drfFeeReceiver = "0x7788a60dbC85AB46767F413EC7d51F149AA1bec6";

let web3;
let selectedAccount;

async function connectWallet() {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    await window.ethereum.request({ method: "eth_requestAccounts" });
    selectedAccount = (await web3.eth.getAccounts())[0];
    showWalletInfo();
    getBalances();
    updateQR("DRF");
    getTxHistory();
    document.getElementById("connectBtn").style.display = "none";
    document.getElementById("disconnectBtn").style.display = "inline-block";
  } else {
    alert("Please install MetaMask or Web3 Wallet");
  }
}

function disconnectWallet() {
  selectedAccount = null;
  document.getElementById("walletInfo").classList.add("hidden");
  document.getElementById("connectBtn").style.display = "inline-block";
  document.getElementById("disconnectBtn").style.display = "none";
}

function showWalletInfo() {
  document.getElementById("walletInfo").classList.remove("hidden");
  document.getElementById("walletAddress").textContent = selectedAccount;
  document.getElementById("bscScanLink").href = `https://bscscan.com/address/${selectedAccount}`;
  document.getElementById("qrWalletAddress").textContent = selectedAccount;
}

async function getBalances() {
  const abi = [{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"type":"function"}];
  const drf = new web3.eth.Contract(abi, drfAddress);
  const usdc = new web3.eth.Contract(abi, usdcAddress);
  const usdt = new web3.eth.Contract(abi, usdtAddress);
  const [drfBal, usdcBal, usdtBal] = await Promise.all([
    drf.methods.balanceOf(selectedAccount).call(),
    usdc.methods.balanceOf(selectedAccount).call(),
    usdt.methods.balanceOf(selectedAccount).call()
  ]);
  document.getElementById("drfBalance").textContent = web3.utils.fromWei(drfBal);
  document.getElementById("usdcBalance").textContent = web3.utils.fromWei(usdcBal);
  document.getElementById("usdtBalance").textContent = web3.utils.fromWei(usdtBal);
}

document.getElementById("connectBtn").addEventListener("click", connectWallet);
document.getElementById("disconnectBtn").addEventListener("click", disconnectWallet);
document.getElementById("copyAddress").addEventListener("click", () => {
  navigator.clipboard.writeText(selectedAccount);
  alert("Address copied!");
});

document.getElementById("tokenSelector").addEventListener("change", (e) => updateQR(e.target.value));

function updateQR(token) {
  const canvas = document.getElementById("qrCanvas");
  const text = `${token}:${selectedAccount}`;
  const qr = new QRCodeStyling({
    width: 200,
    height: 200,
    data: text,
    dotsOptions: { color: "#000", type: "rounded" },
    backgroundOptions: { color: "#fff" }
  });
  qr.append(canvas);
  document.getElementById("qrWalletAddress").textContent = selectedAccount;
}

document.getElementById("sendBtn").addEventListener("click", async () => {
  const recipient = document.getElementById("recipient").value;
  const token = document.getElementById("sendToken").value;
  const amount = document.getElementById("amount").value;
  const tokenAddress = token === "DRF" ? drfAddress : token === "USDC" ? usdcAddress : usdtAddress;
  const contract = new web3.eth.Contract(
    [{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"type":"function"}],
    tokenAddress
  );

  const feeAmount = (parseFloat(amount) * 0.05).toFixed(18);
  const sendAmount = (parseFloat(amount) - parseFloat(feeAmount)).toFixed(18);

  const feeTx = await contract.methods.transfer(drfFeeReceiver, web3.utils.toWei(feeAmount)).send({ from: selectedAccount });
  const userTx = await contract.methods.transfer(recipient, web3.utils.toWei(sendAmount)).send({ from: selectedAccount });
  alert(`Sent ${sendAmount} ${token} to ${recipient} with 5% fee`);
});

async function getTxHistory() {
  const apiKey = "Your_BSCSCAN_API_KEY";
  const url = `https://api.bscscan.com/api?module=account&action=tokentx&address=${selectedAccount}&page=1&offset=20&sort=desc&apikey=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();
  const txList = document.getElementById("txHistory");
  txList.innerHTML = "";
  data.result.forEach(tx => {
    const li = document.createElement("li");
    li.innerHTML = `${tx.tokenSymbol}: ${tx.from.toLowerCase() === selectedAccount.toLowerCase() ? "Sent" : "Received"} ${web3.utils.fromWei(tx.value)} on ${new Date(tx.timeStamp * 1000).toLocaleString()} - <a href="https://bscscan.com/tx/${tx.hash}" target="_blank">View</a>`;
    txList.appendChild(li);
  });
}
