// app.js
let web3;
let web3Modal;
let provider;
let selectedAccount;

const DRF_TOKEN_ADDRESS = "0x7788a60dbC85AB46767F413EC7d51F149AA1bec6";
const DRF_TOKEN_ABI = [
  {"constant":true,"inputs":[{"name":"account","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"type":"function"},
  {"constant":false,"inputs":[{"name":"to","type":"address"},{"name":"value","type":"uint256"}],"name":"transfer","outputs":[],"type":"function"}
];

async function init() {
  const providerOptions = {
    walletconnect: {
      package: window.WalletConnectProvider.default,
      options: {
        rpc: {
          56: "https://bsc-dataseed.binance.org/"
        },
        chainId: 56
      }
    }
  };

  web3Modal = new window.Web3Modal.default({
    cacheProvider: false,
    providerOptions
  });

  document.getElementById("connectButton").addEventListener("click", connectWallet);
}

async function connectWallet() {
  provider = await web3Modal.connect();
  web3 = new Web3(provider);

  const accounts = await web3.eth.getAccounts();
  selectedAccount = accounts[0];
  document.getElementById("walletInfo").style.display = "block";
  document.getElementById("walletAddress").textContent = selectedAccount;

  await checkNetwork();
  await showBalances();
  await loadTxHistory();

  provider.on("accountsChanged", () => window.location.reload());
  provider.on("chainChanged", () => window.location.reload());
}

async function checkNetwork() {
  const chainId = await web3.eth.getChainId();
  if (chainId !== 56) {
    alert("Please connect to Binance Smart Chain Mainnet.");
  }
}

async function showBalances() {
  const bnb = await web3.eth.getBalance(selectedAccount);
  document.getElementById("bnbBalance").textContent = web3.utils.fromWei(bnb, 'ether');

  const drfContract = new web3.eth.Contract(DRF_TOKEN_ABI, DRF_TOKEN_ADDRESS);
  const drf = await drfContract.methods.balanceOf(selectedAccount).call();
  document.getElementById("drfBalance").textContent = web3.utils.fromWei(drf, 'ether');
}

async function sendTokens() {
  const to = document.getElementById("sendTo").value;
  const amount = web3.utils.toWei(document.getElementById("sendAmount").value, 'ether');
  const token = document.getElementById("sendToken").value;

  if (token === "BNB") {
    await web3.eth.sendTransaction({ from: selectedAccount, to, value: amount });
  } else {
    const contract = new web3.eth.Contract(DRF_TOKEN_ABI, DRF_TOKEN_ADDRESS);
    await contract.methods.transfer(to, amount).send({ from: selectedAccount });
  }
  alert("Transaction sent!");
}

async function addDRFToken() {
  try {
    await window.ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: DRF_TOKEN_ADDRESS,
          symbol: 'DRF',
          decimals: 18,
          image: 'https://digitalrufiya.github.io/Digital-Rufiya.Wallet/logo.png',
        },
      },
    });
  } catch (e) {
    console.error(e);
  }
}

async function loadTxHistory() {
  const API_KEY = "YourBscScanAPIKey"; // Replace this with your actual key
  const url = `https://api.bscscan.com/api?module=account&action=txlist&address=${selectedAccount}&sort=desc&apikey=${API_KEY}`;
  const res = await fetch(url);
  const data = await res.json();

  const txs = data.result.slice(0, 5);
  const container = document.getElementById("txHistory");
  container.innerHTML = "";

  txs.forEach(tx => {
    const el = document.createElement("div");
    el.innerHTML = `
      <p><a href="https://bscscan.com/tx/${tx.hash}" target="_blank">${tx.hash.slice(0, 15)}...</a> | ${web3.utils.fromWei(tx.value)} BNB</p>
    `;
    container.appendChild(el);
  });
}

init();
