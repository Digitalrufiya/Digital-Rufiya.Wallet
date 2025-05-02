// Update receiving amount
async function updateReceiveAmount() {
  const selected = document.getElementById("tokenSelect").value;
  const token = TOKENS[selected];
  const contract = new ethers.Contract(token.address, TOKEN_ABI, provider);
  const balance = await contract.balanceOf(userAddress);
  const formatted = ethers.utils.formatUnits(balance, token.decimals);
  document.getElementById("receiveAmount").innerText = `Receiving Amount: ${formatted}`;
}

// Add token to MetaMask
document.getElementById("addToMetaMask").addEventListener("click", async () => {
  const selected = document.getElementById("tokenSelect").value;
  const token = TOKENS[selected];
  try {
    await window.ethereum.request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20",
        options: {
          address: token.address,
          symbol: token.symbol,
          decimals: token.decimals,
          image: token.image || ""
        }
      }
    });
  } catch (err) {
    alert("Failed to add token: " + err.message);
  }
});

// Update QR and receive amount on token change
document.getElementById("tokenSelect").addEventListener("change", () => {
  generateQRCode(userAddress);
  updateReceiveAmount();
});
