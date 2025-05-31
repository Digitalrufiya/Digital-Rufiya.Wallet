// Replace these with your actual deployed contract info
const contractAddress = 'YOUR_CONTRACT_ADDRESS_HERE';
const abi = YOUR_CONTRACT_ABI_HERE;

let web3;
let contract;
let accounts;

async function init() {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    accounts = await web3.eth.getAccounts();
    contract = new web3.eth.Contract(abi, contractAddress);
    console.log("Connected account:", accounts[0]);
  } else {
    alert("Please install MetaMask!");
  }
}

// IPFS gateway helper
function ipfsUrl(cid) {
  return `https://ipfs.io/ipfs/${cid}`;
}

// Render a single post with media and basic UI
function renderPost(post, index) {
  const [poster, ipfsHash, mediaType, timestamp, flagged, likes] = post;
  const container = document.createElement('div');
  container.className = 'post';

  const date = new Date(timestamp * 1000).toLocaleString();
  container.innerHTML = `
    <div><strong>Posted by:</strong> ${poster}</div>
    <div><strong>Time:</strong> ${date}</div>
    <div class="media-container"></div>
    <div><strong>Likes:</strong> ${likes}</div>
    <button onclick="likePost(${index})">Like</button>
    <button onclick="showComments(${index})">Comments</button>
    <div id="comments-${index}" class="comments" style="margin-top:10px;"></div>
    <div>
      <input type="text" id="commentInput-${index}" placeholder="Write a comment" />
      <button onclick="commentOnPost(${index})">Comment</button>
    </div>
  `;

  const mediaContainer = container.querySelector('.media-container');

  if (mediaType === "image") {
    const img = document.createElement('img');
    img.src = ipfsUrl(ipfsHash);
    img.style.maxWidth = '400px';
    mediaContainer.appendChild(img);
  } else if (mediaType === "video") {
    const video = document.createElement('video');
    video.src = ipfsUrl(ipfsHash);
    video.controls = true;
    video.style.maxWidth = '400px';
    mediaContainer.appendChild(video);
  } else {
    mediaContainer.textContent = `Media type not supported: ${mediaType}`;
  }

  document.getElementById('posts').appendChild(container);
}

// Load all posts and render them
async function loadPosts() {
  document.getElementById('posts').innerHTML = "Loading posts...";
  const total = await contract.methods.totalPosts().call();
  document.getElementById('posts').innerHTML = '';
  for (let i = 0; i < total; i++) {
    const post = await contract.methods.getPost(i).call();
    renderPost(post, i);
  }
}

// Like a post
async function likePost(index) {
  try {
    await contract.methods.likePost(index).send({ from: accounts[0] });
    alert("Post liked!");
    loadPosts();
  } catch (err) {
    alert("Error liking post: " + err.message);
  }
}

// Show comments for a post
async function showComments(index) {
  const commentsDiv = document.getElementById(`comments-${index}`);
  commentsDiv.innerHTML = "Loading comments...";
  try {
    const comments = await contract.methods.getComments(index).call();
    if (comments.length === 0) {
      commentsDiv.innerHTML = "No comments yet.";
      return;
    }
    commentsDiv.innerHTML = '';
    comments.forEach(c => {
      const commentEl = document.createElement('div');
      const date = new Date(c.timestamp * 1000).toLocaleString();
      commentEl.innerHTML = `<strong>${c.commenter}:</strong> ${c.message} <em>(${date})</em>`;
      commentsDiv.appendChild(commentEl);
    });
  } catch (err) {
    commentsDiv.innerHTML = "Error loading comments.";
  }
}

// Comment on a post
async function commentOnPost(index) {
  const input = document.getElementById(`commentInput-${index}`);
  const message = input.value.trim();
  if (!message) {
    alert("Please enter a comment.");
    return;
  }
  try {
    await contract.methods.commentOnPost(index, message).send({ from: accounts[0] });
    alert("Comment added!");
    input.value = '';
    showComments(index);
    loadPosts();
  } catch (err) {
    alert("Error adding comment: " + err.message);
  }
}

// Create a new post (example: user provides IPFS hash and media type)
async function createPost(ipfsHash, mediaType) {
  if (!ipfsHash || !mediaType) {
    alert("IPFS hash and media type required.");
    return;
  }
  try {
    await contract.methods.post(ipfsHash, mediaType).send({ from: accounts[0] });
    alert("Post created!");
    loadPosts();
  } catch (err) {
    alert("Error creating post: " + err.message);
  }
}

// Create or update user profile
async function setProfile(displayName, bio, profilePhotoCID, coverPhotoCID) {
  try {
    await contract.methods.setProfile(displayName, bio, profilePhotoCID, coverPhotoCID).send({ from: accounts[0] });
    alert("Profile updated!");
  } catch (err) {
    alert("Error updating profile: " + err.message);
  }
}

// Fetch and display user profile
async function loadProfile(address) {
  try {
    const profile = await contract.methods.profiles(address).call();
    // You can update your UI with profile.displayName, profile.bio, etc.
    console.log("Profile for", address, profile);
  } catch (err) {
    console.error("Error loading profile:", err);
  }
}

// Create a donation request
async function createDonationRequest(description, amountRequested) {
  if (!description || !amountRequested || isNaN(amountRequested) || amountRequested <= 0) {
    alert("Valid description and amount required.");
    return;
  }
  try {
    await contract.methods.createDonationRequest(description, web3.utils.toWei(amountRequested.toString(), 'ether')).send({ from: accounts[0] });
    alert("Donation request created!");
    loadDonationRequests();
  } catch (err) {
    alert("Error creating donation request: " + err.message);
  }
}

// Load and display donation requests
async function loadDonationRequests() {
  const container = document.getElementById('donations');
  container.innerHTML = "Loading donation requests...";
  try {
    const total = await contract.methods.totalDonationRequests().call();
    container.innerHTML = '';
    for (let i = 0; i < total; i++) {
      const req = await contract.methods.getDonationRequest(i).call();
      const div = document.createElement('div');
      div.className = 'donation-request';
      div.innerHTML = `
        <div><strong>Requester:</strong> ${req.requester}</div>
        <div><strong>Description:</strong> ${req.description}</div>
        <div><strong>Requested:</strong> ${web3.utils.fromWei(req.amountRequested, 'ether')} DRFM</div>
        <div><strong>Received:</strong> ${web3.utils.fromWei(req.amountReceived, 'ether')} DRFM</div>
        <div><strong>Fulfilled:</strong> ${req.fulfilled}</div>
        <input type="number" id="donateAmount-${i}" placeholder="Amount to donate" min="0" step="0.01" />
        <button onclick="donateToRequest(${i})">Donate</button>
      `;
      container.appendChild(div);
    }
  } catch (err) {
    container.innerHTML = "Error loading donation requests.";
  }
}

// Donate to a donation request
async function donateToRequest(requestId) {
  const input = document.getElementById(`donateAmount-${requestId}`);
  const amount = input.value;
  if (!amount || isNaN(amount) || amount <= 0) {
    alert("Enter a valid donation amount.");
    return;
  }
  try {
    await contract.methods.donateToRequest(requestId, web3.utils.toWei(amount, 'ether')).send({ from: accounts[0] });
    alert("Donation successful!");
    input.value = '';
    loadDonationRequests();
  } catch (err) {
    alert("Error making donation: " + err.message);
  }
}

// Initialize everything on page load
window.addEventListener('load', async () => {
  await init();
  await loadPosts();
  await loadDonationRequests();
});
