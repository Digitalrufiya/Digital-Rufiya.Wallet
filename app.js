// app.js

// Hardcoded admin credentials
const adminEmail = "digitalrufiya@gmail.com";
const adminPassword = "Zivian@2020";

function login() {
  const username = document.getElementById("loginUsername").value;
  const password = document.getElementById("loginPassword").value;

  // Check if username and password match admin credentials
  if (username === adminEmail && password === adminPassword) {
    // Save session (optional)
    localStorage.setItem("loggedIn", "true");
    localStorage.setItem("username", username);

    // Redirect to wallet dashboard
    window.location.href = "wallet.html";
  } else {
    alert("Invalid username or password. Please try again.");
  }
}
async function connectWallet() {
  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const walletAddress = accounts[0];
      
      document.getElementById("walletAddress").innerText = walletAddress;
      document.getElementById("walletStatus").innerText = "Connected";

      // Optionally save address to localStorage
      localStorage.setItem("walletAddress", walletAddress);
    } catch (error) {
      console.error(error);
      alert("Wallet connection failed!");
    }
  } else {
    alert("MetaMask not detected! Please install MetaMask.");
  }
}

function disconnectWallet() {
  document.getElementById("walletAddress").innerText = "";
  document.getElementById("walletStatus").innerText = "Not Connected";
  localStorage.removeItem("walletAddress");
}

