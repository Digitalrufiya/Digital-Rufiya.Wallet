// -------------------
// DRF Universal Auth
// -------------------

// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { getDatabase, ref, push, set } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";

// -------------------
// Firebase Config Switcher
// -------------------
let firebaseConfig;

if (window.location.hostname.includes("media")) {
  // DRFMedia Config
  firebaseConfig = {
    apiKey: "AIzaSyB-W_j74lsbmJUFnTbJpn79HM62VLmkQC8",
    authDomain: "drfsocial-23a06.firebaseapp.com",
    databaseURL: "https://drfsocial-23a06-default-rtdb.firebaseio.com",
    projectId: "drfsocial-23a06",
    storageBucket: "drfsocial-23a06.firebasestorage.app",
    messagingSenderId: "608135115201",
    appId: "1:608135115201:web:b37dffeb550941ffff3f40",
    measurementId: "G-TPT7QMWDYE"
  };
} else if (window.location.hostname.includes("tube")) {
  // DRFTube Config
  firebaseConfig = {
    apiKey: "AIzaSyCdFX1PbNEgubM4Zib7U-hgtJbSOONPk6U",
    authDomain: "drftube-634c6.firebaseapp.com",
    databaseURL: "https://drftube-634c6-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "drftube-634c6",
    storageBucket: "drftube-634c6.firebasestorage.app",
    messagingSenderId: "819828633864",
    appId: "1:819828633864:web:513002b461259b000cbcbd",
    measurementId: "G-ZPTJE4DMNN"
  };
} else {
  console.error("❌ Unknown platform, no Firebase config found");
}

// -------------------
// Initialize Firebase
// -------------------
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getDatabase(app);

// -------------------
// Pinata JWT (🔑 replace with your real JWT)
// -------------------
const PINATA_JWT = "eyJhbGciOi...your_jwt_here";
export function getPinataHeaders() {
  return {
    "Authorization": `Bearer ${PINATA_JWT}`,
    "Content-Type": "application/json"
  };
}

// -------------------
// Auth State Listener
// -------------------
onAuthStateChanged(auth, user => {
  if (user) {
    console.log("✅ Logged in:", user.email);

    // Save session locally
    localStorage.setItem("drfUser", JSON.stringify({
      email: user.email,
      uid: user.uid
    }));

    // Show user info
    showUser(user);
  } else {
    console.log("🚪 Logged out");
    localStorage.removeItem("drfUser");
  }
});

// -------------------
// Auth Functions
// -------------------
export async function login(email, password) {
  return await signInWithEmailAndPassword(auth, email, password);
}

export async function register(email, password) {
  const userCred = await createUserWithEmailAndPassword(auth, email, password);
  
  // Save user to DB
  const usersRef = ref(db, "users");
  const newUserRef = push(usersRef);
  await set(newUserRef, { 
    email, 
    createdAt: new Date().toISOString() 
  });
  
  return userCred;
}

export async function logout() {
  return await signOut(auth);
}

// -------------------
// UI: Show Avatar + Email
// -------------------
function showUser(user) {
  if (document.getElementById("drfUserBox")) return; // Prevent duplicates

  const container = document.createElement("div");
  container.id = "drfUserBox";
  container.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;margin:10px;padding:10px;border:1px solid #ddd;border-radius:8px;">
      <img src="https://api.dicebear.com/7.x/initials/svg?seed=${user.email}" 
           style="width:40px;height:40px;border-radius:50%;" />
      <div>
        <strong>${user.email}</strong><br>
        <button id="logoutBtn" style="padding:4px 10px;margin-top:4px;">Logout</button>
      </div>
    </div>
  `;
  document.body.prepend(container);

  // Logout button
  document.getElementById("logoutBtn").onclick = () => logout();
}
