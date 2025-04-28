// DRF Contract Address on BSC
const DRF_ADDRESS = '0x7788a60dbC85AB46767F413EC7d51F149AA1bec6';
const USDT_ADDRESS = '0x55d398326f99059ff775485246999027b3197955';
const USDC_ADDRESS = '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d';

// User storage
let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser'));

// Admin Credentials
const adminEmail = "digitalrufiya@gmail.com";
const adminPassword = "Zivian@2020";

// Register function
function register() {
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    if (!username || !password) {
        alert("Please fill all fields.");
        return;
    }
    users.push({ username, password });
    localStorage.setItem('users', JSON.stringify(users));
    alert("Registered successfully! Please login.");
    window.location.href = "index.html";
}

// Login function
function login() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    if (username === adminEmail && password === adminPassword) {
        // Admin login
        localStorage.setItem('adminLoggedIn', true);
        window.location.href = "admin.html";
    } else {
        // User login
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            window.location.href = "wallet.html";
        } else {
            alert("Invalid credentials!");
        }
    }
}

// Logout for user
function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('connectedWallet');
    window.location.href = "index.html";
}

// Logout for admin
function logoutAdmin() {
    localStorage.removeItem('adminLoggedIn');
    window.location.href = "index.html";
}

// Load admin users
function loadAdminUsers() {
    const userData = document.getElementById('userData');
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${user.username}</td><td>${user.password}</td><td>Wallet Connected Later</td>`;
        userData.appendChild(row);
    });
}

// Connect MetaMask Wallet
async function connectWallet() {
    if (window.ethereum) {
        try {
            await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x38' }] });
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const walletAddress = accounts[0];
            document.getElementById('userWalletAddress').innerText = walletAddress;
            localStorage.setItem('connectedWallet', walletAddress);
            fetchBalances(walletAddress);
        } catch (error) {
            console.error('Wallet connect error:', error);
            alert('Wallet connection failed!');
        }
    } else {
        alert('MetaMask not detected!');
    }
}

// Fetch BNB and Token Balances
async function fetchBalances(address) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balanceBNB = await provider.getBalance(address);
    document.getElementById('userBalance').innerText = `${ethers.utils.formatEther(balanceBNB)} BNB`;

    const drfContract = new ethers.Contract(DRF_ADDRESS, erc20ABI, provider);
    const usdtContract = new ethers.Contract(USDT_ADDRESS, erc20ABI, provider);
    const usdcContract = new ethers.Contract(USDC_ADDRESS, erc20ABI, provider);

    const drfBalance = await drfContract.balanceOf(address);
    const usdtBalance = await usdtContract.balanceOf(address);
    const usdcBalance = await usdcContract.balanceOf(address);

    document.getElementById('tokenBalances').innerHTML = `
      <p><strong>DRF:</strong> ${ethers.utils.formatUnits(drfBalance, 18)}</p>
      <p><strong>USDT:</strong> ${ethers.utils.formatUnits(usdtBalance, 18)}</p>
      <p><strong>USDC:</strong> ${ethers.utils.formatUnits(usdcBalance, 18)}</p>
    `;
}

// ERC20 minimal ABI
const erc20ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function transfer(address to, uint amount) returns (bool)"
];

// Open Send form
function openSend() {
    document.getElementById('transactionArea').innerHTML = `
    <h3>Send Token</h3>
    <input type="text" id="sendAddress" placeholder="Recipient Address">
    <input type="text" id="sendAmount" placeholder="Amount">
    <select id="tokenType">
        <option value="bnb">BNB</option>
        <option value="drf">DRF</option>
        <option value="usdt">USDT</option>
        <option value="usdc">USDC</option>
    </select>
    <button onclick="sendToken()">Send</button>
    `;
}

// Send Token
async function sendToken() {
    const to = document.getElementById('sendAddress').value;
    const amount = document.getElementById('sendAmount').value;
    const token = document.getElementById('tokenType').value;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    if (token === 'bnb') {
        await signer.sendTransaction({
            to,
            value: ethers.utils.parseEther(amount)
        });
    } else {
        let contractAddress;
        if (token === 'drf') contractAddress = DRF_ADDRESS;
        if (token === 'usdt') contractAddress = USDT_ADDRESS;
        if (token === 'usdc') contractAddress = USDC_ADDRESS;
        const contract = new ethers.Contract(contractAddress, erc20ABI, signer);
        await contract.transfer(to, ethers.utils.parseUnits(amount, 18));
    }
    alert('Transaction Sent!');
}

// Open Receive
function openReceive() {
    const address = localStorage.getItem('connectedWallet');
    const qr = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${address}`;
    document.getElementById('transactionArea').innerHTML = `
    <h3>Receive</h3>
    <p>Wallet Address: <br><strong>${address}</strong></p>
    <img src="${qr}" alt="QR Code">
    `;
}

// Open Exchange
function openExchange() {
    document.getElementById('transactionArea').innerHTML = `
    <h3>Exchange (Manual Swap)</h3>
    <p>Coming Soon... (need DEX integration)</p>
    `;
}

// Open History
function openHistory() {
    document.getElementById('transactionArea').innerHTML = `
    <h3>Transaction History</h3>
    <p>View transactions directly in MetaMask activity!</p>
    `;
}

// Auto load wallet address
window.addEventListener('load', () => {
    const savedWallet = localStorage.getItem('connectedWallet');
    if (savedWallet && document.getElementById('userWalletAddress')) {
        document.getElementById('userWalletAddress').innerText = savedWallet;
        fetchBalances(savedWallet);
    }
});

// Listen to account change
if (window.ethereum) {
    window.ethereum.on('accountsChanged', function (accounts) {
        if (accounts.length > 0) {
            document.getElementById('userWalletAddress').innerText = accounts[0];
            localStorage.setItem('connectedWallet', accounts[0]);
            fetchBalances(accounts[0]);
        } else {
            document.getElementById('userWalletAddress').innerText = 'Not connected';
            localStorage.removeItem('connectedWallet');
        }
    });
}
