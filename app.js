// Connect MetaMask Wallet
async function connectWallet() {
    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const walletAddress = accounts[0];
            document.getElementById('userWalletAddress').innerText = walletAddress;
            localStorage.setItem('connectedWallet', walletAddress);
            console.log('Connected wallet:', walletAddress);
        } catch (error) {
            console.error('User denied wallet connection', error);
            alert('Wallet connection failed.');
        }
    } else {
        alert('MetaMask is not installed. Please install it to connect!');
    }
}

// Auto load saved wallet address if connected
window.addEventListener('load', () => {
    const savedWallet = localStorage.getItem('connectedWallet');
    if (savedWallet) {
        document.getElementById('userWalletAddress').innerText = savedWallet;
    }
});

// Add listener for account change
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
