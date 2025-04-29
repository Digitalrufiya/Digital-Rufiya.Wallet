<!-- index.html (Login Page) -->
<!DOCTYPE html>
<html>
<head>
  <title>Login - DRF Wallet</title>
  <script src="https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js"></script>
  <script src="app.js" defer></script>
</head>
<body>
  <h2>Login</h2>
  <input type="text" id="loginUsername" placeholder="Username">
  <input type="password" id="loginPassword" placeholder="Password">
  <button onclick="login()">Login</button>
  <p>New user? <a href="register.html">Register here</a></p>
</body>
</html>

<!-- register.html -->
<!DOCTYPE html>
<html>
<head>
  <title>Register - DRF Wallet</title>
  <script src="app.js" defer></script>
</head>
<body>
  <h2>Register</h2>
  <input type="text" id="registerUsername" placeholder="Username">
  <input type="password" id="registerPassword" placeholder="Password">
  <button onclick="register()">Register</button>
</body>
</html>

<!-- wallet.html -->
<!DOCTYPE html>
<html>
<head>
  <title>DRF Wallet</title>
  <script src="https://cdn.jsdelivr.net/npm/ethers@5.7.2/dist/ethers.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js"></script>
  <script src="app.js" defer></script>
</head>
<body>
  <h2>Your Wallet</h2>
  <p id="userWalletAddress">Not connected</p>
  <p id="userBalance"></p>
  <div id="tokenBalances"></div>
  <button onclick="connectWallet()">Connect Wallet</button>
  <button onclick="openSend()">Send</button>
  <button onclick="openReceive()">Receive</button>
  <button onclick="openExchange()">Swap DRF</button>
  <button onclick="openHistory()">View History</button>
  <div id="transactionArea"></div>
  <button onclick="logout()">Logout</button>
</body>
</html>

<!-- admin.html -->
<!DOCTYPE html>
<html>
<head>
  <title>Admin Panel</title>
  <script src="app.js" defer></script>
</head>
<body>
  <h2>Welcome Admin</h2>
  <button onclick="logoutAdmin()">Logout</button>
  <!-- Add admin panel elements here -->
</body>
</html>


async function openHistory() {
    const res = await fetch(https://api.bscscan.com/api?module=account&action=txlist&address=${userAddress}&startblock=0&endblock=99999999&sort=desc&apikey=${BSC_SCAN_API});
    const data = await res.json();
    const txs = data.result;
    const historyDiv = document.getElementById('transactionArea');
    historyDiv.innerHTML = '<h3>Transaction History</h3>';

    txs.slice(0, 10).forEach(tx => {
        historyDiv.innerHTML += 
            <div>
                <p>Hash: <a href="https://bscscan.com/tx/${tx.hash}" target="_blank">${tx.hash.slice(0, 10)}...</a></p>
                <p>From: ${tx.from.slice(0, 6)}... To: ${tx.to.slice(0, 6)}... Value: ${ethers.utils.formatEther(tx.value)} BNB</p>
                <hr/>
            </div>;
    });
}

function login() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    if (username === adminCredentials.username && password === adminCredentials.password) {
        window.location.href = "admin.html";
    } else if (users.find(u => u.username === username && u.password === password)) {
        window.location.href = "index.html";
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

window.addEventListener('load', () => {
    const savedWallet = localStorage.getItem('connectedWallet');
    if (savedWallet) document.getElementById('userWalletAddress').innerText = savedWallet;
});

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
