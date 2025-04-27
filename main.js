import { createWalletClient } from "@reown/walletkit";

async function connectWallet() {
  const walletClient = await createWalletClient({
    projectId: "YOUR_PROJECT_ID", 
    metadata: {
      name: "DRF Wallet",
      description: "Send and receive DRF Tokens",
      url: "https://digitalrufiya.github.io/Digitalrufiya-wallet/",
      icons: ["https://digitalrufiya.github.io/Digitalrufiya-wallet/logo.png"]
    }
  });

  const session = await walletClient.connect();
  console.log("Connected accounts:", session.accounts);
}

// Attach it to button click
document.getElementById('connectButton').addEventListener('click', connectWallet);
