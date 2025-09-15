// Initialize Firebase
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  databaseURL: "https://YOUR_PROJECT.firebaseio.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.database();

// Elements
const sidebar = document.querySelector(".sidebar");
const chatWindow = document.querySelector(".chat-window");
const messagesContainer = document.querySelector(".chat-messages");
const messageInput = document.querySelector("#messageInput");
const sendBtn = document.querySelector(".send-btn");
const emojiBtn = document.querySelector(".emoji-btn");
const backBtn = document.querySelector(".back-btn");
const chatWith = document.getElementById("chatWith");

let currentUser = null;
let currentFriendId = null;

// --- Auth (Google Sign In) ---
auth.onAuthStateChanged(user => {
  if (user) {
    currentUser = user;
    loadFriends();
  } else {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }
});

// --- Load Friends List ---
function loadFriends() {
  db.ref("users").on("value", snapshot => {
    const users = snapshot.val();
    const friendsList = document.getElementById("friendsList");
    friendsList.innerHTML = "";

    for (let uid in users) {
      if (uid !== currentUser.uid) {
        const li = document.createElement("li");
        li.textContent = users[uid].name;
        li.addEventListener("click", () => openChat(uid, users[uid].name));
        friendsList.appendChild(li);
      }
    }
  });

  db.ref("users/" + currentUser.uid).set({
    name: currentUser.displayName,
    email: currentUser.email,
    lastSeen: new Date().toISOString()
  });
}

// --- Open Chat ---
function openChat(friendId, friendName) {
  currentFriendId = friendId;
  chatWith.textContent = friendName;
  messagesContainer.innerHTML = "";

  // On mobile → hide sidebar, show chat
  if (window.innerWidth <= 768) {
    sidebar.style.display = "none";
    chatWindow.style.display = "flex";
  }

  // Listen for messages
  const chatId = currentUser.uid < friendId ? `${currentUser.uid}_${friendId}` : `${friendId}_${currentUser.uid}`;
  db.ref("chats/" + chatId).on("child_added", snapshot => {
    const msg = snapshot.val();
    displayMessage(msg);
  });
}

// --- Back Button (Mobile Only) ---
backBtn.addEventListener("click", () => {
  if (window.innerWidth <= 768) {
    chatWindow.style.display = "none";
    sidebar.style.display = "flex";
  }
});

// Default: show sidebar only on mobile
if (window.innerWidth <= 768) {
  chatWindow.style.display = "none";
}

// --- Send Message ---
sendBtn.addEventListener("click", sendMessage);
messageInput.addEventListener("keypress", e => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

function sendMessage() {
  const text = messageInput.value.trim();
  if (!text || !currentFriendId) return;

  const chatId = currentUser.uid < currentFriendId ? `${currentUser.uid}_${currentFriendId}` : `${currentFriendId}_${currentUser.uid}`;
  const newMsg = {
    sender: currentUser.uid,
    text,
    timestamp: Date.now()
  };

  db.ref("chats/" + chatId).push(newMsg);
  messageInput.value = "";
}

// --- Display Message ---
function displayMessage(msg) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.classList.add(msg.sender === currentUser.uid ? "sent" : "received");
  div.textContent = msg.text;
  messagesContainer.appendChild(div);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// --- Emoji Picker (desktop only) ---
if (emojiBtn) {
  emojiBtn.addEventListener("click", () => {
    // Simple emoji list
    const emojis = ["😀", "😂", "😍", "😢", "😎", "👍", "🙏", "❤️"];
    let picker = document.createElement("div");
    picker.className = "emoji-picker";

    emojis.forEach(e => {
      let span = document.createElement("span");
      span.textContent = e;
      span.style.cursor = "pointer";
      span.style.fontSize = "20px";
      span.style.margin = "5px";
      span.addEventListener("click", () => {
        messageInput.value += e;
        picker.remove();
      });
      picker.appendChild(span);
    });

    document.body.appendChild(picker);
    picker.style.position = "absolute";
    picker.style.bottom = "60px";
    picker.style.left = "20px";
    picker.style.background = "#fff";
    picker.style.border = "1px solid #ccc";
    picker.style.padding = "5px";
    picker.style.borderRadius = "8px";
  });
}
