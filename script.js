const tokenContracts = {
  DRF: { address: '0x7788a60dbC85AB46767F413EC7d51F149AA1bec6', decimals: 18 },
  USDC: { address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d', decimals: 18 },
  USDT: { address: '0x55d398326f99059ff775485246999027b3197955', decimals: 18 }
};

let web3;
let account;

async function connectWallet() {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    account = (await web3.eth.getAccounts())[0];
    document.getElementById('walletAddress').innerText = account;
    document.getElementById('connectWallet').style.display = 'none';
    document.getElementById('disconnectWallet').style.display = 'inline-block';
    checkNetwork();
    loadBalances();
    loadTransactions();
  } else {
    alert('Please install MetaMask or any Web3 wallet.');
  }
}

function disconnectWallet() {
  account = null;
  document.getElementById('walletAddress').innerText = 'Not connected';
  document.getElementById('connectWallet').style.display = 'inline-block';
  document.getElementById('disconnectWallet').style.display = 'none';
}

async function checkNetwork() {
  const chainId = await web3.eth.getChainId();
  if (chainId !== 56) {
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x38',
          chainName: 'BSC Mainnet',
          nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
          rpcUrls: ['https://bsc-dataseed.binance.org/'],
          blockExplorerUrls: ['https://bscscan.com']
        }]
      });
    } catch (err) {
      alert('Switch to BSC network failed');
    }
  } else {
    document.getElementById('networkStatus').innerText = 'Network: BSC';
  }
}

async function loadBalances() {
  for (let token in tokenContracts) {
    const contract = new web3.eth.Contract([
      { constant: true, name: "balanceOf", type: "function", inputs: [{ name: "_owner", type: "address" }], outputs: [{ name: "balance", type: "uint256" }] }
    ], tokenContracts[token].address);
    const balance = await contract.methods.balanceOf(account).call();
    document.getElementById(token.toLowerCase() + 'Balance').innerText = (balance / 10 ** tokenContracts[token].decimals).toFixed(4);
  }
}

document.getElementById('connectWallet').onclick = connectWallet;
document.getElementById('disconnectWallet').onclick = disconnectWallet;

document.getElementById('receiveToken').onchange = updateQR;
function updateQR() {
  const token = document.getElementById('receiveToken').value;
  const text = `${account}\n${token}\n${tokenContracts[token].address}`;
  QRCode.toCanvas(document.getElementById('qrDisplay'), text);
  document.getElementById('displayedAddress').innerHTML = `
    <b>${account}</b> 
    <br><a href="https://bscscan.com/address/${account}" target="_blank">View on BscScan</a>
  `;
}

document.getElementById('sendButton').onclick = async function () {
  const token = document.getElementById('sendToken').value;
  const to = document.getElementById('sendTo').value;
  const amount = parseFloat(document.getElementById('sendAmount').value);
  const fee = amount * 0.05;
  const netAmount = amount - fee;

  const contract = new web3.eth.Contract([
    { constant: false, name: "transfer", type: "function", inputs: [{ name: "_to", type: "address" }, { name: "_value", type: "uint256" }], outputs: [{ name: "", type: "bool" }] }
  ], tokenContracts[token].address);

  const value = web3.utils.toBN(netAmount * 10 ** tokenContracts[token].decimals);
  const feeValue = web3.utils.toBN(fee * 10 ** tokenContracts[token].decimals);

  await contract.methods.transfer(to, value).send({ from: account });
  await contract.methods.transfer('0x7788a60dbC85AB46767F413EC7d51F149AA1bec6', feeValue).send({ from: account });

  alert('Transfer complete with 5% fee.');
  loadBalances();
  loadTransactions();
};

async function loadTransactions() {
  const response = await fetch(`https://api.bscscan.com/api?module=account&action=tokentx&address=${account}&page=1&offset=20&sort=desc&apikey=YourApiKeyToken`);
  const data = await response.json();
  const list = document.getElementById('transactionList');
  list.innerHTML = '';
  if (data.result) {
    data.result.forEach(tx => {
      const li = document.createElement('li');
      li.innerHTML = `
        <b>${tx.tokenSymbol}</b> - ${tx.value / 10 ** tx.tokenDecimal} ${tx.to.toLowerCase() === account.toLowerCase() ? 'received' : 'sent'}
        <br>${new Date(tx.timeStamp * 1000).toLocaleString()}
        <br><a href="https://bscscan.com/tx/${tx.hash}" target="_blank">View</a>
      `;
      list.appendChild(li);
    });
  }
}
