// App.js

let provider;
let signer;
let userAddress = "";
let bscTokens = {
  DRF: "0x7788a60dbC85AB46767F413EC7d51F149AA1bec6", // Digital Rufiya Token
  BNB: "0x0000000000000000000000000000000000000000", // Native BNB
  USDT: "0x55d398326f99059fF775485246999027B3197955", 
  USDC: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
  WBNB: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
  BUSD: "0xe9e7cea3dedca5984780bafc599bd69add087d56"
};

const tokenABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function transfer(address to, uint amount) returns (bool)"
];

// Spinner Control
function showSpinner() {
  document.getElementById('spinner').style.display = 'block';
}

function hideSpinner() {
  document.getElementById('spinner').style.display = 'none';
}

// Connect Wallet
async function connectWallet() {
  if (typeof window.ethereum === 'undefined') {
    alert('MetaMask is not installed!');
    return;
  }

  try {
    showSpinner();
    provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send('eth_requestAccounts', []);
    signer = await provider.getSigner();
    userAddress = accounts[0];
    document.getElementById('walletAddress').innerText = userAddress;
    hideSpinner();
    await fetchBalances();
  } catch (error) {
    console.error(error);
    alert('Connection failed.');
    hideSpinner();
  }
}

// Fetch Balances
async function fetchBalances() {
  const balanceContainer = document.getElementById('balanceList');
  balanceContainer.innerHTML = '';

  for (const [symbol, address] of Object.entries(bscTokens)) {
    try {
      let balance;
      if (address === "0x0000000000000000000000000000000000000000") {
        balance = await provider.getBalance(userAddress);
        balance = ethers.formatEther(balance);
      } else {
        const tokenContract = new ethers.Contract(address, tokenABI, provider);
        const rawBalance = await tokenContract.balanceOf(userAddress);
        const decimals = await tokenContract.decimals();
        balance = ethers.formatUnits(rawBalance, decimals);
      }
      const p = document.createElement('p');
      p.textContent = `${symbol}: ${parseFloat(balance).toFixed(4)}`;
      balanceContainer.appendChild(p);
    } catch (error) {
      console.error(`Error fetching ${symbol} balance`, error);
    }
  }
}

// Send Token
async function sendToken() {
  const to = prompt('Enter recipient address:');
  const tokenSymbol = prompt('Enter token symbol to send (e.g., DRF, BNB, USDT):').toUpperCase();
  const amount = prompt('Enter amount to send:');

  if (!bscTokens[tokenSymbol]) {
    alert('Token not supported!');
    return;
  }

  const address = bscTokens[tokenSymbol];

  try {
    showSpinner();
    if (tokenSymbol === "BNB") {
      const value = ethers.parseEther(amount);
      const fee = value * 0.05n / 100n;
      const netValue = value - fee;
      const tx = await signer.sendTransaction({ to, value: netValue });
      await tx.wait();
    } else {
      const tokenContract = new ethers.Contract(address, tokenABI, signer);
      const decimals = await tokenContract.decimals();
      const value = ethers.parseUnits(amount, decimals);
      const fee = value * 5n / 100n;
      const netValue = value - fee;
      const tx = await tokenContract.transfer(to, netValue);
      await tx.wait();
    }
    hideSpinner();
    alert('Transaction successful!');
    fetchBalances();
  } catch (error) {
    console.error(error);
    hideSpinner();
    alert('Transaction failed.');
  }
}

// Exchange (Swap) Tokens (simple simulation)
async function swapTokens() {
  const fromToken = prompt('From Token (e.g., DRF, USDT):').toUpperCase();
  const toToken = prompt('To Token (e.g., USDT, BNB):').toUpperCase();
  const amount = prompt('Amount to swap:');

  if (!bscTokens[fromToken] || !bscTokens[toToken]) {
    alert('Invalid token symbols!');
    return;
  }

  if (fromToken === toToken) {
    alert('Cannot swap the same token!');
    return;
  }

  try {
    showSpinner();
    const tokenContract = new ethers.Contract(bscTokens[fromToken], tokenABI, signer);
    const decimals = await tokenContract.decimals();
    const value = ethers.parseUnits(amount, decimals);
    const fee = value * 5n / 100n;
    const netValue = value - fee;

    const tx = await tokenContract.transfer(bscTokens[toToken], netValue);
    await tx.wait();
    hideSpinner();
    alert('Swap simulated successfully!');
    fetchBalances();
  } catch (error) {
    console.error(error);
    hideSpinner();
    alert('Swap failed.');
  }
}
