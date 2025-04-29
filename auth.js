// auth.js

// auth.js

const AUTH_CONFIG = {
  MAX_ATTEMPTS: 5,
  LOCKOUT_TIME_MS: 5 * 60 * 1000, // 5 minutes
  SCRIPT_URL: "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"
};

let authState = {
  attempts: 0,
  lockedUntil: null
};

export function isLockedOut() {
  const now = Date.now();
  return authState.lockedUntil && now < authState.lockedUntil;
}

export function getLockoutTimeRemaining() {
  return Math.ceil((authState.lockedUntil - Date.now()) / 1000);
}

export async function loginWithBackend(username, password) {
  if (!username || !password) {
    return { success: false, message: "Please enter both username and password." };
  }

  if (isLockedOut()) {
    return {
      success: false,
      message: `Too many failed attempts. Try again in ${getLockoutTimeRemaining()} seconds.`
    };
  }

  try {
    const response = await fetch(AUTH_CONFIG.SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({ username, password }),
      headers: { "Content-Type": "application/json" }
    });

    const data = await response.json();

    if (data.success) {
      authState.attempts = 0;
      return { success: true };
    } else {
      authState.attempts++;
      if (authState.attempts >= AUTH_CONFIG.MAX_ATTEMPTS) {
        authState.lockedUntil = Date.now() + AUTH_CONFIG.LOCKOUT_TIME_MS;
        return {
          success: false,
          message: "Too many failed attempts. Try again in 5 minutes."
        };
      }
      return { success: false, message: "Invalid username or password!" };
    }

  } catch (error) {
    console.error("Auth error:", error);
    return { success: false, message: "Network error. Please try again later." };
  }
}


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
// auth.js
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 mins
const SCRIPT_URL = "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec";
const STORAGE_KEY = "drf_login";

export function getLoginState() {
  const state = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  return {
    attempts: state.attempts || 0,
    lockedUntil: state.lockedUntil || 0,
  };
}

export function updateLoginState(attempts, lockedUntil = 0) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ attempts, lockedUntil }));
}

export function resetLoginState() {
  localStorage.removeItem(STORAGE_KEY);
}

export function isLockedOut() {
  const { lockedUntil } = getLoginState();
  return lockedUntil && Date.now() < lockedUntil;
}

export function getRemainingLockTime() {
  const { lockedUntil } = getLoginState();
  return Math.ceil((lockedUntil - Date.now()) / 1000);
}

export async function loginUser(username, password) {
  if (!username || !password) {
    return { success: false, message: "Please enter both username and password." };
  }

  const state = getLoginState();
  const now = Date.now();

  if (state.lockedUntil && now < state.lockedUntil) {
    return { success: false, message: `Locked out. Try again in ${getRemainingLockTime()}s.` };
  }

  try {
    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify({ username, password }),
      headers: { "Content-Type": "application/json" }
    });

    const result = await response.json();

    if (result.success) {
      resetLoginState();
      return { success: true };
    } else {
      const newAttempts = state.attempts + 1;
      if (newAttempts >= MAX_ATTEMPTS) {
        const lockUntil = now + LOCKOUT_DURATION_MS;
        updateLoginState(newAttempts, lockUntil);
        return { success: false, message: "Account locked for 5 minutes." };
      } else {
        updateLoginState(newAttempts);
        return { success: false, message: "Invalid username or password." };
      }
    }
  } catch (err) {
    console.error("Login error:", err);
    return { success: false, message: "Network error. Try again." };
  }
}
