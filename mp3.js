// mp3.js

const NFT_STORAGE_API_KEY = '9983d49b.7d01108f38fb448db6b45bf24c46603b';
const DRFM_CONTRACT_ADDRESS = '0x9CF972437e17927C1114F44D2D38aA77c4845d01';

const MAX_FREE_UPLOADS = 100;

async function uploadToNFTStorage(file) {
  const client = new NFTStorage.NFTStorage({ token: NFT_STORAGE_API_KEY });
  try {
    const metadata = await client.store({
      name: file.name,
      description: 'Islamic audio upload',
      image: file, // the file (audio) itself
    });
    console.log('Stored NFT with metadata:', metadata);
    return metadata.url; // ipfs://CID
  } catch (err) {
    console.error('NFT Storage upload error:', err);
    throw err;
  }
}

// Get user uploads from localStorage (simulate DB)
function getUserUploads() {
  const uploads = localStorage.getItem('userUploads');
  return uploads ? JSON.parse(uploads) : [];
}

// Save upload metadata to localStorage
function saveUpload(metadata) {
  let uploads = getUserUploads();
  uploads.push(metadata);
  localStorage.setItem('userUploads', JSON.stringify(uploads));
}

// Check upload limit
function canUpload() {
  const uploads = getUserUploads();
  return uploads.length < MAX_FREE_UPLOADS;
}

// Upload process handler
async function handleUpload(file, title, description) {
  if (!canUpload()) {
    alert('You reached free upload limit of 100 audios. Please buy extra storage with DRFM token.');
    return;
  }
  // Upload to IPFS via NFT.Storage
  const ipfsUrl = await uploadToNFTStorage(file);

  // Metadata for timeline
  const metadata = {
    title,
    description,
    ipfsUrl,
    date: new Date().toISOString(),
    uploader: 'user_wallet_address_here', // Replace with actual connected wallet
  };

  saveUpload(metadata);

  // TODO: Trigger DRFM reward logic here (upload +10 DRFM)

  alert('Upload successful! Your audio is now public.');

  // Update timeline UI dynamically
  appendToTimeline(metadata);
}

// Append audio metadata to timeline on page
function appendToTimeline(metadata) {
  const timeline = document.getElementById('audio-timeline');
  if (!timeline) return;

  const item = document.createElement('div');
  item.classList.add('audio-item');
  item.innerHTML = `
    <h3>${metadata.title}</h3>
    <audio controls src="${metadata.ipfsUrl.replace('ipfs://', 'https://ipfs.io/ipfs/')}"></audio>
    <p>${metadata.description}</p>
    <small>Uploaded: ${new Date(metadata.date).toLocaleString()}</small>
  `;
  timeline.prepend(item);
}

// Load timeline from localStorage on page load
function loadTimeline() {
  const uploads = getUserUploads();
  uploads.forEach(appendToTimeline);
}

// Call loadTimeline when page loads
window.addEventListener('DOMContentLoaded', loadTimeline);
