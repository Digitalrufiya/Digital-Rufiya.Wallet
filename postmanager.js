// DOM Elements
const postText = document.getElementById("postText");
const mediaInput = document.getElementById("mediaInput");
const mediaPreview = document.getElementById("mediaPreview");
const feed = document.getElementById("feed");
const usernameInput = document.getElementById("username");

// Username persistence
let username = localStorage.getItem("drf_username") || "";
if (username) {
  usernameInput.value = username;
  usernameInput.style.display = "none";
}

// Load saved posts
let posts = JSON.parse(localStorage.getItem("drf_posts") || "[]");

// Media preview
mediaInput.addEventListener("change", () => {
  const file = mediaInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = e => {
      mediaPreview.innerHTML = file.type.startsWith("video")
        ? `<video controls src="${e.target.result}"></video>`
        : `<img src="${e.target.result}" />`;
    };
    reader.readAsDataURL(file);
  }
});

// Create new post
function createPost() {
  username = usernameInput.value.trim() || "Anonymous";
  if (!localStorage.getItem("drf_username")) {
    localStorage.setItem("drf_username", username);
    usernameInput.style.display = "none";
  }

  const text = postText.value.trim();
  const file = mediaInput.files[0];

  if (!text && !file) return alert("Write something or upload media.");

  if (file) {
    const reader = new FileReader();
    reader.onload = e => {
      const media = e.target.result;
      savePost(username, text, media, file.type);
    };
    reader.readAsDataURL(file);
  } else {
    savePost(username, text, "", "");
  }
}

// Save post to localStorage
function savePost(username, text, media, type) {
  const post = {
    id: Date.now(),
    username,
    text,
    media,
    type,
    reactions: { like: 0, love: 0, haha: 0, angry: 0, sad: 0 },
    comments: []
  };
  posts.unshift(post);
  localStorage.setItem("drf_posts", JSON.stringify(posts));
  renderPosts();
  clearPostForm();
}

// React to post
function react(id, type) {
  const post = posts.find(p => p.id === id);
  if (post) {
    post.reactions[type]++;
    localStorage.setItem("drf_posts", JSON.stringify(posts));
    renderPosts();
  }
}

// Add comment
function addComment(id, input) {
  const comment = input.value.trim();
  if (comment) {
    const post = posts.find(p => p.id === id);
    if (post) {
      post.comments.push(comment);
      localStorage.setItem("drf_posts", JSON.stringify(posts));
      renderPosts();
    }
  }
}

// Clear form after posting
function clearPostForm() {
  postText.value = "";
  mediaPreview.innerHTML = "";
  mediaInput.value = "";
}

// Render all posts
function renderPosts() {
  feed.innerHTML = "";
  posts.forEach(post => {
    const div = document.createElement("div");
    div.className = "post";
    div.innerHTML = `
      <div class="username">${post.username}</div>
      <div>${post.text}</div>
      ${post.media ? (
        post.type.startsWith("video")
          ? `<video controls src="${post.media}"></video>`
          : `<img src="${post.media}" />`
      ) : ""}
      <div class="reaction-bar">
        <button onclick="react(${post.id}, 'like')">👍 ${post.reactions.like}</button>
        <button onclick="react(${post.id}, 'love')">❤️ ${post.reactions.love}</button>
        <button onclick="react(${post.id}, 'haha')">😂 ${post.reactions.haha}</button>
        <button onclick="react(${post.id}, 'sad')">😢 ${post.reactions.sad}</button>
        <button onclick="react(${post.id}, 'angry')">😡 ${post.reactions.angry}</button>
      </div>
      <div class="comment-box">
        ${post.comments.map(c => `<div>${c}</div>`).join("")}
        <input placeholder="Write a comment..." onkeypress="if(event.key==='Enter')addComment(${post.id}, this)" />
      </div>
    `;
    feed.appendChild(div);
  });
}

// Initial render
renderPosts();
