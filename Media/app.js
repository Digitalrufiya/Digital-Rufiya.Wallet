import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getDatabase, ref, push, update, onValue } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";
import { getAuth, signInWithPopup, signOut, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";

// Firebase config - replace with your own config if needed
const firebaseConfig = {
  apiKey: "AIzaSyB-W_j74lsbmJUFnTbJpn79HM62VLmkQC8",
  authDomain: "drfsocial-23a06.firebaseapp.com",
  databaseURL: "https://drfsocial-23a06-default-rtdb.firebaseio.com",
  projectId: "drfsocial-23a06",
  storageBucket: "drfsocial-23a06.appspot.com",
  messagingSenderId: "608135115201",
  appId: "1:608135115201:web:dc999df2c0f37241ff3f40"
};

// Pinata JWT for media upload - replace with your own for security
const pinataJWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI4MDFmMDAxNy04YjZkLTQ2YjYtOGIwZi04Y2NkZWU5NzE4ODIiLCJlbWFpbCI6ImRpZ2l0YWxydWZpeWFAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsImlhdCI6MTY4ODMyMDMxNiwiZXhwIjoxOTk4ODc2MzE2fQ.J1ymQ7tmVftRDFlKdYWUsHWnT6mXlcvNNokq6cIFngk";

// Firebase init
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

let currentUser = null;

// DOM Elements
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const filterMyPostsBtn = document.getElementById("filterMyPosts");
const uploadForm = document.getElementById("uploadForm");
const mediaFileInput = document.getElementById("mediaFile");
const captionInput = document.getElementById("caption");
const postContainer = document.getElementById("postContainer");
const loadingSpinner = document.getElementById("loadingSpinner");
const searchBar = document.getElementById("searchBar");
const menuToggle = document.getElementById("menuToggle");
const primaryNav = document.getElementById("primaryNav");
const darkModeToggle = document.getElementById("darkModeToggle");
const loginNavLink = document.getElementById("loginNavLink");
const logoutNavLink = document.getElementById("logoutNavLink");
const profileLink = document.getElementById("profileLink");

let showOnlyMyPosts = false;
let postsData = {};
let filteredPosts = {};

// Utilities
const formatTimestamp = ts => {
  const date = new Date(ts);
  return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
};

const truncateText = (text, max = 150) => {
  if (!text) return "";
  if (text.length <= max) return text;
  return text.slice(0, max) + "...";
};

// Toggle nav menu (mobile)
menuToggle.addEventListener("click", () => {
  const expanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", !expanded);
});

// Dark mode toggle
const loadDarkMode = () => {
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
    darkModeToggle.textContent = "☀️ Light Mode";
  }
};
loadDarkMode();
darkModeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  darkModeToggle.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
  localStorage.setItem("darkMode", isDark.toString());
});

// Auth
loginBtn.addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    currentUser = result.user;
  } catch (e) {
    alert("Login failed: " + e.message);
  }
});

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  currentUser = null;
  showOnlyMyPosts = false;
  filterMyPostsBtn.style.display = "none";
  uploadForm.style.display = "none";
  loginBtn.style.display = "inline-block";
  logoutBtn.style.display = "none";
  loginNavLink.style.display = "inline-block";
  logoutNavLink.style.display = "none";
  profileLink.style.display = "none";
  renderPosts();
});

loginNavLink.addEventListener("click", e => {
  e.preventDefault();
  loginBtn.click();
});
logoutNavLink.addEventListener("click", e => {
  e.preventDefault();
  logoutBtn.click();
});

onAuthStateChanged(auth, user => {
  currentUser = user;
  if (user) {
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
    loginNavLink.style.display = "none";
    logoutNavLink.style.display = "inline-block";
    profileLink.style.display = "inline-block";
    profileLink.textContent = user.displayName || user.email || "Profile";
    uploadForm.style.display = "block";
    filterMyPostsBtn.style.display = "inline-block";
  } else {
    loginBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
    loginNavLink.style.display = "inline-block";
    logoutNavLink.style.display = "none";
    profileLink.style.display = "none";
    uploadForm.style.display = "none";
    filterMyPostsBtn.style.display = "none";
    showOnlyMyPosts = false;
  }
  renderPosts();
});

// Upload form submission
uploadForm.addEventListener("submit", async e => {
  e.preventDefault();
  if (!currentUser) {
    alert("Please login to upload posts.");
    return;
  }
  if (mediaFileInput.files.length === 0) {
    alert("Please select a media file.");
    return;
  }
  const file = mediaFileInput.files[0];
  const caption = captionInput.value.trim();
  if (caption.length < 4) {
    alert("Caption must be at least 4 characters.");
    return;
  }

  uploadForm.querySelector("button[type='submit']").disabled = true;
  loadingSpinner.style.display = "block";
  loadingSpinner.textContent = "Uploading media...";

  try {
    const mediaURL = await uploadToPinata(file);
    const postId = push(ref(db, "posts")).key;
    const newPost = {
      postId,
      userId: currentUser.uid,
      userName: currentUser.displayName || currentUser.email || "Anonymous",
      userPhotoURL: currentUser.photoURL || null,
      mediaURL,
      caption,
      timestamp: Date.now(),
      likes: {},
      comments: {}
    };
    await update(ref(db, `posts/${postId}`), newPost);
    captionInput.value = "";
    mediaFileInput.value = "";
    loadingSpinner.textContent = "Upload successful! Refreshing posts...";
  } catch (error) {
    alert("Upload failed: " + error.message);
  } finally {
    loadingSpinner.style.display = "none";
    uploadForm.querySelector("button[type='submit']").disabled = false;
  }
});

// Upload media to Pinata via Pinata API
async function uploadToPinata(file) {
  const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: pinataJWT
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error("Pinata upload failed");
  }
  const data = await response.json();
  return `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
}

// Load posts from Firebase Realtime Database
function loadPosts() {
  loadingSpinner.style.display = "block";
  loadingSpinner.textContent = "Loading posts...";
  const postsRef = ref(db, "posts");
  onValue(postsRef, snapshot => {
    postsData = snapshot.val() || {};
    applyFiltersAndRender();
    loadingSpinner.style.display = "none";
  }, error => {
    loadingSpinner.style.display = "none";
    alert("Failed to load posts: " + error.message);
  });
}

// Filter & render posts
function applyFiltersAndRender() {
  const searchTerm = searchBar.value.toLowerCase().trim();
  filteredPosts = {};
  for (const postId in postsData) {
    const post = postsData[postId];
    if (showOnlyMyPosts && (!currentUser || post.userId !== currentUser.uid)) continue;
    if (searchTerm) {
      const captionMatch = post.caption.toLowerCase().includes(searchTerm);
      const userMatch = (post.userName || "").toLowerCase().includes(searchTerm);
      if (!captionMatch && !userMatch) continue;
    }
    filteredPosts[postId] = post;
  }
  renderPosts();
}

// Render posts in DOM
function renderPosts() {
  postContainer.innerHTML = "";

  const postsArray = Object.values(filteredPosts);
  if (postsArray.length === 0) {
    postContainer.innerHTML = "<p>No posts to show.</p>";
    return;
  }

  // Sort descending by timestamp
  postsArray.sort((a,b) => b.timestamp - a.timestamp);

  for (const post of postsArray) {
    const postEl = createPostElement(post);
    postContainer.appendChild(postEl);
  }
}

// Create a single post element
function createPostElement(post) {
  const container = document.createElement("article");
  container.className = "post-item";
  container.tabIndex = 0;
  container.setAttribute("aria-label", `Post by ${post.userName}, posted on ${formatTimestamp(post.timestamp)}`);

  // Owner
  const ownerDiv = document.createElement("div");
  ownerDiv.className = "post-owner";
  ownerDiv.textContent = post.userName || "Anonymous";
  container.appendChild(ownerDiv);

  // Time
  const timeDiv = document.createElement("div");
  timeDiv.className = "post-time";
  timeDiv.textContent = formatTimestamp(post.timestamp);
  container.appendChild(timeDiv);

  // Media
  if (post.mediaURL) {
    if (post.mediaURL.match(/\.(mp4|webm|ogg)$/i)) {
      const video = document.createElement("video");
      video.src = post.mediaURL;
      video.controls = true;
      video.preload = "metadata";
      video.setAttribute("aria-label", "Video post media");
      container.appendChild(video);
    } else {
      const img = document.createElement("img");
      img.src = post.mediaURL;
      img.alt = `Post media by ${post.userName}`;
      container.appendChild(img);
    }
  }

  // Caption
  const captionDiv = document.createElement("div");
  captionDiv.className = "post-caption";
  captionDiv.textContent = post.caption;
  container.appendChild(captionDiv);

  // Actions (Likes + Comments)
  const actionsDiv = document.createElement("div");
  actionsDiv.className = "post-actions";

  // Likes count
  const likeBtn = document.createElement("button");
  likeBtn.type = "button";
  likeBtn.ariaLabel = "Like post";
  const userHasLiked = currentUser && post.likes && post.likes[currentUser.uid];
  likeBtn.innerHTML = `👍 <span>${post.likes ? Object.keys(post.likes).length : 0}</span>`;
  if (userHasLiked) likeBtn.style.color = "var(--primary-hover)";
  likeBtn.addEventListener("click", () => toggleLike(post));
  actionsDiv.appendChild(likeBtn);

  // Comments count + toggle
  const commentsBtn = document.createElement("button");
  commentsBtn.type = "button";
  commentsBtn.ariaLabel = "Toggle comments";
  commentsBtn.innerHTML = `💬 <span>${post.comments ? Object.keys(post.comments).length : 0}</span>`;
  actionsDiv.appendChild(commentsBtn);

  container.appendChild(actionsDiv);

  // Comments Section (hidden by default)
  const commentsSection = document.createElement("section");
  commentsSection.className = "comment-section";
  commentsSection.style.display = "none";
  container.appendChild(commentsSection);

  // Show/hide comments on toggle
  commentsBtn.addEventListener("click", () => {
    commentsSection.style.display = commentsSection.style.display === "none" ? "block" : "none";
    if (commentsSection.style.display === "block") {
      renderComments(post, commentsSection);
      createCommentForm(post, commentsSection);
    } else {
      commentsSection.innerHTML = "";
    }
  });

  return container;
}

// Toggle like/unlike
async function toggleLike(post) {
  if (!currentUser) {
    alert("Please login to like posts.");
    return;
  }
  const postLikesRef = ref(db, `posts/${post.postId}/likes`);
  const userLikeRef = ref(db, `posts/${post.postId}/likes/${currentUser.uid}`);

  if (post.likes && post.likes[currentUser.uid]) {
    // Unlike
    await update(userLikeRef, null);
  } else {
    // Like
    await update(userLikeRef, true);
  }
}

// Render comments
function renderComments(post, container) {
  container.innerHTML = "";
  if (!post.comments) return;

  const commentsArr = Object.values(post.comments);
  commentsArr.sort((a,b) => a.timestamp - b.timestamp);

  for (const comment of commentsArr) {
    const commentEl = document.createElement("div");
    commentEl.className = "comment-item";

    const authorSpan = document.createElement("span");
    authorSpan.className = "comment-author";
    authorSpan.textContent = comment.userName || "Anonymous";

    const textSpan = document.createElement("span");
    textSpan.className = "comment-text";
    textSpan.textContent = comment.text;

    commentEl.appendChild(authorSpan);
    commentEl.appendChild(textSpan);
    container.appendChild(commentEl);
  }
}

// Create comment form under comments
function createCommentForm(post, container) {
  if (!currentUser) {
    const loginNotice = document.createElement("p");
    loginNotice.textContent = "Login to comment.";
    container.appendChild(loginNotice);
    return;
  }

  const form = document.createElement("form");
  form.setAttribute("aria-label", "Add a comment form");

  const textarea = document.createElement("textarea");
  textarea.required = true;
  textarea.placeholder = "Write a comment...";
  textarea.style.width = "100%";
  textarea.style.minHeight = "40px";
  textarea.style.marginTop = "8px";
  textarea.maxLength = 300;
  form.appendChild(textarea);

  const submitBtn = document.createElement("button");
  submitBtn.type = "submit";
  submitBtn.textContent = "Comment";
  submitBtn.style.marginTop = "6px";
  submitBtn.style.padding = "6px 14px";
  submitBtn.style.border = "none";
  submitBtn.style.borderRadius = "8px";
  submitBtn.style.backgroundColor = "var(--primary-color)";
  submitBtn.style.color = "white";
  submitBtn.style.cursor = "pointer";
  form.appendChild(submitBtn);

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const text = textarea.value.trim();
    if (text.length < 2) {
      alert("Comment must be at least 2 characters.");
      return;
    }
    submitBtn.disabled = true;

    try {
      const commentId = push(ref(db, `posts/${post.postId}/comments`)).key;
      const newComment = {
        commentId,
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email || "Anonymous",
        text,
        timestamp: Date.now()
      };
      await update(ref(db, `posts/${post.postId}/comments/${commentId}`), newComment);
      textarea.value = "";
      renderComments(post, container);
    } catch (err) {
      alert("Failed to add comment: " + err.message);
    } finally {
      submitBtn.disabled = false;
    }
  });

  container.appendChild(form);
}

// Search bar input
searchBar.addEventListener("input", () => {
  applyFiltersAndRender();
});

// Filter my posts toggle
filterMyPostsBtn.addEventListener("click", () => {
  if (!currentUser) return;
  showOnlyMyPosts = !showOnlyMyPosts;
  filterMyPostsBtn.textContent = showOnlyMyPosts ? "Show All Posts" : "Show Only My Posts";
  applyFiltersAndRender();
});

// Initialize
loadPosts();
