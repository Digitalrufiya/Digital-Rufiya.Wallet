import { Core } from '@walletconnect/core';
import { WalletKit } from '@reown/walletkit';

// Initialize WalletKit
const core = new Core({
  projectId: '5c53beb0cbc14bcf6d24f38c9bfb7560'
});

const metadata = {
  name: 'Digitalrufiya-wallet',
  description: 'AppKit Example',
  url: 'https://reown.com/appkit',
  icons: ['https://assets.reown.com/reown-profile-pic.png']
};

const walletKit = await WalletKit.init({ core, metadata });

// Connect wallet on button click
async function connectWallet() {
  const session = await walletKit.connect();
  const accounts = session.accounts;
  console.log('Connected accounts:', accounts);

  // Update UI
  document.getElementById('walletInfo').style.display = 'block';
  document.getElementById('userAddress').textContent = accounts[0];
}

document.getElementById('connectButton').addEventListener('click', connectWallet);
