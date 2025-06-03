const axios = require('axios');
const fs = require('fs');

const API_KEY = "3d87f9ed904df892654c";
const API_SECRET = "a279e8854d44af6cb17047da98aa772a19022aaa20949b137f9fb1027c03bf9f";

async function uploadJSON() {
  try {
    const data = fs.readFileSync('profile.json', 'utf8');
    const jsonData = JSON.parse(data);

    const res = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      jsonData,
      {
        headers: {
          'pinata_api_key': API_KEY,
          'pinata_secret_api_key': API_SECRET,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Uploaded! CID:', res.data.IpfsHash);
  } catch (error) {
    console.error('Error uploading JSON:', error.message);
  }
}

uploadJSON();
