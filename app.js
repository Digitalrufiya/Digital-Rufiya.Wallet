// app.js

const tokenList = {
  DRF: {
    address: '0x7788a60dbC85AB46767F413EC7d51F149AA1bec6',
    symbol: 'DRF',
    decimals: 18,
  },
  BNB: {
    address: null, // Native token
    symbol: 'BNB',
    decimals: 18,
  },
  USDT: {
    address: '0x55d398326f99059fF775485246999027B3197955',
    symbol: 'USDT',
    decimals: 18,
  },
  USDC: {
    address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
    symbol: 'USDC',
    decimals: 18,
  },
  WBNB: {
    address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    symbol: 'WBNB',
    decimals: 18,
  },
  BUSD: {
    address: '0xe9e7cea3dedca5984780bafc599bd69add087d56',
    symbol: 'BUSD',
    decimals: 18,
  }
};

let provider;
let signer;
let userAddress;

async function connectWallet() {
  if (window.ethereum) {
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    userAddress = await signer.getAddress();
    document.getElementById('walletAddress').innerText = userAddress;
    document.getElementById('walletSection').style.display = 'block';
    loadBalances();
  } else {
    alert("Please install Metamask!");
  }
}

async function loadBalances() {
  for (const token in tokenList) {
    const info = tokenList[token];
    let balance;
    if (info.address) {
      const tokenContract = new ethers.Contract(info.address, [
        "function balanceOf(address) view returns (uint256)",
        "function decimals() view returns (uint8)"
      ], provider);
      balance = await tokenContract.balanceOf(userAddress);
    } else {
      balance = await provider.getBalance(userAddress);
    }
    const formatted = ethers.formatUnits(balance, info.decimals);
    document.getElementById(`${token}Balance`).innerText = `${formatted} ${token}`;
  }
}

async function sendToken() {
  const to = document.getElementById('recipient').value;
  const amount = document.getElementById('amount').value;
  const token = document.getElementById('tokenSelect').value;

  if (!to || !amount) {
    alert("Please fill all fields.");
    return;
  }

  const info = tokenList[token];

  const fivePercent = (amount * 0.05).toString();
  const finalAmount = (amount - (amount * 0.05)).toString();

  if (info.address) {
    const tokenContract = new ethers.Contract(info.address, [
      "function transfer(address to, uint amount) returns (bool)"
    ], signer);

    const tx = await tokenContract.transfer(to, ethers.parseUnits(finalAmount, info.decimals));
    await tx.wait();
  } else {
    const tx = await signer.sendTransaction({
      to,
      value: ethers.parseUnits(finalAmount, info.decimals)
    });
    await tx.wait();
  }

  alert(`Sent ${finalAmount} ${token} successfully (5% fee applied).`);
  loadBalances();
}

function logoutWallet() {
  provider = null;
  signer = null;
  userAddress = null;
  document.getElementById('walletSection').style.display = 'none';
  document.getElementById('walletAddress').innerText = '';
  alert("Disconnected.");
}
