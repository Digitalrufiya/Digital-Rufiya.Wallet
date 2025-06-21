// boost.js
import Web3 from "https://cdn.jsdelivr.net/npm/web3@1.10.0/dist/web3.min.js";

const DRF_TOKEN_ADDRESS = "0xYourDRFTokenAddress"; // Replace with real
const BOOST_RECEIVER = "0xYourBoostReceiverWallet"; // Your treasury wallet
const ABI = [
  // Minimal ERC20 ABI
  {
    "constant": false,
    "inputs": [
      { "name": "_to", "type": "address" },
      { "name": "_value", "type": "uint256" }
    ],
    "name": "transfer",
    "outputs": [{ "name": "", "type": "bool" }],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [
      { "name": "_owner", "type": "address" }
    ],
    "name": "balanceOf",
    "outputs": [{ "name": "balance", "type": "uint256" }],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{ "name": "", "type": "uint8" }],
    "type": "function"
  }
];

let web3;
let userAccount;

async function connectWallet() {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const accounts = await web3.eth.getAccounts();
    userAccount = accounts[0];
    return userAccount;
  } else {
    alert("MetaMask not found");
    return null;
  }
}

async function sendDRFBoost(postId, amountInDRF) {
  const token = new web3.eth.Contract(ABI, DRF_TOKEN_ADDRESS);
  const decimals = await token.methods.decimals().call();
  const amount = web3.utils.toBN(amountInDRF).mul(web3.utils.toBN(10).pow(web3.utils.toBN(decimals)));

  try {
    await token.methods.transfer(BOOST_RECEIVER, amount).send({ from: userAccount });
    await markBoostInFirebase(postId, amountInDRF, "DRF");
    alert("Boost successful");
  } catch (err) {
    alert("Boost failed: " + err.message);
  }
}

async function markBoostInFirebase(postId, amount, token) {
  const { getDatabase, ref, update } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js");
  const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js");

  const firebaseConfig = {
    apiKey: "AIzaSyB-W_j74lsbmJUFnTbJpn79HM62VLmkQC8",
    authDomain: "drfsocial-23a06.firebaseapp.com",
    databaseURL: "https://drfsocial-23a06-default-rtdb.firebaseio.com",
    projectId: "drfsocial-23a06",
    storageBucket: "drfsocial-23a06.appspot.com",
    messagingSenderId: "608135115201",
    appId: "1:608135115201:web:dc999df2c0f37241ff3f40"
  };

  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);
  const boostData = {
    boostAmount: amount,
    boostToken: token,
    boostBy: userAccount,
    boostTimestamp: Date.now(),
    boostExpiry: Date.now() + 3 * 24 * 60 * 60 * 1000 // 3 days
  };

  await update(ref(db, `posts/${postId}`), boostData);
}

// Example trigger (you can link this to a button on the frontend)
document.querySelectorAll(".boost-btn").forEach(btn => {
  btn.onclick = async () => {
    const postId = btn.dataset.id;
    const amount = prompt("Enter DRF amount to boost:");
    if (!amount || isNaN(amount)) return alert("Invalid amount");
    await connectWallet();
    await sendDRFBoost(postId, amount);
  };
});
