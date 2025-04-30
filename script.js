import Web3Modal from "https://cdn.skypack.dev/web3modal";
import WalletConnectProvider from "https://cdn.skypack.dev/@walletconnect/web3-provider";
import { ethers } from "https://cdn.skypack.dev/ethers";

let web3Modal, provider, web3, selectedAccount;

const BSC_PARAMS = {
  chainId: "0x38", // BSC Mainnet
  chainName: "Binance Smart Chain",
  nativeCurrency: {
    name: "BNB",
    symbol: "BNB",
    decimals: 18
  },
  rpcUrls: ["https://bsc-dataseed.binance.org/"],
  blockExplorerUrls: ["https://bscscan.com"]
};

window.onload = async () => {
  const providerOptions = {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        rpc: {
          56: "https://bsc-dataseed.binance.org/"
        }
      }
    }
  };

  web3Modal = new Web3Modal({
    cacheProvider: false,
    providerOptions
  });

  document.getElementById("connectWallet").addEventListener("click", connectWallet);
};

async function connectWallet() {
  try {
    provider = await web3Modal.connect();

    provider.on("accountsChanged", (accounts) => {
      selectedAccount = accounts[0];
      updateUIWithAddress(selectedAccount);
    });

    provider.on("chainChanged", (chainId) => {
      if (chainId !== "0x38") {
        switchToBSC();
      }
    });

    web3 = new ethers.providers.Web3Provider(provider);
    const accounts = await web3.listAccounts();
    selectedAccount = accounts[0];
    updateUIWithAddress(selectedAccount);

    await switchToBSC();
    console.log("Wallet connected:", selectedAccount);
  } catch (err) {
    console.error("Wallet connect failed", err);
    alert("Failed to connect wallet. Please check your wallet or browser.");
  }
}

function updateUIWithAddress(address) {
  const button = document.getElementById("connectWallet");
  button.innerText = address.slice(0, 6) + "..." + address.slice(-4);
}

async function switchToBSC() {
  const eth = window.ethereum;
  if (!eth) return;

  try {
    await eth.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: BSC_PARAMS.chainId }]
    });
  } catch (switchError) {
    if (switchError.code === 4902) {
      await eth.request({
        method: "wallet_addEthereumChain",
        params: [BSC_PARAMS]
      });
    } else {
      console.error("Chain switch error:", switchError);
    }
  }
}
