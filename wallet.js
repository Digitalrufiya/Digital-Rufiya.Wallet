// wallet.js

let provider;
let signer;
let userAddress;

const connectButton = document.getElementById('connectButton');
const sendButton = document.getElementById('sendButton');
const walletInfo = document.getElementById('walletInfo');
const statusText = document.getElementById('status');

const networkName = document.getElementById('networkName');
const userAddressSpan = document.getElementById('userAddress');
const bnbBalanceSpan = document.getElementById('bnbBalance');
const drfBalanceSpan = document.getElementById('drfBalance');

// Create Disconnect Button dynamically
const disconnectButton = document.createElement('button');
disconnectButton.innerText = 'Disconnect Wallet';
disconnectButton.className = 'btn';
disconnectButton.style.marginTop = '15px';

// Your DRF Token Contract
const DRF_TOKEN_ADDRESS = '0x657f33094eD55c2864b0f9De0B11127e08165FAd'; // ✅ Updated!
const DRF_TOKEN_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function transfer(address to, uint amount) returns (bool)"
];

// Toastify Helper
function showToast(message, type = 'info') {
    let bgColor = "#3498db"; // default blue

    if (type === 'success') bgColor = "#2ecc71";
    else if (type === 'error') bgColor = "#e74c3c";
    else if (type === 'warning') bgColor = "#f39c12";

    Toastify({
        text: message,
        duration: 4000,
        close: true,
        gravity: "top",
        position: "right",
        backgroundColor: bgColor,
        stopOnFocus: true,
    }).showToast();
}

// Initialize Web3Modal
const web3Modal = new window.Web3Modal.default({
    cacheProvider: false,
    providerOptions: {
        walletconnect: {
            package: window.WalletConnectProvider.default,
            options: {
                rpc: {
                    56: "https://bsc-dataseed.binance.org/" // Binance Smart Chain
                },
                network: "binance",
            }
        }
    }
});

// Connect Wallet
async function connectWallet() {
    try {
        const instance = await web3Modal.connect();
        provider = new ethers.providers.Web3Provider(instance);
        signer = provider.getSigner();
        userAddress = await signer.getAddress();

        updateUI();
        setupListeners(instance);
        showToast('Wallet connected successfully!', 'success');
    } catch (err) {
        console.error('Connection failed:', err);
        showToast('Connection failed. Please try again.', 'error');
    }
}

// Disconnect Wallet
async function disconnectWallet() {
    try {
        await web3Modal.clearCachedProvider();
        provider = null;
        signer = null;
        userAddress = null;
        walletInfo.style.display = 'none';
        connectButton.style.display = 'inline-block';
        disconnectButton.remove();
        statusText.innerText = 'Wallet disconnected.';
        showToast('Disconnected Successfully!', 'warning');
    } catch (err) {
        console.error('Error during disconnect:', err);
        showToast('Error during disconnect.', 'error');
    }
}

// Update UI after connection
async function updateUI() {
    const network = await provider.getNetwork();
    const bnbBalance = await provider.getBalance(userAddress);

    networkName.innerText = network.name || 'Unknown';
    userAddressSpan.innerText = userAddress.slice(0, 6) + '...' + userAddress.slice(-4);
    bnbBalanceSpan.innerText = ethers.utils.formatEther(bnbBalance).slice(0, 6);

    // Load DRF Balance
    const drfContract = new ethers.Contract(DRF_TOKEN_ADDRESS, DRF_TOKEN_ABI, signer);
    const drfBalance = await drfContract.balanceOf(userAddress);
    drfBalanceSpan.innerText = ethers.utils.formatUnits(drfBalance, 18).slice(0, 6);

    walletInfo.style.display = 'block';
    statusText.innerText = 'Wallet connected!';
    connectButton.style.display = 'none';

    // Show Disconnect Button
    document.querySelector('.container').appendChild(disconnectButton);
    disconnectButton.addEventListener('click', disconnectWallet);
}

// Send DRF tokens
async function sendDRFTokens() {
    const recipient = prompt('Enter recipient address:');
    const amount = prompt('Enter amount of DRF to send:');

    if (!recipient || !amount) {
        showToast('Transaction cancelled.', 'warning');
        return;
    }

    try {
        const drfContract = new ethers.Contract(DRF_TOKEN_ADDRESS, DRF_TOKEN_ABI, signer);
        const tx = await drfContract.transfer(recipient, ethers.utils.parseUnits(amount, 18));
        statusText.innerText = 'Transaction sent! Waiting for confirmation...';
        showToast('Transaction sent. Waiting for confirmation...', 'info');
        await tx.wait();
        statusText.innerText = 'Transaction confirmed!';
        showToast('Transaction Confirmed!', 'success');
        updateUI();
    } catch (err) {
        console.error('Transaction failed:', err);
        showToast('Transaction failed. See console for details.', 'error');
    }
}

// Listen to wallet events
function setupListeners(instance) {
    instance.on('accountsChanged', () => {
        window.location.reload();
    });
// Copy address to clipboard when clicking on user address
userAddressSpan.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(userAddress);
        showToast('Address copied to clipboard!', 'success');
    } catch (err) {
        console.error('Failed to copy:', err);
        showToast('Failed to copy address.', 'error');
    }
});

    instance.on('chainChanged', () => {
        window.location.reload();
    });

    instance.on('disconnect', () => {
        disconnectWallet();
    });
}

// Event Listeners
connectButton.addEventListener('click', connectWallet);
sendButton.addEventListener('click', sendDRFTokens);
