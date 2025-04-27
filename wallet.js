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

// Your DRF Token Contract
const DRF_TOKEN_ADDRESS = '0x657f33094eD55c2864b0f9De0B11127e08165FAd';  // ✅ Updated!
const DRF_TOKEN_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function transfer(address to, uint amount) returns (bool)"
];

// Initialize Web3Modal
const web3Modal = new window.Web3Modal.default({
    cacheProvider: false,
    providerOptions: {
        walletconnect: {
            package: window.WalletConnectProvider.default,
            options: {
                rpc: {
                    56: "https://bsc-dataseed.binance.org/"  // Binance Smart Chain
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
    } catch (err) {
        console.error('Connection failed:', err);
        statusText.innerText = 'Connection failed. Please try again.';
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
}

// Send DRF tokens
async function sendDRFTokens() {
    const recipient = prompt('Enter recipient address:');
    const amount = prompt('Enter amount of DRF to send:');

    if (!recipient || !amount) {
        alert('Transaction cancelled.');
        return;
    }

    try {
        const drfContract = new ethers.Contract(DRF_TOKEN_ADDRESS, DRF_TOKEN_ABI, signer);
        const tx = await drfContract.transfer(recipient, ethers.utils.parseUnits(amount, 18));
        statusText.innerText = 'Transaction sent! Waiting for confirmation...';
        await tx.wait();
        statusText.innerText = 'Transaction confirmed!';
        updateUI();
    } catch (err) {
        console.error('Transaction failed:', err);
        alert('Transaction failed. See console for details.');
    }
}

// Listen to wallet events
function setupListeners(instance) {
    instance.on('accountsChanged', () => {
        window.location.reload();
    });

    instance.on('chainChanged', () => {
        window.location.reload();
    });

    instance.on('disconnect', () => {
        web3Modal.clearCachedProvider();
        window.location.reload();
    });
}

// Event Listeners
connectButton.addEventListener('click', connectWallet);
sendButton.addEventListener('click', sendDRFTokens);
