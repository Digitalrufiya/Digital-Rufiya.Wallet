// script.js - Fully Updated for DRF Wallet

let selectedAccount;
const web3Modal = new window.Web3Modal.default({
  cacheProvider: true,
  providerOptions: {}
});

let web3, provider;
const DRF_CONTRACT = "0x7788a60dbC85AB46767F413EC7d51F149AA1bec6";
const USDC_CONTRACT = "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d";
const USDT_CONTRACT = "0x55d398326f99059ff775485246999027b3197955";
const DRF_WALLET = "0x7788a60dbC85AB46767F413EC7d51F149AA1bec6"; // Fee collector

const tokenABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint amount) returns (bool)",
  "function decimals() view returns (uint8)"
];

async function connectWallet() {
  try {
    provider = await web3Modal.connect();
    web3 = new ethers.providers.Web3Provider(provider);
    const accounts = await web3.send("eth_requestAccounts", []);
    selectedAccount = accounts[0];
    document.getElementById("walletAddress").textContent = selectedAccount;
    document.getElementById("bscScanLink").href = `https://bscscan.com/address/${selectedAccount}`;
    loadBalances();
    loadTxHistory();
  } catch (err) {
    console.error("Wallet connection failed", err);
  }
}

async function loadBalances() {
  const signer = web3.getSigner();
  const tokens = [
    { name: "DRF", address: DRF_CONTRACT },
    { name: "USDC", address: USDC_CONTRACT },
    { name: "USDT", address: USDT_CONTRACT }
  ];
  for (let token of tokens) {
    const contract = new ethers.Contract(token.address, tokenABI, signer);
    const rawBalance = await contract.balanceOf(selectedAccount);
    const decimals = await contract.decimals();
    const balance = ethers.utils.formatUnits(rawBalance, decimals);
    document.getElementById(`${token.name.toLowerCase()}Balance`).textContent = balance;
  }
}

function generateQR(token) {
  const qrDiv = document.getElementById("qrCode");
  qrDiv.innerHTML = "";
  new QRCode(qrDiv, `${selectedAccount} - ${token}`);
  document.getElementById("walletAddressText").textContent = selectedAccount;
}

async function sendToken(tokenName) {
  const recipient = document.getElementById(`${tokenName}Recipient`).value;
  const amount = document.getElementById(`${tokenName}Amount`).value;
  const tokenMap = {
    DRF: DRF_CONTRACT,
    USDC: USDC_CONTRACT,
    USDT: USDT_CONTRACT
  };
  const signer = web3.getSigner();
  const token = new ethers.Contract(tokenMap[tokenName], tokenABI, signer);
  const decimals = await token.decimals();
  const amountInWei = ethers.utils.parseUnits(amount, decimals);
  const fee = amountInWei.mul(5).div(100);
  const toSend = amountInWei.sub(fee);

  try {
    await token.transfer(recipient, toSend);
    if (tokenName !== "DRF") await token.transfer(DRF_WALLET, fee);
    alert("Transaction sent successfully!");
    loadBalances();
    loadTxHistory();
  } catch (e) {
    console.error("Send failed", e);
    alert("Transaction failed");
  }
}

function swapTokens() {
  alert("Swap UI only: DRF 5% fee simulated. No real swap processed.");
}

async function loadTxHistory() {
  const apiKey = "YourBscScanAPIKey";
  const url = `https://api.bscscan.com/api?module=account&action=tokentx&address=${selectedAccount}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();
  const table = document.getElementById("txTable");
  table.innerHTML = "";
  const rows = data.result.slice(0, 20).map(tx => {
    const type = tx.from.toLowerCase() === selectedAccount.toLowerCase() ? "Sent" : "Received";
    const date = new Date(tx.timeStamp * 1000).toLocaleString();
    return `<tr><td>${tx.tokenSymbol}</td><td>${type}</td><td>${ethers.utils.formatUnits(tx.value, tx.tokenDecimal)}</td><td>${date}</td><td><a href='https://bscscan.com/tx/${tx.hash}' target='_blank'>View</a></td></tr>`;
  }).join("");
  table.innerHTML = rows;
}

document.getElementById("connectBtn").addEventListener("click", connectWallet);
