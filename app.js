// ====== CONFIG ======
const BSC_CHAIN_ID = '0x38'; // Binance Smart Chain Mainnet
const PANCAKE_SWAP_URL = "https://pancakeswap.finance/swap?outputCurrency=";
const DRF_TOKEN_ADDRESS = "0xYourDRFTokenAddress"; // <-- replace if needed

// ====== DOM ELEMENTS ======
const connectBtn = document.getElementById('connectWalletBtn');
const logoutBtn = document.getElementById('logoutBtn');
const sendBtn = document.getElementById('sendTokenBtn');
const exchangeBtn = document.getElementById('exchangeBtn');
const addressDisplay = document.getElementById('walletAddress');
const statusDisplay = document.getElementById('status');

// ====== TOAST NOTIFICATIONS ======
function showToast(message, type = "info") {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// ====== WALLET CONNECT ======
async function connectWallet() {
    if (typeof window.ethereum === 'undefined') {
        showToast("MetaMask is not installed!", "error");
        return;
    }
    try {
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        const chainId = await ethereum.request({ method: 'eth_chainId' });

        if (chainId !== BSC_CHAIN_ID) {
            showToast("Please connect to Binance Smart Chain!", "error");
            return;
        }

        const account = accounts[0];
        addressDisplay.innerText = account;
        statusDisplay.innerText = "Wallet Connected";
        showToast("Wallet connected successfully!", "success");
    } catch (err) {
        console.error(err);
        showToast("Failed to connect wallet!", "error");
    }
}

// ====== LOGOUT WALLET ======
function logoutWallet() {
    addressDisplay.innerText = '';
    statusDisplay.innerText = 'Not Connected';
    showToast("Wallet disconnected!", "info");
}

// ====== SEND TOKENS ======
async function sendToken() {
    const receiver = prompt("Enter recipient address:");
    const amount = prompt("Enter amount in BNB:");

    if (!receiver || !amount) {
        showToast("Invalid receiver or amount!", "error");
        return;
    }

    try {
        const tx = await ethereum.request({
            method: 'eth_sendTransaction',
            params: [{
                from: ethereum.selectedAddress,
                to: receiver,
                value: '0x' + (parseFloat(amount) * 1e18).toString(16)
            }]
        });
        showToast("Transaction sent! Hash: " + tx, "success");
    } catch (err) {
        console.error(err);
        showToast("Transaction failed!", "error");
    }
}

// ====== EXCHANGE USING PANCAKESWAP ======
function exchangeTokens() {
    if (!ethereum.selectedAddress) {
        showToast("Connect your wallet first!", "error");
        return;
    }
    const url = PANCAKE_SWAP_URL + DRF_TOKEN_ADDRESS;
    window.open(url, '_blank');
}

// ====== BUTTON EVENTS ======
connectBtn?.addEventListener('click', connectWallet);
logoutBtn?.addEventListener('click', logoutWallet);
sendBtn?.addEventListener('click', sendToken);
exchangeBtn?.addEventListener('click', exchangeTokens);

// ====== INIT ======
window.addEventListener('load', () => {
    if (ethereum?.isConnected()) {
        connectWallet();
    }
});
