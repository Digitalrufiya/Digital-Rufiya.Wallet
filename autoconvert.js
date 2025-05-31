// autoconvert.js
const CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
const ABI = [
  "function post(string memory ipfsHash, string memory mediaType) public"
];

let provider;
let signer;
let contract;

async function connectWallet() {
  if (window.ethereum) {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
    document.getElementById('status').innerText = "Wallet connected";
  } else {
    alert("MetaMask not detected");
  }
}

document.getElementById('postForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const caption = document.getElementById('caption').value;
  const file = document.getElementById('media').files[0];
  if (!file) return;

  const mediaType = file.type.startsWith('video') ? 'video' : 'image';

  try {
    document.getElementById('status').innerText = "Uploading to IPFS...";

    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('https://api.nft.storage/upload', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer YOUR_NFT_STORAGE_API_KEY',
      },
      body: file
    });

    const data = await res.json();
    const ipfsHash = data.value.cid;
    document.getElementById('status').innerText = `Uploaded: ${ipfsHash}`;

    const tx = await contract.post(ipfsHash, mediaType);
    await tx.wait();
    document.getElementById('status').innerText = "Post saved on blockchain";
  } catch (err) {
    console.error(err);
    document.getElementById('status').innerText = "Error uploading/posting.";
  }
});
