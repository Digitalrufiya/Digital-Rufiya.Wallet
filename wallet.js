let account;

async function connectWallet() {
    const loader = document.getElementById('loader');
    loader.classList.remove('hidden');

    if (window.ethereum) {
        try {
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            account = accounts[0];
            document.getElementById('walletInfo').innerText = "Wallet: " + account;
            
            const network = await ethereum.request({ method: 'net_version' });
            let networkName = (network == 56) ? "Connected to BSC" : "Connected to Network ID: " + network;
            document.getElementById('networkInfo').innerText = networkName;

        } catch (error) {
            console.error(error);
            alert("Connection failed!");
        }
    } else {
        alert('Please install MetaMask!');
    }

    loader.classList.add('hidden');
}

async function sendToken() {
    const tokenAddress = "0x657f33094eD55c2864b0f9De0B11127e08165FAd"; // Your DRF token
    const receiver = prompt("Enter receiver address:");
    const amount = prompt("Enter amount to send:");

    if (!receiver || !amount) return;

    const tokenAbi = [
        "function transfer(address to, uint amount) public returns (bool)"
    ];

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const token = new ethers.Contract(tokenAddress, tokenAbi, signer);

    try {
        const tx = await token.transfer(receiver, ethers.utils.parseUnits(amount, 18));
        await tx.wait();
        alert('Sent successfully!');
    } catch (error) {
        console.error(error);
        alert('Sending failed!');
    }
}
