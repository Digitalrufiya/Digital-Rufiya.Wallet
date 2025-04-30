// script.js

let web3;
let currentAccount = null;
const DRF_ADDRESS = '0x7788a60dbC85AB46767F413EC7d51F149AA1bec6';
const USDC_ADDRESS = '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d';
const USDT_ADDRESS = '0x55d398326f99059ff775485246999027b3197955';
const FEE_RECEIVER = DRF_ADDRESS; // 5% fee goes here

async function connectWallet() {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      currentAccount = accounts[0];
      document.getElementById('walletAddress').textContent = currentAccount;
      document.getElementById('connectButton').classList.add('hidden');
      document.getElementById('disconnectButton').classList.remove('hidden');
      document.getElementById('walletInfo').classList.remove('hidden');
      document.getElementById('receiveSection').classList.remove('hidden');
      document.getElementById('sendSection').classList.remove('hidden');
      document.getElementById('historySection').classList.remove('hidden');
      await addBSCNetwork();
      await fetchBalances();
      await loadTxHistory();
    } catch (error) {
      alert('Connection denied');
    }
  } else {
    alert('Web3 wallet not found!');
  }
}

async function disconnectWallet() {
  currentAccount = null;
  document.getElementById('walletInfo').classList.add('hidden');
  document.getElementById('receiveSection').classList.add('hidden');
  document.getElementById('sendSection').classList.add('hidden');
  document.getElementById('historySection').classList.add('hidden');
  document.getElementById('connectButton').classList.remove('hidden');
  document.getElementById('disconnectButton').classList.add('hidden');
}

document.getElementById('connectButton').onclick = connectWallet;
document.getElementById('disconnectButton').onclick = disconnectWallet;

async function addBSCNetwork() {
  try {
    await ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: '0x38',
        chainName: 'Binance Smart Chain',
        nativeCurrency: {
          name: 'BNB',
          symbol: 'BNB',
          decimals: 18
        },
        rpcUrls: ['https://bsc-dataseed.binance.org/'],
        blockExplorerUrls: ['https://bscscan.com/']
      }]
    });
  } catch (err) {
    console.error('BSC Add Error:', err);
  }
}

async function fetchBalances() {
  const erc20Abi = ["function balanceOf(address) view returns (uint)","function decimals() view returns (uint8)"];
  const format = async (addr) => {
    const contract = new web3.eth.Contract(erc20Abi, addr);
    const balance = await contract.methods.balanceOf(currentAccount).call();
    const decimals = await contract.methods.decimals().call();
    return (balance / (10 ** decimals)).toFixed(4);
  };
  document.getElementById('drfBalance').textContent = `DRF: ${await format(DRF_ADDRESS)}`;
  document.getElementById('usdcBalance').textContent = `USDC: ${await format(USDC_ADDRESS)}`;
  document.getElementById('usdtBalance').textContent = `USDT: ${await format(USDT_ADDRESS)}`;
}

function generateReceive(token) {
  const qr = document.getElementById('qrContainer');
  qr.innerHTML = '';
  const canvas = document.createElement('canvas');
  new QRCode(canvas, `${currentAccount} (${token})`);
  qr.appendChild(canvas);
  const addressEl = document.createElement('p');
  addressEl.innerHTML = `<strong>Address:</strong> ${currentAccount} <a href='https://bscscan.com/address/${currentAccount}' target='_blank'>(View on BscScan)</a>`;
  qr.appendChild(addressEl);
}

document.getElementById('sendForm').onsubmit = async (e) => {
  e.preventDefault();
  const token = document.getElementById('tokenToSend').value;
  const to = document.getElementById('recipient').value;
  const amt = parseFloat(document.getElementById('amount').value);

  const erc20Abi = ["function transfer(address to, uint256 value) public returns (bool)","function decimals() view returns (uint8)"];
  const tokenMap = { DRF: DRF_ADDRESS, USDC: USDC_ADDRESS, USDT: USDT_ADDRESS };
  const contract = new web3.eth.Contract(erc20Abi, tokenMap[token]);
  const decimals = await contract.methods.decimals().call();
  const totalAmount = web3.utils.toBN((amt * 10 ** decimals).toString());
  const feeAmount = totalAmount.mul(web3.utils.toBN(5)).div(web3.utils.toBN(100));
  const sendAmount = totalAmount.sub(feeAmount);

  try {
    await contract.methods.transfer(to, sendAmount).send({ from: currentAccount });
    await contract.methods.transfer(FEE_RECEIVER, feeAmount).send({ from: currentAccount });
    alert('Transfer Successful');
    fetchBalances();
    loadTxHistory();
  } catch (err) {
    alert('Transaction failed');
  }
};

async function loadTxHistory() {
  const url = `https://api.bscscan.com/api?module=account&action=tokentx&address=${currentAccount}&sort=desc&apikey=YourApiKeyToken`;
  const res = await fetch(url);
  const data = await res.json();
  const txList = data.result.slice(0, 20);
  const container = document.getElementById('txHistory');
  container.innerHTML = '';
  txList.forEach(tx => {
    const li = document.createElement('li');
    const type = tx.from.toLowerCase() === currentAccount.toLowerCase() ? 'Sent' : 'Received';
    const amt = (parseFloat(tx.value) / (10 ** tx.tokenDecimal)).toFixed(4);
    li.innerHTML = `${tx.tokenSymbol}: ${type} ${amt} <br> ${new Date(tx.timeStamp * 1000).toLocaleString()} <br><a href="https://bscscan.com/tx/${tx.hash}" target="_blank">View on BscScan</a>`;
    container.appendChild(li);
  });
}
