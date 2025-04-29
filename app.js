// Include Ethers.js via CDN (make sure in HTML)
const ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
let signer;
let userAddress;
const BSC_CHAIN_ID = '0x38'; // BSC Mainnet chain ID
const feeReceiver = "0x88253D87990EdD1E647c3B6eD21F57fb061a3040"; // Fee address
const BSC_SCAN_API = 'Your_BSCSCAN_API_KEY'; // <<< Insert your BscScan API Key here
const PANCAKESWAP_BASE_URL = 'https://pancakeswap.finance/swap'; // PancakeSwap official

// Tokens
const tokens = {
    BNB: { symbol: 'BNB', address: null, decimals: 18 },
    DRF: { symbol: 'DRF', address: '0x7788a60dbC85AB46767F413EC7d51F149AA1bec6', decimals: 18 },
    USDT: { symbol: 'USDT', address: '0x55d398326f99059fF775485246999027B3197955', decimals: 18 },
    USDC: { symbol: 'USDC', address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d', decimals: 18 },
};

async function connectWallet() {
    if (!window.ethereum) {
        alert("MetaMask not installed!");
        return;
    }
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    signer = ethersProvider.getSigner();
    userAddress = await signer.getAddress();
    document.getElementById('userWalletAddress').innerText = userAddress;
    loadBalances();
}

async function loadBalances() {
    const ethBalance = await ethersProvider.getBalance(userAddress);
    document.getElementById('userBalance').innerText = ${ethers.utils.formatEther(ethBalance)} BNB;

    const balancesDiv = document.getElementById('tokenBalances');
    balancesDiv.innerHTML = '';

    for (const key in tokens) {
        if (tokens[key].address) {
            const tokenContract = new ethers.Contract(tokens[key].address, erc20Abi, signer);
            const balance = await tokenContract.balanceOf(userAddress);
            const adjusted = ethers.utils.formatUnits(balance, tokens[key].decimals);
            balancesDiv.innerHTML += <p>${tokens[key].symbol}: ${adjusted}</p>;
        }
    }
}

async function sendToken() {
    const recipient = prompt("Enter recipient address:");
    const amount = prompt("Enter amount:");
    const token = prompt("Enter token (BNB, DRF, USDT, USDC):");

    if (!recipient  !amount  !token) return alert("Missing information!");

    const feeAmount = (parseFloat(amount) * 0.05).toFixed(18);
    const realAmount = (parseFloat(amount) - parseFloat(feeAmount)).toFixed(18);

    if (token.toUpperCase() === 'BNB') {
        await signer.sendTransaction({
            to: recipient,
            value: ethers.utils.parseEther(realAmount)
        });
        await signer.sendTransaction({
            to: feeReceiver,
            value: ethers.utils.parseEther(feeAmount)
        });
    } else {
        const contract = new ethers.Contract(tokens[token.toUpperCase()].address, erc20Abi, signer);
        const decimals = tokens[token.toUpperCase()].decimals;
        await contract.transfer(recipient, ethers.utils.parseUnits(realAmount, decimals));
        await contract.transfer(feeReceiver, ethers.utils.parseUnits(feeAmount, decimals));
    }
    alert("Transaction Sent!");
}

function openSend() {
    sendToken();
}

function openReceive() {
    const wallet = userAddress || localStorage.getItem('connectedWallet');
    if (!wallet) {
        alert("Connect Wallet First!");
        return;
    }
    const qrDiv = document.getElementById('transactionArea');
    qrDiv.innerHTML = <h3>Receive Address</h3><p>${wallet}</p><div id="qrcode"></div>;

    new QRCode(document.getElementById('qrcode'), wallet);
}

function openExchange() {
    window.open(${PANCAKESWAP_BASE_URL}?outputCurrency=${tokens.DRF.address}, '_blank');
}

async function openHistory() {
    const response = await fetch(https://api.bscscan.com/api?module=account&action=txlist&address=${userAddress}&startblock=0&endblock=99999999&sort=desc&apikey=${BSC_SCAN_API});
    const data = await response.json();
    const txs = data.result;

    const historyDiv = document.getElementById('transactionArea');
    historyDiv.innerHTML = "<h3>Transaction History</h3>";
txs.slice(0, 10).forEach(tx => {
        historyDiv.innerHTML += 
            <div>
                <p>Hash: <a href="https://bscscan.com/tx/${tx.hash}" target="_blank">${tx.hash.slice(0,10)}...</a></p>
                <p>From: ${tx.from.slice(0,6)}... To: ${tx.to.slice(0,6)}... Value: ${ethers.utils.formatEther(tx.value)} BNB</p>
                <hr/>
            </div>;
    });
}

// Basic Authentication (Admin/User)
const adminCredentials = { username: "digitalrufiya@gmail.com", password: "Zivian@2020" };
const users = JSON.parse(localStorage.getItem('registeredUsers')) || [];

function login() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    if (username === adminCredentials.username && password === adminCredentials.password) {
        window.location.href = "admin.html";
    } else if (users.find(u => u.username === username && u.password === password)) {
        window.location.href = "wallet.html";
    } else {
        alert("Invalid credentials");
    }
}

function register() {
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;

    if (users.find(u => u.username === username)) {
        alert("Username already exists!");
        return;
    }

    users.push({ username, password });
    localStorage.setItem('registeredUsers', JSON.stringify(users));
    alert("Registered successfully! Now login.");
    window.location.href = "index.html";
}

function logout() {
    localStorage.removeItem('connectedWallet');
    window.location.href = "index.html";
}

function logoutAdmin() {
    window.location.href = "index.html";
}

// ERC20 Minimal ABI
const erc20Abi = [
    "function balanceOf(address owner) view returns (uint256)",
    "function transfer(address to, uint amount) returns (bool)"
];

// Connect MetaMask Wallet
async function connectWallet() {
    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const walletAddress = accounts[0];
            document.getElementById('userWalletAddress').innerText = walletAddress;
            localStorage.setItem('connectedWallet', walletAddress);
            console.log('Connected wallet:', walletAddress);
        } catch (error) {
            console.error('User denied wallet connection', error);
            alert('Wallet connection failed.');
        }
    } else {
        alert('MetaMask is not installed. Please install it to connect!');
    }
}

// Auto load saved wallet address if connected
window.addEventListener('load', () => {
    const savedWallet = localStorage.getItem('connectedWallet');
    if (savedWallet) {
        document.getElementById('userWalletAddress').innerText = savedWallet;
    }
});

// Add listener for account change
if (window.ethereum) {
    window.ethereum.on('accountsChanged', function (accounts) {
        if (accounts.length > 0) {
            document.getElementById('userWalletAddress').innerText = accounts[0];
            localStorage.setItem('connectedWallet', accounts[0]);
        } else {
            document.getElementById('userWalletAddress').innerText = 'Not connected';
            localStorage.removeItem('connectedWallet');
        }
    });
}
