// ====== app.js ======

// List of tokens you want to show
const tokenList = [
  { name: 'DRF', address: '0x7788a60dbC85AB46767F413EC7d51F149AA1bec6', decimals: 18 },
  { name: 'BNB', address: null, decimals: 18 },
  { name: 'USDT', address: '0x55d398326f99059fF775485246999027B3197955', decimals: 18 },
  { name: 'USDC', address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d', decimals: 18 },
  { name: 'WBNB', address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', decimals: 18 },
  { name: 'BUSD', address: '0xe9e7cea3dedca5984780bafc599bd69add087d56', decimals: 18 }
];

let currentAccount = null;

async function connectWallet() {
  if (typeof window.ethereum !== 'undefined') {
    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      currentAccount = accounts[0];
      document.getElementById('walletAddress').innerText = currentAccount;
      document.getElementById('status').innerText = "Connected";

      loadBalances();
    } catch (error) {
      console.error(error);
      alert("Wallet connection failed!");
    }
  } else {
    alert('MetaMask is not installed!');
  }
}

async function disconnectWallet() {
  currentAccount = null;
  document.getElementById('walletAddress').innerText = '';
  document.getElementById('status').innerText = 'Not Connected';
  document.getElementById('balances').innerHTML = '';
}

async function loadBalances() {
  const balancesList = document.getElementById('balances');
  balancesList.innerHTML = '';

  for (const token of tokenList) {
    let balance = 0;

    if (token.address) {
      const abi = [
        "function balanceOf(address owner) view returns (uint256)"
      ];
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(token.address, abi, provider);
      const rawBalance = await contract.balanceOf(currentAccount);
      balance = parseFloat(ethers.utils.formatUnits(rawBalance, token.decimals)).toFixed(4);
    } else {
      // Native BNB
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const rawBalance = await provider.getBalance(currentAccount);
      balance = parseFloat(ethers.utils.formatEther(rawBalance)).toFixed(4);
    }

    const li = document.createElement('li');
    li.textContent = `${token.name}: ${balance}`;
    balancesList.appendChild(li);
  }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('connectWalletBtn').addEventListener('click', connectWallet);
  document.getElementById('disconnectWalletBtn').addEventListener('click', disconnectWallet);
});
