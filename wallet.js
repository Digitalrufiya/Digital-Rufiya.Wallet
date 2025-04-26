let web3Modal;
let provider;
let signer;

async function init() {
    const providerOptions = {
        walletconnect: {
            package: window.WalletConnectProvider.default,
            options: {
                rpc: {
                    56: "https://bsc-dataseed.binance.org/" // BSC Mainnet
                },
                chainId: 56
            }
        }
    };

    web3Modal = new window.Web3Modal.default({
        cacheProvider: false,
        providerOptions,
        theme: "light"
    });

    document.getElementById('connectButton').addEventListener('click', onConnect);
    document.getElementById('sendButton').addEventListener('click', sendCoins);
}

async function onConnect() {
    try {
        provider = await web3Modal.connect();
        const web3Provider = new ethers.providers.Web3Provider(provider);
        signer = web3Provider.getSigner();
        const address = await signer.getAddress();
        
        document.getElementById('connectButton').innerText = 'Connected: ' + address.slice(0, 6) + '...' + address.slice(-4);
        document.getElementById('sendButton').disabled = false;
        document.getElementById('status').innerText = 'Connected to Wallet';
    } catch (e) {
        console.error(e);
        alert('Connection failed!');
    }
}

async function sendCoins() {
    const receiver = prompt('Enter receiver address:');
    const amountEth = prompt('Enter amount in BNB:');

    if (!receiver || !amountEth) {
        alert('Receiver and amount are required.');
        return;
    }

    try {
        const tx = await signer.sendTransaction({
            to: receiver,
            value: ethers.utils.parseEther(amountEth)
        });
        alert('Transaction sent! TX Hash: ' + tx.hash);
    } catch (error) {
        console.error(error);
        alert('Transaction failed!');
    }
}

window.addEventListener('load', async () => {
    init();
});
