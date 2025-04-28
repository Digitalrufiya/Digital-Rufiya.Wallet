// ADMIN CREDENTIALS
const ADMIN_EMAIL = 'digitalrufiya@gmail.com';
const ADMIN_PASSWORD = 'Zivian@2020';

// USERS STORAGE (LocalStorage)
function saveUser(username, password) {
    let users = JSON.parse(localStorage.getItem('users')) || [];
    users.push({ username, password, wallet: '' });
    localStorage.setItem('users', JSON.stringify(users));
}

// Register new user
function register() {
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;

    if (!username || !password) {
        alert('Please fill all fields.');
        return;
    }

    saveUser(username, password);
    alert('Registered successfully! Now login.');
    window.location.href = 'index.html';
}

// Login user or admin
function login() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    // Check admin
    if (username === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        localStorage.setItem('adminLoggedIn', true);
        window.location.href = 'admin.html';
        return;
    }

    // Check user
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        localStorage.setItem('userLoggedIn', true);
        localStorage.setItem('currentUser', JSON.stringify(user));
        window.location.href = 'wallet.html';
    } else {
        alert('Invalid credentials.');
    }
}

// Logout (both admin and user)
function logout() {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Admin logout
function logoutAdmin() {
    localStorage.removeItem('adminLoggedIn');
    window.location.href = 'index.html';
}

// Admin panel - show users
function loadAdminUsers() {
    if (!localStorage.getItem('adminLoggedIn')) {
        alert('Access denied.');
        window.location.href = 'index.html';
        return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const tbody = document.getElementById('userData');

    users.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${user.username}</td>
            <td>${user.password}</td>
            <td>${user.wallet || 'Not connected'}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Wallet connection using ethers.js
async function connectWallet() {
    if (window.ethereum) {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const accounts = await provider.send("eth_requestAccounts", []);
            const walletAddress = accounts[0];
            document.getElementById('userWalletAddress').innerText = walletAddress;

            let currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (currentUser) {
                currentUser.wallet = walletAddress;
                localStorage.setItem('currentUser', JSON.stringify(currentUser));

                let users = JSON.parse(localStorage.getItem('users')) || [];
                const idx = users.findIndex(u => u.username === currentUser.username);
                if (idx > -1) {
                    users[idx].wallet = walletAddress;
                    localStorage.setItem('users', JSON.stringify(users));
                }
            }

            localStorage.setItem('connectedWallet', walletAddress);
            getBalances(walletAddress);

        } catch (error) {
            console.error(error);
            alert('Wallet connection failed.');
        }
    } else {
        alert('Please install MetaMask.');
    }
}

// Load wallet address on page load
window.addEventListener('load', () => {
    const savedWallet = localStorage.getItem('connectedWallet');
    if (savedWallet && document.getElementById('userWalletAddress')) {
        document.getElementById('userWalletAddress').innerText = savedWallet;
        getBalances(savedWallet);
    }

    // Admin page load
    if (window.location.pathname.includes('admin.html')) {
        loadAdminUsers();
    }
});

// Token contracts (BSC Mainnet)
const DRF_ADDRESS = '0x7788a60dbC85AB46767F413EC7d51F149AA1bec6';
const USDT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955';
const USDC_ADDRESS = '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d';

// DRF, USDT, USDC - ERC20 ABI
const ERC20_ABI = [
    "function balanceOf(address) view returns (uint)",
    "function transfer(address to, uint amount) returns (bool)"
];

// Get BNB and token balances
async function getBalances(wallet) {
    if (!window.ethereum) return;

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(wallet);
    document.getElementById('userBalance').innerText = `${ethers.utils.formatEther(balance)} BNB`;

    const drfContract = new ethers.Contract(DRF_ADDRESS, ERC20_ABI, provider);
    const usdtContract = new ethers.Contract(USDT_ADDRESS, ERC20_ABI, provider);
    const usdcContract = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, provider);

    const drfBalance = await drfContract.balanceOf(wallet);
    const usdtBalance = await usdtContract.balanceOf(wallet);
    const usdcBalance = await usdcContract.balanceOf(wallet);

    document.getElementById
