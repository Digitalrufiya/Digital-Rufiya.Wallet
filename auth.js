// auth.js

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const SCRIPT_URL = "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec";
const STORAGE_KEY = "drf_login_state";

// --- LOGIN STATE MANAGEMENT ---
function getLoginState() {
  const state = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  return {
    attempts: state.attempts || 0,
    lockedUntil: state.lockedUntil || 0,
  };
}

function updateLoginState(attempts, lockedUntil = 0) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ attempts, lockedUntil }));
}

function resetLoginState() {
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

// --- PASSWORD HASHING ---
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// --- LOGIN FUNCTION ---
export async function loginUser(email, password) {
  if (!email || !password) {
    return { success: false, message: "Please enter both email and password." };
  }

  const state = getLoginState();
  const now = Date.now();

  if (state.lockedUntil && now < state.lockedUntil) {
    return {
      success: false,
      message: `Too many failed attempts. Try again in ${getRemainingLockTime()} seconds.`,
    };
  }

  const hashedPassword = await hashPassword(password);
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const user = users.find(u => u.email === email && u.password === hashedPassword);

  if (user) {
    resetLoginState();
    localStorage.setItem("loggedInUser", email);
    return { success: true };
  } else {
    const newAttempts = state.attempts + 1;
    if (newAttempts >= MAX_ATTEMPTS) {
      const lockUntil = now + LOCKOUT_DURATION_MS;
      updateLoginState(newAttempts, lockUntil);
      return { success: false, message: "Too many failed attempts. Try again in 5 minutes." };
    } else {
      updateLoginState(newAttempts);
      return { success: false, message: "Invalid credentials." };
    }
  }
}

// --- REGISTRATION FUNCTION ---
export async function registerUser(event) {
  event.preventDefault();

  const email = document.getElementById("register-email").value.trim();
  const password = document.getElementById("register-password").value;
  const confirmPassword = document.getElementById("register-confirm-password").value;

  if (!email || !password || !confirmPassword) {
    alert("All fields are required.");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match.");
    return;
  }

  const hashedPassword = await hashPassword(password);
  const users = JSON.parse(localStorage.getItem("users") || "[]");

  if (users.find(u => u.email === email)) {
    alert("Email already registered.");
    return;
  }

  users.push({ email, password: hashedPassword });
  localStorage.setItem("users", JSON.stringify(users));
  alert("Registration successful! Please log in.");
  toggleForms();
}

// --- TOGGLE FORMS FUNCTION ---
export function toggleForms() {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  loginForm.classList.toggle("hidden");
  registerForm.classList.toggle("hidden");
}
