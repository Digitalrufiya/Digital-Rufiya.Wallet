
let web3;
let account;
const drfAddress = "0x7788a60dbC85AB46767F413EC7d51F149AA1bec6";
const feeReceiver = "0x88253D87990EdD1E647c3B6eD21F57fb061a3040";
const tokenAddresses = {
  DRF: drfAddress,
  USDC: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
  USDT: "0x55d398326f99059fF775485246999027B3197955",
  BNB: "BNB",
  WBNB: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
};
const abi = [{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":
[{"name":"balance","type":"uint256"}],"type":"function"},
{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer",
"outputs":[{"name":"","type":"bool"}],"type":"function"}];

async function connectWallet() {
  const providerOptions = {
    walletconnect: {
      package: window.WalletConnectProvider.default,
      options: {
        rpc: { 56: "https://bsc-dataseed.binance.org/" },
        chainId: 56
      }
    }
  };
  const web3Modal = new window.Web3Modal.default({
    cacheProvider: false,
    providerOptions
  });
  const provider = await web3Modal.connect();
  web3 = new Web3(provider);
  const accounts = await web3.eth.getAccounts();
  account = accounts[0];
  document.getElementById("walletInfo").style.display = "block";
  document.getElementById("connectButton").style.display = "none";
  document.getElementById("disconnectButton").style.display = "inline-block";
  document.getElementById("walletAddress").textContent = account;
  document.getElementById("bscScanLink").href = `https://bscscan.com/address/${account}`;
  QRCode.toCanvas(document.getElementById("qrcode"), account);
  loadBalances();
}

async function loadBalances() {
  let html = "";
  for (let token in tokenAddresses) {
    let balance;
    if (token === "BNB") {
      balance = await web3.eth.getBalance(account);
      balance = web3.utils.fromWei(balance);
    } else {
      const contract = new web3.eth.Contract(abi, tokenAddresses[token]);
      balance = await contract.methods.balanceOf(account).call();
      balance = web3.utils.fromWei(balance);
    }
    html += `<p>${token}: ${parseFloat(balance).toFixed(4)}</p>`;
  }
  document.getElementById("balances").innerHTML = html;
}

function copyDepositAddress() {
  navigator.clipboard.writeText(account);
  alert("Wallet address copied!");
}

async function sendWithFee() {
  const to = document.getElementById("recipient").value;
  const amt = document.getElementById("amount").value;
  const token = document.getElementById("tokenSelect").value;
  const amount = web3.utils.toWei(amt);
  const fee = web3.utils.toBN(amount).div(web3.utils.toBN(20));
  const net = web3.utils.toBN(amount).sub(fee);

  if (token === "BNB") {
    await web3.eth.sendTransaction({ from: account, to: to, value: net });
    await web3.eth.sendTransaction({ from: account, to: feeReceiver, value: fee });
  } else {
    const contract = new web3.eth.Contract(abi, tokenAddresses[token]);
    await contract.methods.transfer(to, net.toString()).send({ from: account });
    await contract.methods.transfer(feeReceiver, fee.toString()).send({ from: account });
  }
  alert("Sent with 5% fee.");
  loadBalances();
}

function swapDRF() {
  const amount = document.getElementById("swapAmount").value;
  const target = document.getElementById("swapTarget").value;
  alert(`This will swap ${amount} DRF to ${target} with 5% fee.
Manual or contract-based swapping required.`);
}

document.getElementById("connectButton").addEventListener("click", connectWallet);
document.getElementById("disconnectButton").addEventListener("click", () => location.reload());
