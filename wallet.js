const providerOptions = {
    walletconnect: {
        package: window.WalletConnectProvider.default,
        options: {
            rpc: {
                56: "https://bsc-dataseed.binance.org/"
            },
            chainId: 56
        }
    }
};

const web3Modal = new window.Web3Modal.default({
    cacheProvider: false,
    providerOptions
});

let signer;
let userAddress;
const drfTokenAddress = "0x657f33094eD55c2864b0f9De0B11127e08165FAd";
const drfAbi = [
    "function balanceOf(address owner) view returns (uint256)",
    "function transfer(address to, uint amount) returns (bool)"
];

document.getElementById("connectButton").addEventListener("click", connectWallet);
document.getElementById("sendButton").addEventListener("click", sendTokens);

async function connectWallet() {
    const instance = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(instance);
    signer = provider.getSigner();
    userAddress = await signer.getAddress();

    const network = await provider.getNetwork();
    document.getElementById("networkName").innerText = network.name === "binance" ? "BSC Mainnet" : network.name;
    document.getElementById("userAddress").innerText = userAddress;

    const bnbBalance = await provider.getBalance(userAddress);
    document.getElementById("bnbBalance").innerText = ethers.utils.formatEther(bnbBalance);

    const drfContract = new ethers.Contract(drfTokenAddress, drfAbi, signer);
    const drfBalance = await drfContract.balanceOf(userAddress);
    document.getElementById("drfBalance").innerText = ethers.utils.formatUnits(drfBalance, 18);

    document.getElementById("walletInfo").style.display = "block";
    document.getElementById("status").innerText = "Wallet connected!";
}

async function sendTokens() {
    const toAddress = prompt("Enter recipient address:");
    const amount = prompt("Enter amount to send:");
    if (!toAddress || !amount) return alert("Missing information!");

    const drfContract = new ethers.Contract(drfTokenAddress, drfAbi, signer);
    const tx = await drfContract.transfer(toAddress, ethers.utils.parseUnits(amount, 18));
    await tx.wait();
    alert("Tokens sent successfully!");
}
