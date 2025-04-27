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

import { Core } from '@walletconnect/core';
import { WalletKit } from '@reown/walletkit';

const core = new Core({
  projectId: '5c53beb0cbc14bcf6d24f38c9bfb7560'
});

const metadata = {
  name: 'Digitalrufiya-wallet',
  description: 'AppKit Example',
  url: 'https://reown.com/appkit', 
  icons: ['https://assets.reown.com/reown-profile-pic.png']
};

const walletKit = await WalletKit.init({
  core,
  metadata
});

