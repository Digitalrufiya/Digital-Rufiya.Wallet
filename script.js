import Web3Modal from "https://cdn.jsdelivr.net/npm/web3modal@1.9.5/dist/index.js";
import { ethers } from "https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.esm.min.js";
import WalletConnectProvider from "https://cdn.jsdelivr.net/npm/@walletconnect/web3-provider@1.8.0/dist/umd/index.min.js";

let provider, signer, userAddress;

const BSC_PARAMS = {
  chainId: '0x38',
  chainName: 'BNB Smart Chain',
  nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
  rpcUrls: ['https://bsc-dataseed1.binance.org'],
  blockExplorerUrls: ['https://bscscan.com']
};

const TOKEN_LIST = [
  {
    name: 'DRF',
    symbol: 'DRF',
    contract: '0x7788a60dbC85AB46767F413EC7d51F149AA1bec6',
    decimals: 18
  },
  {
    name: 'USDC',
    symbol: 'USDC',
    contract: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
    decimals: 18
  },
  {
    name: 'USDT',
    symbol: 'USDT',
    contract: '0x55d398326f99059fF775485246999027B3197955',
    decimals: 18
  }
];

const web3Modal = new Web3Modal({
  cacheProvider: true,
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        rpc: { 56: BSC_PARAMS.rpcUrls[0] }
      }
    }
  }
});

async function connectWallet() {
  const instance = await web3Modal.connect();
  provider = new ethers.providers.Web3Provider(instance);
  signer = provider.getSigner();
  userAddress = await signer.getAddress();
  await ensureBSCNetwork();
  document.getElementById('walletAddress').innerText = userAddress;
  loadBalances();
  generateQR('DRF');
  loadTxHistory();
}

async function ensureBSCNetwork() {
  const network = await provider.getNetwork();
  if (network.chainId !== 56) {
    try {
      await provider.send("wallet_switchEthereumChain", [{ chainId: BSC_PARAMS.chainId }]);
    } catch (switchError) {
      await provider.send("wallet_addEthereumChain", [BSC_PARAMS]);
    }
  }
}

async function loadBalances() {
  for (let token of TOKEN_LIST) {
    const contract = new ethers.Contract(token.contract, ["function balanceOf(address) view returns (uint256)"], provider);
    const balance = await contract.balanceOf(userAddress);
    const formatted = ethers.utils.formatUnits(balance, token.decimals);
    document.getElementById(`balance-${token.symbol}`).innerText = `${formatted} ${token.symbol}`;
  }
}

function generateQR(token) {
  const tokenInfo = TOKEN_LIST.find(t => t.symbol === token);
  const text = `Token: ${tokenInfo.symbol}\nAddress: ${userAddress}`;
  document.getElementById("receiveAddress").innerText = userAddress;
  document.getElementById("scanLink").href = `https://bscscan.com/address/${userAddress}`;
  new QRCode(document.getElementById("qrCode"), {
    text,
    width: 200,
    height: 200
  });
}

async function sendToken() {
  const token = document.getElementById("sendToken").value;
  const recipient = document.getElementById("sendTo").value;
  const amount = parseFloat(document.getElementById("sendAmount").value);

  const tokenInfo = TOKEN_LIST.find(t => t.symbol === token);
  const contract = new ethers.Contract(tokenInfo.contract, ["function transfer(address to, uint amount) returns (bool)"], signer);
  const amountInWei = ethers.utils.parseUnits((amount * 0.95).toString(), tokenInfo.decimals);
  const feeInWei = ethers.utils.parseUnits((amount * 0.05).toString(), tokenInfo.decimals);
  const drfContract = new ethers.Contract(TOKEN_LIST[0].contract, ["function transfer(address to, uint amount) returns (bool)"], signer);

  try {
    await contract.transfer(recipient, amountInWei);
    await drfContract.transfer("0x7788a60dbC85AB46767F413EC7d51F149AA1bec6", feeInWei);
    alert("Transaction sent successfully!");
    loadBalances();
  } catch (err) {
    console.error(err);
    alert("Transaction failed.");
  }
}

async function loadTxHistory() {
  const res = await fetch(`https://api.bscscan.com/api?module=account&action=tokentx&address=${userAddress}&sort=desc&apikey=YourBscScanApiKey`);
  const data = await res.json();
  const txs = data.result.slice(0, 20);
  const list = document.getElementById("txList");
  list.innerHTML = '';
  txs.forEach(tx => {
    const item = document.createElement('li');
    const action = tx.from.toLowerCase() === userAddress.toLowerCase() ? "Sent" : "Received";
    item.innerHTML = `
      <strong>${tx.tokenSymbol}</strong> - ${action} ${ethers.utils.formatUnits(tx.value, tx.tokenDecimal)}
      <br><small>${new Date(tx.timeStamp * 1000).toLocaleString()} - <a href="https://bscscan.com/tx/${tx.hash}" target="_blank">View</a></small>
    `;
    list.appendChild(item);
  });
}

document.getElementById("connectBtn").onclick = connectWallet;
document.getElementById("sendBtn").onclick = sendToken;
document.getElementById("tokenSelect").onchange = (e) => generateQR(e.target.value);
