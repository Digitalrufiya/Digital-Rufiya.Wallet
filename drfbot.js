// drfbot.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

// ✅ Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyB-W_j74lsbmJUFnTbJpn79HM62VLmkQC8",
  authDomain: "drfsocial-23a06.firebaseapp.com",
  projectId: "drfsocial-23a06",
  storageBucket: "drfsocial-23a06.appspot.com",
  messagingSenderId: "608135115201",
  appId: "1:608135115201:web:dc999df2c0f37241ff3f40",
  measurementId: "G-W6VHMP77YR"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ✅ Pinata JWT (Replace this with your actual JWT)
const PINATA_JWT = "Bearer YOUR_PINATA_JWT";

// ✅ Upload File to Pinata
export async function uploadToPinata(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      Authorization: PINATA_JWT
    },
    body: formData
  });

  if (!res.ok) throw new Error("Upload to Pinata failed");
  const data = await res.json();
  return data.IpfsHash; // CID
}

// ✅ Submit Post (Text + Media)
export async function submitPost(file, text, userProfileCID = "anonymous") {
  const cid = await uploadToPinata(file);
  const post = {
    cid,
    text,
    userProfileCID,
    timestamp: Date.now()
  };
  await addDoc(collection(db, "posts"), post);
  return post;
}

// ✅ Load All Posts from Firebase
export async function loadTimeline(containerId = "timeline") {
  const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
  const querySnapshot = await getDocs(q);
  const container = document.getElementById(containerId);
  container.innerHTML = ""; // Clear before loading

  querySnapshot.forEach(doc => {
    const post = doc.data();
    const fileUrl = `https://gateway.pinata.cloud/ipfs/${post.cid}`;
    const postHTML = `
      <div class="post-box">
        <video src="${fileUrl}" controls style="width: 100%; max-height: 300px;"></video>
        <p>${post.text}</p>
        <small>${new Date(post.timestamp).toLocaleString()}</small>
      </div>
    `;
    container.innerHTML += postHTML;
  });
}
