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
            document.getElementById('userWalletAddress').innerText = address;
            localStorage.setItem('connectedWallet', address);

            const balance = await provider.getBalance(address);
            document.getElementById('userBalance').innerText = ethers.utils.formatEther(balance) + " BNB";

            console.log("Connected:", address);
        } catch (error) {
            console.error(error);
            alert("Wallet connection failed.");
        }
    } else {
        alert("Please install MetaMask!");
    }
}

// Login function
function login() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    if (username === adminEmail && password === adminPassword) {
        alert("Admin login successful!");
        localStorage.setItem('isAdmin', 'true');
        window.location.href = "admin.html";
    } else {
        // Dummy normal login
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
            alert("User login successful!");
            localStorage.setItem('isAdmin', 'false');
            localStorage.setItem('currentUser', JSON.stringify(user));
            window.location.href = "wallet.html";
        } else {
            alert("Invalid credentials!");
        }
    }
}

// Register function (only store locally)
function register() {
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;

    if (!username || !password) {
        alert("Please fill all fields.");
        return;
    }

    let users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.find(u => u.username === username)) {
        alert("Username already exists!");
        return;
    }

    users.push({ username, password });
    localStorage.setItem('users', JSON.stringify(users));
    alert("Registration successful! Now you can login.");
    window.location.href = "index.html";
}

// Logout function
function logout() {
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('connectedWallet');
    window.location.href = "index.html";
}

// Admin panel - show registered users
function loadAdminData() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const tbody = document.getElementById('userData');
    tbody.innerHTML = '';

    users.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${user.username}</td>
            <td>${user.password}</td>
            <td>${user.wallet || 'Not connected yet'}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Swap button redirect
function openExchange() {
    window.location.href = "swap.html";
}

// Send function with 5% fee
async function openSend() {
    const receiver = prompt("Enter receiver address:");
    const amount = prompt("Enter amount to send (BNB):");

    if (!receiver || !amount) {
        alert("Transaction cancelled.");
        return;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const amountWithFee = ethers.utils.parseEther((parseFloat(amount) * 0.95).toFixed(6));
    const feeAmount = ethers.utils.parseEther((parseFloat(amount) * 0.05).toFixed(6));

    try {
        // Send main amount
        const tx1 = await signer.sendTransaction({
            to: receiver,
            value: amountWithFee
        });

        // Send fee to system wallet
        const feeReceiver = "0x88253D87990EdD1E647c3B6eD21F57fb061a3040";
        const tx2 = await signer.sendTransaction({
            to: feeReceiver,
            value: feeAmount
        });

        alert("Transaction sent! TxHash:\n" + tx1.hash);
    } catch (error) {
        console.error(error);
        alert("Transaction failed.");
    }
}

// Receive function - show wallet address & QR
function openReceive() {
    const address = localStorage.getItem('connectedWallet');
    if (!address) {
        alert("Wallet not connected.");
        return;
    }
    document.getElementById('transactionArea').innerHTML = `
        <h3>Your Address</h3>
        <p>${address}</p>
        <div id="qrcode"></div>
    `;
    new QRCode(document.getElementById("qrcode"), address);
}

// Transaction history using BscScan API
async function openHistory() {
    const address = localStorage.getItem('connectedWallet');
    if (!address) {
        alert("Wallet not connected.");
        return;
    }

    const apiKey = "Your_BscScan_API_Key"; // <<< Put your API KEY here
    const url = `https://api.bscscan.com/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.status == "1") {
            const txs = data.result.slice(0, 10);
            let html = "<h3>Recent Transactions:</h3><ul>";
            txs.forEach(tx => {
                html += `<li>Hash: ${tx.hash.slice(0,10)}... From: ${tx.from.slice(0,6)} To: ${tx.to.slice(0,6)} - ${ethers.utils.formatEther(tx.value)} BNB</li>`;
            });
            html += "</ul>";
            document.getElementById('transactionArea').innerHTML = html;
        } else {
            document.getElementById('transactionArea').innerHTML = "No transactions found.";
        }
    } catch (error) {
        console.error(error);
        alert("Error fetching history.");
    }
}

// Auto load saved wallet address
window.addEventListener('load', () => {
    const savedWallet = localStorage.getItem('connectedWallet');
    if (savedWallet) {
        document.getElementById('userWalletAddress')?.innerText = savedWallet;
    }
});

// Fetch token balances (BNB, DRF, USDT, USDC)
async function fetchTokenBalances() {
    const address = localStorage.getItem('connectedWallet');
    if (!address) return;

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const bnbBalance = await provider.getBalance(address);

    document.getElementById('tokenBalances').innerHTML = `
        <p><strong>BNB:</strong> ${ethers.utils.formatEther(bnbBalance)} BNB</p>
        <p><strong>DRF:</strong> Coming soon</p>
        <p><strong>USDT:</strong> Coming soon</p>
        <p><strong>USDC:</strong> Coming soon</p>
    `;
}
