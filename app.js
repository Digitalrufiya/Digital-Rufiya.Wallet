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
