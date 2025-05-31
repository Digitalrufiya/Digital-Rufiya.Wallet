// utils.js

const NFT_STORAGE_API_KEY = "9983d49b.7d01108f38fb448db6b45bf24c46603b";
const NFT_STORAGE_ENDPOINT = "https://api.nft.storage/upload";

/**
 * Uploads a file (image, video, etc.) to IPFS using NFT.Storage
 * @param {File} file - The file to upload
 * @returns {Promise<string>} - IPFS CID (hash)
 */
async function uploadFileToIPFS(file) {
  if (!file) throw new Error("No file selected for upload.");

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(NFT_STORAGE_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${NFT_STORAGE_API_KEY}`,
    },
    body: formData
  });

  const result = await response.json();

  if (!result.ok) {
    console.error("NFT.Storage Error:", result);
    throw new Error("Upload to IPFS failed.");
  }

  return result.value.cid;
}

/**
 * Uploads a JSON object (e.g., metadata) to IPFS
 * @param {Object} data - JSON data
 * @returns {Promise<string>} - IPFS CID
 */
async function uploadJSONToIPFS(data) {
  const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
  const file = new File([blob], "metadata.json", { type: "application/json" });
  return await uploadFileToIPFS(file);
}

/**
 * Fetches content from IPFS using a public gateway
 * @param {string} cid - IPFS hash (CID)
 * @returns {Promise<Object|string>} - JSON or text
 */
async function fetchFromIPFS(cid) {
  const url = `https://ipfs.io/ipfs/${cid}`;
  const response = await fetch(url);
  const contentType = response.headers.get("Content-Type");

  if (contentType.includes("application/json")) {
    return await response.json();
  } else {
    return await response.text();
  }
}

/**
 * Gets file from <input type="file" id="...">
 * @param {string} inputId
 * @returns {File|null}
 */
function getFileFromInput(inputId) {
  const input = document.getElementById(inputId);
  if (!input || !input.files || input.files.length === 0) return null;
  return input.files[0];
}
