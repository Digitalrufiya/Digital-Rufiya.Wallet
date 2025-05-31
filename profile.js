// profile.js
const CONTRACT_ADDRESS = "YOUR_CONTRACT_ADDRESS";
const ABI = [
  "function setProfile(string memory name, string memory bio, string memory profileCID, string memory coverCID) public",
  "function profiles(address) view returns (string memory, string memory, string memory, string memory)"
];

let provider, signer, contract;

async function connectWallet() {
  if (window.ethereum) {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();
    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

    const address = await signer.getAddress();
    document.getElementById("walletAddress").innerText = `Connected: ${address}`;

    loadProfile(address);
  } else {
    alert("MetaMask not detected");
  }
}

async function uploadToIPFS(file) {
  const res = await fetch("https://api.nft.storage/upload", {
    method: "POST",
    headers: {
      Authorization: "Bearer YOUR_NFT_STORAGE_API_KEY"
    },
    body: file
  });
  const data = await res.json();
  return data.value.cid;
}

document.getElementById("profileForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("displayName").value;
  const bio = document.getElementById("bio").value;
  const profilePhoto = document.getElementById("profilePhoto").files[0];
  const coverPhoto = document.getElementById("coverPhoto").files[0];

  if (!profilePhoto || !coverPhoto) {
    alert("Please upload both photos");
    return;
  }

  document.getElementById("status").innerText = "Uploading photos to IPFS...";

  try {
    const profileCID = await uploadToIPFS(profilePhoto);
    const coverCID = await uploadToIPFS(coverPhoto);

    const tx = await contract.setProfile(name, bio, profileCID, coverCID);
    await tx.wait();

    document.getElementById("status").innerText = "Profile saved successfully!";
    loadProfile(await signer.getAddress());
  } catch (err) {
    console.error(err);
    document.getElementById("status").innerText = "Error saving profile.";
  }
});

async function loadProfile(address) {
  try {
    const [name, bio, profileCID, coverCID] = await contract.profiles(address);
    document.getElementById("namePreview").innerText = name;
    document.getElementById("bioPreview").innerText = bio;
    document.getElementById("profilePreview").src = `https://ipfs.io/ipfs/${profileCID}`;
    document.getElementById("coverPreview").src = `https://ipfs.io/ipfs/${coverCID}`;
  } catch (err) {
    console.warn("Profile not found or error loading.");
  }
}
