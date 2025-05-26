import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getDatabase, ref, set, get, child } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";
import { getStorage, ref as sRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyB-W_j74lsbmJUFnTbJpn79HM62VLmkQC8",
  authDomain: "drfsocial-23a06.firebaseapp.com",
  databaseURL: "https://drfsocial-23a06-default-rtdb.firebaseio.com",
  projectId: "drfsocial-23a06",
  storageBucket: "drfsocial-23a06.firebasestorage.app",
  messagingSenderId: "608135115201",
  appId: "1:608135115201:web:b37dffeb550941ffff3f40",
  measurementId: "G-TPT7QMWDYE"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const storage = getStorage(app);

let userId = ""; // Replace with MetaMask or auth uid

window.onload = () => {
  // TEMP: prompt for ID
  userId = prompt("Enter your Wallet or Username (temp)");

  // Load profile if exists
  get(child(ref(db), 'users/' + userId)).then(snapshot => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      document.getElementById("name").value = data.name || "";
      document.getElementById("profilePicPreview").src = data.profilePhoto || "default-avatar.png";
      document.getElementById("coverPicPreview").src = data.coverPhoto || "default-cover.jpg";
    }
  });
}

async function uploadImage(file, path) {
  const imageRef = sRef(storage, `drfsocial/${userId}/${path}`);
  await uploadBytes(imageRef, file);
  return getDownloadURL(imageRef);
}

window.saveProfile = async function () {
  const name = document.getElementById("name").value;
  let profilePhoto = document.getElementById("profilePicPreview").src;
  let coverPhoto = document.getElementById("coverPicPreview").src;

  const profileFile = document.getElementById("profilePic").files[0];
  const coverFile = document.getElementById("coverPic").files[0];

  if (profileFile) profilePhoto = await uploadImage(profileFile, "profile.jpg");
  if (coverFile) coverPhoto = await uploadImage(coverFile, "cover.jpg");

  await set(ref(db, 'users/' + userId), {
    name,
    profilePhoto,
    coverPhoto
  });

  alert("Profile saved!");
};
