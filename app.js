// Admin credentials
const adminEmail = "digitalrufiya@gmail.com";
const adminPassword = "Zivian@2020";

// Connect Wallet with MetaMask and show address + balance
async function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            await provider.send("eth_requestAccounts", []);
            const signer = provider.getSigner();
            const address = await signer.getAddress();

            localStorage.setItem('connectedWallet', address);
            document.getElementById('userWalletAddress')?.innerText = address;

            const balance = await provider.getBalance(address);
            document.getElementById('userBalance')?.innerText = ethers.utils.formatEther(balance) + " BNB";
        } catch (error) {
            console.error("Wallet connection failed:", error);
            alert("Wallet connection failed.");
        }
    } else {
        alert("Please install MetaMask.");
    }
}

// Admin/User Login
function login() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    if (username === adminEmail && password === adminPassword) {
        localStorage.setItem('isAdmin', 'true');
        alert("Admin login successful!");
        window.location.href = "admin.html";
    } else {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
            localStorage.setItem('isAdmin', 'false');
            localStorage.setItem('currentUser', JSON.stringify(user));
            alert("User login successful!");
            window.location.href = "wallet.html";
        } else {
            alert("Invalid login.");
        }
    }
}

// Register
function register() {
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;

    if (!username || !password) return alert("Please fill all fields.");

    let users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.find(u => u.username === username)) {
        return alert("Username already exists.");
    }

    users.push({ username, password });
    localStorage.setItem('users', JSON.stringify(users));
    alert("Registration successful!");
    window.location.href = "index.html";
}

// Logout
function logout() {
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('connectedWallet');
    window.location.href = "index.html";
}

// Load Admin Panel User Data
function loadAdminData() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const tbody = document.getElementById('userData');
    tbody.innerHTML = '';

    users.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${user.username}</td>
            <td>${user.password}</td>
            <td>${user.wallet || 'Wallet not connected yet'}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Swap Button Redirect
function openExchange() {
    window.location.href = "swap.html";
}

// Send with Fee (5%)
async function openSend() {
    const receiver = prompt("Receiver address:");
    const amount = prompt("Amount to send (BNB):");

    if (!receiver || !amount) return alert("Cancelled.");

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const mainAmount = ethers.utils.parseEther((parseFloat(amount) * 0.95).toFixed(6));
    const feeAmount = ethers.utils.parseEther((parseFloat(amount) * 0.05).toFixed(6));
    const feeReceiver = "0x88253D87990EdD1E647c3B6eD21F57fb061a3040";

    try {
        await signer.sendTransaction({ to: receiver, value: mainAmount });
        await signer.sendTransaction({ to: feeReceiver, value: feeAmount });
        alert("Transaction sent successfully.");
    } catch (err) {
        console.error("Transaction failed:", err);
        alert("Transaction failed.");
    }
}

// Show Receive Info
function openReceive() {
    const address = localStorage.getItem('connectedWallet');
    if (!address) return alert("Wallet not connected.");

    document.getElementById('transactionArea').innerHTML = `
        <h3>Your Wallet Address</h3>
        <p>${address}</p>
        <div id="qrcode"></div>
    `;
    new QRCode(document.getElementById("qrcode"), address);
}

// Transaction History (BSC)
async function openHistory() {
    const address = localStorage.getItem('connectedWallet');
    if (!address) return alert("Wallet not connected.");

    const apiKey = "Your_BscScan_API_Key"; // Replace this
    const url = `https://api.bscscan.com/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        if (data.status === "1") {
            const txs = data.result.slice(0, 10);
            let html = "<h3>Recent Transactions:</h3><ul>";
            txs.forEach(tx => {
                html += `<li>TxHash: ${tx.hash.slice(0, 10)}... - ${ethers.utils.formatEther(tx.value)} BNB</li>`;
            });
            html += "</ul>";
            document.getElementById('transactionArea').innerHTML = html;
        } else {
            document.getElementById('transactionArea').innerHTML = "No transactions found.";
        }
    } catch (err) {
        console.error("Failed to load history:", err);
        alert("Could not fetch transaction history.");
    }
}

// Load on Page Ready
window.addEventListener('load', () => {
    const savedWallet = localStorage.getItem('connectedWallet');
    if (savedWallet) {
        document.getElementById('userWalletAddress')?.innerText = savedWallet;
    }

    fetchTokenBalances();
});

// Show balances (BNB + others placeholders)
async function fetchTokenBalances() {
    const address = localStorage.getItem('connectedWallet');
    if (!address) return;

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const bnbBalance = await provider.getBalance(address);

    document.getElementById('tokenBalances')?.innerHTML = `
        <p><strong>BNB:</strong> ${ethers.utils.formatEther(bnbBalance)}</p>
        <p><strong>DRF:</strong> Coming soon</p>
        <p><strong>USDT:</strong> Coming soon</p>
        <p><strong>USDC:</strong> Coming soon</p>
    `;
}
