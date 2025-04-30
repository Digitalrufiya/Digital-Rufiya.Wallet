let web3;

async function connectWallet() {
  if (window.ethereum) {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.getAccounts();
      const wallet = accounts[0];
      document.getElementById('connectedWallet').innerText = `Connected: ${wallet}`;
      document.getElementById('walletAddress').value = wallet;

      fetchWalletData();
    } catch (err) {
      console.error(err);
      alert("Wallet connection failed.");
    }
  } else {
    alert("Please install MetaMask!");
  }
}

async function fetchWalletData() {
  const address = document.getElementById('walletAddress').value;
  if (!web3 || !address) {
    alert("Wallet not connected.");
    return;
  }

  try {
    const balanceWei = await web3.eth.getBalance(address);
    const balance = web3.utils.fromWei(balanceWei, "ether");
    document.getElementById('balanceDisplay').innerText = `BNB Balance: ${balance}`;
  } catch (err) {
    console.error(err);
    alert("Failed to fetch balance.");
  }
}
