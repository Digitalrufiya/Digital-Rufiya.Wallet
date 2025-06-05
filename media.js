// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore, collection, doc, addDoc, serverTimestamp,
  onSnapshot, query, orderBy
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import {
  getAuth, signInAnonymously, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "XXXX",
  appId: "XXXX"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Auto sign in (anonymous for now)
signInAnonymously(auth);

// Show when signed in
onAuthStateChanged(auth, user => {
  if (user) {
    console.log("Signed in:", user.uid);
    listenToComments("post1", document.getElementById("comments-post1"));
  }
});

// Add comment
async function addComment(postId, commentText) {
  const user = auth.currentUser;
  if (!user || !commentText.trim()) return;

  const commentData = {
    text: commentText,
    uid: user.uid,
    name: "Anonymous User", // replace with user.displayName if using Google auth
    photoURL: "https://www.gravatar.com/avatar?d=mp",
    timestamp: serverTimestamp()
  };

  const commentRef = collection(doc(db, "posts", postId), "comments");
  await addDoc(commentRef, commentData);
}

// Handle input button click
window.addCommentUI = function (postId) {
  const input = document.getElementById(`input-${postId}`);
  const text = input.value.trim();
  if (text) {
    addComment(postId, text);
    input.value = "";
  }
};

// Listen to comment updates
function listenToComments(postId, container) {
  const commentRef = collection(doc(db, "posts", postId), "comments");
  const q = query(commentRef, orderBy("timestamp", "asc"));

  onSnapshot(q, snapshot => {
    container.innerHTML = "";
    snapshot.forEach(doc => {
      const c = doc.data();
      const div = document.createElement("div");
      div.classList.add("comment");
      div.innerHTML = `
        <img src="${c.photoURL}" class="comment-pic" />
        <span><strong>${c.name}</strong>: ${c.text}</span>
      `;
      container.appendChild(div);
    });
  });
}
