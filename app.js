// ================== REGISTER FUNCTION ==================
function register() {
    const username = document.getElementById('registerUsername').value.trim();
    const password = document.getElementById('registerPassword').value.trim();

    if (!username || !password) {
        alert("Please fill all fields!");
        return;
    }

    if (username === "digitalrufiya@gmail.com") {
        alert("You cannot register using Admin email!");
        return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];

    const existingUser = users.find(user => user.username === username);
    if (existingUser) {
        alert("Username already exists! Please choose another.");
        return;
    }

    const newUser = { username: username, password: password, walletAddress: "" };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    alert("Registration successful! Please login now.");
    window.location.href = "index.html";
}

// ================== LOGIN FUNCTION ==================
function login() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    // Hardcoded Admin Login
    if (username === "digitalrufiya@gmail.com" && password === "Zivian@2020") {
        alert("Admin login successful!");
        window.location.href = "admin.html";
        return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        alert("User login successful!");
        localStorage.setItem('loggedInUser', username);
        window.location.href = "wallet.html";
    } else {
        alert("Invalid username or password!");
    }
}

// ================== LOGOUT FUNCTION ==================
function logout() {
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('connectedWallet');
    localStorage.removeItem('connectedBalance');
    window.location.href = "index.html";
}

function logoutAdmin() {
    localStorage.removeItem('loggedInUser');
    window.location.href = "index.html";
}

// ================== CONNECT WALLET FUNCTION ==================
async function connectWallet() {
    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const walletAddress = accounts[0];
            document.getElementById('userWalletAddress').innerText = walletAddress;
            localStorage.setItem('connectedWallet', walletAddress);

            // Fetch ETH balance
            const balanceWei = await window.ethereum.request({
                method: 'eth_getBalance',
                params: [walletAddress, 'latest']
            });
            const balanceEth = parseFloat(parseInt(balanceWei, 16) / 1e18).toFixed(4);
            document.getElementById('userBalance').innerText = `${balanceEth} ETH`;
            localStorage.setItem('connectedBalance', balanceEth);

            console.log('Connected wallet:', walletAddress);
        } catch (error) {
            console.error('User denied wallet connection', error);
            alert('Wallet connection failed.');
        }
    } else {
        alert('MetaMask is not installed. Please install it to connect!');
    }
}

// ================== AUTO LOAD SAVED WALLET ==================
window.addEventListener('load', () => {
    const savedWallet = localStorage.getItem('connectedWallet');
    const savedBalance = localStorage.getItem('connectedBalance');
    if (savedWallet) {
        const addressSpan = document.getElementById('userWalletAddress');
        if (addressSpan) addressSpan.innerText = savedWallet;
    }
    if (savedBalance) {
        const balanceSpan = document.getElementById('userBalance');
        if (balanceSpan) balanceSpan.innerText = `${savedBalance} ETH`;
    }
});

// ================== HANDLE ACCOUNT CHANGE ==================
if (window.ethereum) {
    window.ethereum.on('accountsChanged', async function (accounts) {
        if (accounts.length > 0) {
            const walletAddress = accounts[0];
            document.getElementById('userWalletAddress').innerText = walletAddress;
            localStorage.setItem('connectedWallet', walletAddress);

            // Update balance
            const balanceWei = await window.ethereum.request({
                method: 'eth_getBalance',
                params: [walletAddress, 'latest']
            });
            const balanceEth = parseFloat(parseInt(balanceWei, 16) / 1e18).toFixed(4);
            document.getElementById('userBalance').innerText = `${balanceEth} ETH`;
            localStorage.setItem('connectedBalance', balanceEth);
        } else {
            document.getElementById('userWalletAddress').innerText = 'Not connected';
            document.getElementById('userBalance').innerText = '0 ETH';
            localStorage.removeItem('connectedWallet');
            localStorage.removeItem('connectedBalance');
        }
    });
}
