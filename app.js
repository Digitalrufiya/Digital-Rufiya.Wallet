const API_KEY = "YourApiKeyHere"; // Replace with your BscScan API key

async function connectWallet() {
  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const wallet = accounts[0];
      document.getElementById('connectedWallet').innerText = `Connected: ${wallet}`;
      document.getElementById('walletAddress').value = wallet;

      // Automatically fetch data after connection
      fetchWalletData();

    } catch (error) {
      alert("Wallet connection failed.");
      console.error(error);
    }
  } else {
    alert("MetaMask is not installed. Please install it.");
  }
}

    // Get BNB balance
    const bnbUrl = `https://api.bscscan.com/api?module=account&action=balance&address=${address}&apikey=${API_KEY}`;
    const bnbRes = await fetch(bnbUrl);
    const bnbData = await bnbRes.json();
    const balanceInBNB = (parseFloat(bnbData.result) / 1e18).toFixed(4);
    document.getElementById("bnbBalance").innerText = `${balanceInBNB} BNB`;

    // Get recent token transfers
    const tokenUrl = `https://api.bscscan.com/api?module=account&action=tokentx&address=${address}&sort=desc&apikey=${API_KEY}`;
    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json();

    const latestTxs = tokenData.result.slice(0, 5);
    const tableBody = document.getElementById("tokenTable");

    latestTxs.forEach(tx => {
      const row = `
        <tr>
          <td>${tx.tokenSymbol}</td>
          <td>${(tx.value / (10 ** tx.tokenDecimal)).toFixed(4)}</td>
          <td>${shortenAddress(tx.from)}</td>
          <td>${shortenAddress(tx.to)}</td>
        </tr>
      `;
      tableBody.innerHTML += row;
    });

  } catch (err) {
    alert("Error fetching wallet data.");
    console.error(err);
  }
}

function shortenAddress(addr) {
  return addr.substring(0, 6) + "..." + addr.slice(-4);
}
