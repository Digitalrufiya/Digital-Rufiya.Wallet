// admin.js

// Securely log out admin after 30 mins
setTimeout(() => {
  alert("Session expired. Please log in again.");
  window.location.href = "index.html";
}, 1800000); // 30 minutes

function logoutAdmin() {
  localStorage.removeItem('adminSession');
  window.location.href = "index.html";
}

// Check if admin is logged in
window.onload = () => {
  const session = localStorage.getItem('adminSession');
  if (!session || session !== "valid") {
    alert("Access denied. Admin login required.");
    window.location.href = "index.html";
  }
}
