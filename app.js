// app.js

const DRF_CONTRACT = '0x7788a60dbC85AB46767F413EC7d51F149AA1bec6';
const USDC_CONTRACT = '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d';
const USDT_CONTRACT = '0x55d398326f99059fF775485246999027B3197955';
const DRF_FEE_RECEIVER = '0x7788a60dbC85AB46767F413EC7d51F149AA1bec6';

let currentAccount;
const provider = window.ethereum;
let web3;

async function connectWallet() {
  if (provider) {
    try {
      await provider.request({ method: 'eth_requestAccounts' });
      web3 = new Web3(provider);
      const accounts = await web3.eth.getAccounts();
      currentAccount = accounts[0];
      document.getElementById('wallet-address').innerText = currentAccount;
      document.getElementById('connectWallet').classList.add('hidden');
      document.getElementById('disconnectWallet').classList.remove('hidden');
      generateQRs();
      showBalances();
      loadTransactions();
    } catch (err) {
      console.error(err);
    }
  } else {
    alert('Please install MetaMask or use a Web3 wallet.');
  }
}

function disconnectWallet() {
  currentAccount = null;
  document.getElementById('wallet-address').innerText = '';
  document.getElementById('connectWallet').classList.remove('hidden');
  document.getElementById('disconnectWallet').classList.add('hidden');
  clearQRs();
}

async function showBalances() {
  const drfContract = new web3.eth.Contract(ERC20_ABI, DRF_CONTRACT);
  const usdcContract = new web3.eth.Contract(ERC20_ABI, USDC_CONTRACT);
  const usdtContract = new web3.eth.Contract(ERC20_ABI, USDT_CONTRACT);
  
  const drfBal = await drfContract.methods.balanceOf(currentAccount).call();
  const usdcBal = await usdcContract.methods.balanceOf(currentAccount).call();
  const usdtBal = await usdtContract.methods.balanceOf(currentAccount).call();

  document.getElementById('drf-balance').innerText = web3.utils.fromWei(drfBal);
  document.getElementById('usdc-balance').innerText = web3.utils.fromWei(usdcBal);
  document.getElementById('usdt-balance').innerText = web3.utils.fromWei(usdtBal);
}

function generateQRs() {
  generateQR('drf-qr', currentAccount, 'DRF');
  generateQR('usdc-qr', currentAccount, 'USDC');
  generateQR('usdt-qr', currentAccount, 'USDT');
}

function clearQRs() {
  ['drf-qr', 'usdc-qr', 'usdt-qr'].forEach(id => {
    document.getElementById(id).innerHTML = '';
  });
}

function generateQR(id, address, token) {
  const qr = new QRCode(document.getElementById(id), {
    text: `${address}\n${token}`,
    width: 128,
    height: 128,
  });
}

async function loadTransactions() {
  const res = await fetch(`https://api.bscscan.com/api?module=account&action=tokentx&address=${currentAccount}&page=1&offset=20&sort=desc&apikey=YourApiKey`);
  const data = await res.json();
  const list = document.getElementById('transactionList');
  list.innerHTML = '';

  data.result.forEach(tx => {
    const direction = tx.to.toLowerCase() === currentAccount.toLowerCase() ? 'Received' : 'Sent';
    const row = document.createElement('div');
    row.innerHTML = `${tx.tokenSymbol}: ${direction} ${web3.utils.fromWei(tx.value)} on ${new Date(tx.timeStamp * 1000).toLocaleString()} [<a href='https://bscscan.com/tx/${tx.hash}' target='_blank'>View</a>]`;
    list.appendChild(row);
  });
}

// Add send/swap preview modal
function openFeeModal() {
  document.getElementById('feeModal').classList.remove('hidden');
}

function closeFeeModal() {
  document.getElementById('feeModal').classList.add('hidden');
}

const ERC20_ABI = [
  { "constant": true, "inputs": [{"name": "_owner", "type": "address"}], "name": "balanceOf", "outputs": [{"name": "balance", "type": "uint256"}], "type": "function" },
  { "constant": false, "inputs": [
    { "name": "_to", "type": "address" },
    { "name": "_value", "type": "uint256" }
  ], "name": "transfer", "outputs": [{"name": "success", "type": "bool"}], "type": "function" }
];

document.getElementById('connectWallet').onclick = connectWallet;
document.getElementById('disconnectWallet').onclick = disconnectWallet;
document.getElementById('sendFeeBtn').onclick = openFeeModal;
document.getElementById('closeFeeModal').onclick = closeFeeModal;

window.onload = async () => {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    const accounts = await web3.eth.getAccounts();
    if (accounts.length > 0) {
      currentAccount = accounts[0];
      document.getElementById('wallet-address').innerText = currentAccount;
      generateQRs();
      showBalances();
      loadTransactions();
      document.getElementById('connectWallet').classList.add('hidden');
      document.getElementById('disconnectWallet').classList.remove('hidden');
    }
  }
};
