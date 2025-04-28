// Connect MetaMask Wallet and Fetch Balance
async function connectWallet() {
    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const walletAddress = accounts[0];
            document.getElementById('userWalletAddress').innerText = walletAddress;
            localStorage.setItem('connectedWallet', walletAddress);
            console.log('Connected wallet:', walletAddress);

            // Fetch ETH Balance
            const balanceWei = await window.ethereum.request({
                method: 'eth_getBalance',
                params: [walletAddress, 'latest']
            });
            const balanceEth = parseFloat(parseInt(balanceWei, 16) / 1e18).toFixed(4);
            document.getElementById('userBalance').innerText = `${balanceEth} ETH`;
            localStorage.setItem('connectedBalance', balanceEth);
        } catch (error) {
            console.error('User denied wallet connection', error);
            alert('Wallet connection failed.');
        }
    } else {
        alert('MetaMask is not installed. Please install it to connect!');
    }
}

// Auto load saved wallet address and balance if connected
window.addEventListener('load', () => {
    const savedWallet = localStorage.getItem('connectedWallet');
    const savedBalance = localStorage.getItem('connectedBalance');
    if (savedWallet) {
        document.getElementById('userWalletAddress').innerText = savedWallet;
    }
    if (savedBalance) {
        document.getElementById('userBalance').innerText = `${savedBalance} ETH`;
    }
});

// Listen for account changes
if (window.ethereum) {
    window.ethereum.on('accountsChanged', async function (accounts) {
        if (accounts.length > 0) {
            const walletAddress = accounts[0];
            document.getElementById('userWalletAddress').innerText = walletAddress;
            localStorage.setItem('connectedWallet', walletAddress);

            // Update Balance
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
