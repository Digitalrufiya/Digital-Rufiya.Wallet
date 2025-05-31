let web3;
let contract;
let userAddress;

const contractAddress = "0x9CF972437e17927C1114F44D2D38aA77c4845d01"; // DRFMedia contract
const charityAddress = "0x175390CB3C4E589b40CBe5a0f8c5752a4F1d973b";
const abi = [/* paste your contract ABI here */]; // Keep ABI updated

// Connect wallet
async function connectWallet() {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const accounts = await web3.eth.getAccounts();
    userAddress = accounts[0];
    contract = new web3.eth.Contract(abi, contractAddress);
    document.getElementById("wallet").innerText = formatAddress(userAddress);
  } else {
    alert("Please install MetaMask to use this DApp.");
  }
}

// Format address for display
function formatAddress(addr) {
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

// Set profile
async function setProfile(name, bio, photoCID, coverCID) {
  await contract.methods.setProfile(name, bio, photoCID, coverCID).send({ from: userAddress });
}

// Get profile
async function getProfile(address) {
  return await contract.methods.profiles(address).call();
}

// Create post
async function createPost(ipfsHash, mediaType) {
  await contract.methods.post(ipfsHash, mediaType).send({ from: userAddress });
}

// Like a post
async function likePost(postId) {
  await contract.methods.likePost(postId).send({ from: userAddress });
}

// Comment on post
async function commentOnPost(postId, message) {
  await contract.methods.commentOnPost(postId, message).send({ from: userAddress });
}

// Load posts
async function loadPosts() {
  const total = await contract.methods.totalPosts().call();
  let posts = [];
  for (let i = total - 1; i >= 0; i--) {
    const post = await contract.methods.getPost(i).call();
    posts.push({ id: i, ...post });
  }
  return posts;
}

// Get comments
async function getComments(postId) {
  return await contract.methods.getComments(postId).call();
}

// Create donation request
async function createDonation(description, amount) {
  await contract.methods.createDonationRequest(description, amount).send({ from: userAddress });
}

// Donate to request
async function donateTo(requestId, amount) {
  await contract.methods.donateToRequest(requestId, amount).send({ from: userAddress });
}

// Get all donation requests
async function loadDonations() {
  const total = await contract.methods.totalDonationRequests().call();
  let requests = [];
  for (let i = 0; i < total; i++) {
    const req = await contract.methods.getDonationRequest(i).call();
    requests.push({ id: i, ...req });
  }
  return requests;
}

// Moderator: flag/unflag
async function flagPost(postId) {
  await contract.methods.flagPost(postId).send({ from: userAddress });
}
async function unflagPost(postId) {
  await contract.methods.unflagPost(postId).send({ from: userAddress });
}

// On load
window.addEventListener("load", async () => {
  if (window.ethereum) {
    await connectWallet();
  }
});
