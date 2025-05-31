const contractABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "string", "name": "bio", "type": "string" },
      { "internalType": "string", "name": "photoCID", "type": "string" },
      { "internalType": "string", "name": "coverCID", "type": "string" }
    ],
    "name": "setProfile",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "profiles",
    "outputs": [
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "string", "name": "bio", "type": "string" },
      { "internalType": "string", "name": "photoCID", "type": "string" },
      { "internalType": "string", "name": "coverCID", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "ipfsHash", "type": "string" },
      { "internalType": "uint8", "name": "mediaType", "type": "uint8" }
    ],
    "name": "post",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalPosts",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "index", "type": "uint256" }],
    "name": "getPost",
    "outputs": [
      { "internalType": "address", "name": "author", "type": "address" },
      { "internalType": "string", "name": "ipfsHash", "type": "string" },
      { "internalType": "uint8", "name": "mediaType", "type": "uint8" },
      { "internalType": "uint256", "name": "likes", "type": "uint256" },
      { "internalType": "bool", "name": "flagged", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "postId", "type": "uint256" }],
    "name": "likePost",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "postId", "type": "uint256" },
      { "internalType": "string", "name": "message", "type": "string" }
    ],
    "name": "commentOnPost",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "postId", "type": "uint256" }],
    "name": "getComments",
    "outputs": [
      {
        "components": [
          { "internalType": "address", "name": "author", "type": "address" },
          { "internalType": "string", "name": "message", "type": "string" }
        ],
        "internalType": "struct DRFMedia.Comment[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "description", "type": "string" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "createDonationRequest",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalDonationRequests",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "index", "type": "uint256" }],
    "name": "getDonationRequest",
    "outputs": [
      { "internalType": "address", "name": "creator", "type": "address" },
      { "internalType": "string", "name": "description", "type": "string" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "uint256", "name": "raised", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "requestId", "type": "uint256" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "donateToRequest",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "postId", "type": "uint256" }],
    "name": "flagPost",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "postId", "type": "uint256" }],
    "name": "unflagPost",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];
