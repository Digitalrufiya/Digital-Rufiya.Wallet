let provider;
let signer;

async function connectWallet() {
  if (typeof window.ethereum !== 'undefined') {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();

      document.getElementById('status').innerText = "Wallet connected!";
      document.getElementById('sendButton').disabled = false;
    } catch (error) {
      console.error(error);
      document.getElementById('status').innerText = "Connection failed.";
    }
  } else {
    document.getElementById('status').innerText = "Please install a crypto wallet like Trust Wallet or MetaMask.";
  }
}

async function sendCoins() {
  if (!signer) {
    alert('Please connect your wallet first.');
    return;
  }

  const recipientAddress = "0x1234567890abcdef1234567890abcdef12345678"; // Change this to your real address
  const amountInEth = "0.01"; // Amount to send in ETH (or your chain's currency)

  try {
    const tx = await signer.sendTransaction({
      to: recipientAddress,
      value: ethers.utils.parseEther(amountInEth)
    });

    document.getElementById('status').innerText = `Transaction sent! TX Hash: ${tx.hash}`;
  } catch (error) {
    console.error(error);
    document.getElementById('status').innerText = "Transaction failed.";
  }
}

// Attach functions to buttons
document.getElementById('connectButton').addEventListener('click', connectWallet);
document.getElementById('sendButton').addEventListener('click', sendCoins);
