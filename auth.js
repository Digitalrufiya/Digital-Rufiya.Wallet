// auth.js

// Helper: Hash password using SHA-256
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Toggle between login and register forms
function toggleForms() {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  loginForm.classList.toggle("hidden");
  registerForm.classList.toggle("hidden");
}

// Register a new user
async function registerUser(event) {
  event.preventDefault();

  const email = document.getElementById("register-email").value.trim();
  const password = document.getElementById("register-password").value;
  const confirmPassword = document.getElementById("register-confirm-password").value;

  if (!email || !password || !confirmPassword) {
    return alert("All fields are required.");
  }

  if (password !== confirmPassword) {
    return alert("Passwords do not match.");
  }

  const hashedPassword = await hashPassword(password);
  const existingUsers = JSON.parse(localStorage.getItem("users") || "[]");

  if (existingUsers.find(u => u.email === email)) {
    return alert("Email already registered.");
  }

  existingUsers.push({ email, password: hashedPassword });
  localStorage.setItem("users", JSON.stringify(existingUsers));

  alert("Registration successful! Please log in.");
  toggleForms();
}

// Login a user
async function loginUser(event) {
  event.preventDefault();

  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  if (!email || !password) {
    return alert("Please enter email and password.");
  }

  const hashedPassword = await hashPassword(password);
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const user = users.find(u => u.email === email && u.password === hashedPassword);

  if (!user) {
    return alert("Invalid credentials.");
  }

  localStorage.setItem("loggedInUser", email);
  window.location.href = "wallet.html";
}
