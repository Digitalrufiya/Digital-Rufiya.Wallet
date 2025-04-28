// Initialize ethers.js provider
const provider = new ethers.providers.Web3Provider(window.ethereum);
let signer;
let userAddress;

// Contract Addresses on BSC
const DRF_ADDRESS = "0x7788a60dbC85AB46767F413EC7d51F149AA1bec6";
const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";
const USDC_ADDRESS = "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d";

// ERC20 ABI (Standard)
const ERC20_ABI = [
    "function balanceOf(address) view returns (uint256)",
    "function transfer(address,uint256) returns (bool)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)"
];

// Connect Wallet
async function connectWallet() {
    if (window.ethereum) {
        await provider.send("eth_requestAccounts", []);
        signer = provider.getSigner();
        userAddress = await signer.getAddress();
        document.getElementById('userWalletAddress').innerText = userAddress;
        loadBalances();
        generateQRCode(userAddress);
    } else {
        alert('Please install MetaMask!');
    }
}

// Load all Balances
async function loadBalances() {
    if (!userAddress) return;
    const bnbBalance = await provider.getBalance(userAddress);
    document.getElementById('userBalance').innerText = `${ethers.utils.formatEther(bnbBalance)} BNB`;

    await loadTokenBalance(DRF_ADDRESS, "DRF");
    await loadTokenBalance(USDT_ADDRESS, "USDT");
    await loadTokenBalance(USDC_ADDRESS, "USDC");
}

// Load individual Token Balance
async function loadTokenBalance(tokenAddress, tokenName) {
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    const balance = await tokenContract.balanceOf(userAddress);
    const decimals = await tokenContract.decimals();
    const formatted = ethers.utils.formatUnits(balance, decimals);

    const tokenBalancesDiv = document.getElementById('tokenBalances');
    const p = document.createElement('p');
    p.innerText = `${tokenName}: ${formatted}`;
    tokenBalancesDiv.appendChild(p);
}

// Logout
function logout() {
    localStorage.clear();
    window.location.href = "index.html";
}

// QR Code for Receive
function generateQRCode(address) {
    const qrContainer = document.getElementById('transactionArea');
    qrContainer.innerHTML = "";
    const qr = new QRCode(qrContainer, {
        text: address,
        width: 128,
        height: 128,
    });
}

// Send Tokens
async function openSend() {
    const token = prompt("Send which token? (BNB, DRF, USDT, USDC)").toUpperCase();
    const recipient = prompt("Recipient Address:");
    const amount = prompt("Amount:");

    if (token === "BNB") {
        const tx = await signer.sendTransaction({
            to: recipient,
            value: ethers.utils.parseEther(amount)
        });
        alert("BNB Sent! Tx Hash: " + tx.hash);
    } else {
        let tokenAddress;
        if (token === "DRF") tokenAddress = DRF_ADDRESS;
        else if (token === "USDT") tokenAddress = USDT_ADDRESS;
        else if (token === "USDC") tokenAddress = USDC_ADDRESS;
        else {
            alert("Invalid token selected!");
            return;
        }

        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
        const decimals = await tokenContract.decimals();
        const tx = await tokenContract.transfer(recipient, ethers.utils.parseUnits(amount, decimals));
        alert(token + " Sent! Tx Hash: " + tx.hash);
    }
}

// Open Receive
function openReceive() {
    alert(`Your Wallet Address:\n${userAddress}`);
    generateQRCode(userAddress);
}

// Exchange (basic swap simulation)
async function openExchange() {
    const fromToken = prompt("Swap from (DRF, USDT, USDC)").toUpperCase();
    const toToken = prompt("Swap to (DRF, USDT, USDC)").toUpperCase();
    const amount = prompt("Amount:");

    alert(`Simulated swap ${amount} ${fromToken} to ${toToken}. (Real DEX integration coming soon.)`);
}

// Transaction History (simplified)
async function openHistory() {
    alert("Transaction history feature coming soon (will list last few transactions).");
}

// Admin and User Login / Register logic (simple localStorage)

// Hardcoded Admin
const adminCredentials = {
    username: "digitalrufiya@gmail.com",
    password: "Zivian@2020"
};

// Register User
function register() {
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;

    if (username && password) {
        let users = JSON.parse(localStorage.getItem('users')) || [];
        users.push({ username, password });
        localStorage.setItem('users', JSON.stringify(users));
        alert('Registered Successfully! Now login.');
        window.location.href = "index.html";
    } else {
        alert('Please fill all fields.');
    }
}

// Login User
function login() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    if (username === adminCredentials.username && password === adminCredentials.password) {
        window.location.href = "admin.html";
        return;
    }

    let users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        window.location.href = "wallet.html";
    } else {
        alert('Invalid credentials!');
    }
}

// Logout Admin
function logoutAdmin() {
    window.location.href = "index.html";
}

// Load Users for Admin Panel
function loadUsersForAdmin() {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    const tbody = document.getElementById('userData');
    tbody.innerHTML = "";
    users.forEach(u => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${u.username}</td><td>${u.password}</td><td>-</td>`;
        tbody.appendChild(tr);
    });
}

// Auto Wallet Connection Restore
window.addEventListener('load', async () => {
    if (window.location.pathname.includes("wallet.html")) {
        await connectWallet();
    }
    if (window.location.pathname.includes("admin.html")) {
        loadUsersForAdmin();
    }
});
