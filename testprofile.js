// app.js
import { db } from './firebase-config.js';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  orderBy,
  addDoc,
  Timestamp,
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

// Pinata JWT (from you)
const PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI4MDFmMDAxNy04YjZkLTQ2YjYtOGIwZi04Y2NkZWU5NzE4ODIiLCJlbWFpbCI6ImRpZ2l0YWxydWZpeWFAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjNkODdmOWVkOTA0ZGY4OTI2NTRjIiwic2NvcGVkS2V5U2VjcmV0IjoiYTI3OWU4ODU0ZDQ0YWY2Y2IxNzA0N2RhOThhYTc3MmExOTAyMmFhYTIwOTQ5YjEzN2Y5ZmIxMDI3YzAzYmY5ZiIsImV4cCI6MTc4MDQyMzA3Mn0.YpqewbjW7gAVyPSKYiO9Ym9QhddKc_1vm8CJIoXDQyA";

export function appInit() {
  const urlParams = new URLSearchParams(window.location.search);
  const publicWallet = urlParams.get("wallet");

  const profileFormSection = document.getElementById("profile-form-section");
  const profileDisplaySection = document.getElementById("profile-display-section");
  const postsContainer = document.getElementById("posts-container");

  const profileForm = document.getElementById("profile-form");
  const profilePhotoInput = document.getElementById("profilePhoto");
  const nameInput = document.getElementById("name");
  const walletInput = document.getElementById("wallet");
  const countryInput = document.getElementById("country");
  const genderInput = document.getElementById("gender");
  const ageInput = document.getElementById("age");

  // Display spans for public profile
  const profilePhotoDisplay = document.getElementById("profilePhotoDisplay");
  const displayName = document.getElementById("displayName");
  const displayWallet = document.getElementById("displayWallet");
  const displayCountry = document.getElementById("displayCountry");
  const displayGender = document.getElementById("displayGender");
  const displayAge = document.getElementById("displayAge");

  const postFormSection = document.getElementById("post-form-section");
  const postForm = document.getElementById("post-form");
  const postTextInput = document.getElementById("postText");
  const postMediaInput = document.getElementById("postMedia");
  const postsList = document.getElementById("posts-list");

  // Utility: Upload file to Pinata and return IPFS URL
  async function uploadFileToPinata(file) {
    const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Pinata upload failed: ${text}`);
    }

    const data = await res.json();
    // Return the IPFS gateway URL for display
    return `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
  }

  // Save profile data in Firestore
  async function saveProfile(profile) {
    const wallet = profile.wallet.toLowerCase();
    const profileRef = doc(db, "profiles", wallet);

    await setDoc(profileRef, profile);
  }

  // Load profile from Firestore by wallet
  async function loadProfile(wallet) {
    const profileRef = doc(db, "profiles", wallet.toLowerCase());
    const docSnap = await getDoc(profileRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  }

  // Save post in Firestore
  async function savePost(wallet, post) {
    const postsCol = collection(db, "profiles", wallet.toLowerCase(), "posts");
    await addDoc(postsCol, post);
  }

  // Load posts for wallet ordered by timestamp desc
  async function loadPosts(wallet) {
    const postsCol = collection(db, "profiles", wallet.toLowerCase(), "posts");
    const q = query(postsCol, orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);
    const posts = [];
    querySnapshot.forEach(doc => {
      posts.push({ id: doc.id, ...doc.data() });
    });
    return posts;
  }

  // Render profile to public display
  function renderProfile(profile) {
    profilePhotoDisplay.src = profile.photoURL || "";
    displayName.textContent = profile.name || "";
    displayWallet.textContent = profile.wallet || "";
    displayCountry.textContent = profile.country || "";
    displayGender.textContent = profile.gender || "";
    displayAge.textContent = profile.age || "";
  }

  // Render posts timeline
  function renderPosts(posts) {
    postsList.innerHTML = "";
    if (posts.length === 0) {
      postsList.innerHTML = "<p>No posts yet.</p>";
      return;
    }

    posts.forEach(post => {
      const postEl = document.createElement("div");
      postEl.className = "post";

      const timeStr = post.timestamp?.toDate
        ? post.timestamp.toDate().toLocaleString()
        : new Date(post.timestamp).toLocaleString();

      let mediaHTML = "";
      if (post.mediaURL) {
        if (post.mediaType === "video") {
          mediaHTML = `<video src="${post.mediaURL}" controls style="max-width:100%; max-height:300px;"></video>`;
        } else {
          mediaHTML = `<img src="${post.mediaURL}" alt="Post media" style="max-width:100%; max-height:300px;" />`;
        }
      }

      postEl.innerHTML = `
        <p>${post.text ? escapeHtml(post.text) : ""}</p>
        ${mediaHTML}
        <small>Posted on: ${timeStr}</small>
        <hr/>
      `;

      postsList.appendChild(postEl);
    });
  }

  // Escape HTML to prevent XSS
  function escapeHtml(text) {
    return text.replace(/[&<>"']/g, function (m) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[m];
    });
  }

  // If URL has ?wallet=0x... show public profile + posts
  if (publicWallet) {
    profileFormSection.style.display = "none";
    profileDisplaySection.style.display = "block";
    postsContainer.style.display = "block";

    (async () => {
      const profile = await loadProfile(publicWallet);
      if (profile) {
        renderProfile(profile);
      } else {
        profileDisplaySection.innerHTML = "<p>Profile not found.</p>";
      }

      const posts = await loadPosts(publicWallet);
      renderPosts(posts);
    })();

  } else {
    // Otherwise show profile form + posts form for creating own profile + posts
    profileFormSection.style.display = "block";
    profileDisplaySection.style.display = "none";
    postsContainer.style.display = "block";

    // Load saved profile from localStorage to prefill wallet (optional)
    const savedWallet = localStorage.getItem("userWallet");
    if (savedWallet) walletInput.value = savedWallet;

    // Handle profile form submit
    profileForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const profile = {
        name: nameInput.value.trim(),
        wallet: walletInput.value.trim().toLowerCase(),
        country: countryInput.value.trim(),
        gender: genderInput.value,
        age: ageInput.value ? Number(ageInput.value) : null,
        photoURL: "",
        updatedAt: Timestamp.now(),
      };

      if (!profile.wallet) {
        alert("Wallet address is required.");
        return;
      }

      // If user selected photo, upload to Pinata
      if (profilePhotoInput.files.length > 0) {
        try {
          profile.photoURL = await uploadFileToPinata(profilePhotoInput.files[0]);
        } catch (err) {
          alert("Error uploading profile photo: " + err.message);
          return;
        }
      } else {
        // Try keep existing photoURL if editing profile (load existing profile first)
        const existing = await loadProfile(profile.wallet);
        if (existing && existing.photoURL) profile.photoURL = existing.photoURL;
      }

      try {
        await saveProfile(profile);
        alert("Profile saved successfully!");
        localStorage.setItem("userWallet", profile.wallet);
      } catch (err) {
        alert("Error saving profile: " + err.message);
      }
    });

    // Handle post form submit
    postForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const wallet = walletInput.value.trim().toLowerCase();
      if (!wallet) {
        alert("Please create your profile with a wallet address first.");
        return;
      }

      const post = {
        text: postTextInput.value.trim(),
        mediaURL: "",
        mediaType: "",
        timestamp: Timestamp.now(),
      };

      if (!post.text && postMediaInput.files.length === 0) {
        alert("Post must have some text or media.");
        return;
      }

      if (postMediaInput.files.length > 0) {
        try {
          const mediaURL = await uploadFileToPinata(postMediaInput.files[0]);
          post.mediaURL = mediaURL;
          const fileType = postMediaInput.files[0].type;
          if (fileType.startsWith("video/")) {
            post.mediaType = "video";
          } else {
            post.mediaType = "image";
          }
        } catch (err) {
          alert("Error uploading post media: " + err.message);
          return;
        }
      }

      try {
        await savePost(wallet, post);
        alert("Post created!");
        postTextInput.value = "";
        postMediaInput.value = "";
        // Reload posts
        const posts = await loadPosts(wallet);
        renderPosts(posts);
      } catch (err) {
        alert("Error saving post: " + err.message);
      }
    });
  }
}
