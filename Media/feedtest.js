<!-- feed.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Boosted Feed — DRFMedia</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h1>🔥 Trending Posts</h1>
  <input type="search" id="search" placeholder="Search by user or caption" />
  <select id="sort">
    <option value="latest">Sort by: Newest</option>
    <option value="likes">Most Liked</option>
    <option value="boosted">Most Boosted</option>
  </select>
  <div id="postList"></div>

  <script type="module">
    import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
    import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-database.js";
    const app = initializeApp({
      apiKey: "AIzaSyB-W_j74lsbmJUFnTbJpn79HM62VLmkQC8",
      authDomain: "drfsocial-23a06.firebaseapp.com",
      databaseURL: "https://drfsocial-23a06-default-rtdb.firebaseio.com",
      projectId: "drfsocial-23a06",
      storageBucket: "drfsocial-23a06.appspot.com",
      messagingSenderId: "608135115201",
      appId: "1:608135115201:web:dc999df2c0f37241ff3f40"
    });
    const db = getDatabase(app);

    const searchInput = document.getElementById("search");
    const sortInput = document.getElementById("sort");
    const postList = document.getElementById("postList");

    let allPosts = [];

    onValue(ref(db, "posts"), (snap) => {
      allPosts = [];
      snap.forEach((child) => {
        const val = child.val();
        val.id = child.key;
        allPosts.push(val);
      });
      render();
    });

    searchInput.oninput = render;
    sortInput.onchange = render;

    function render() {
      const now = Date.now();
      const keyword = searchInput.value.toLowerCase();
      let results = allPosts.filter(p =>
        (p.caption && p.caption.toLowerCase().includes(keyword)) ||
        (p.displayName && p.displayName.toLowerCase().includes(keyword))
      );

      if (sortInput.value === "likes") {
        results.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0));
      } else if (sortInput.value === "boosted") {
        results.sort((a, b) => (b.boostPaid || 0) - (a.boostPaid || 0));
      } else {
        results.sort((a, b) => b.timestamp - a.timestamp);
      }

      postList.innerHTML = "";
      for (const post of results) {
        const boosted = post.boostedUntil && post.boostedUntil > now;
        const el = document.createElement("div");
        el.className = "feed-post";
        el.innerHTML = `
          <div><strong>${post.displayName}</strong> (${new Date(post.timestamp).toLocaleString()})</div>
          ${post.mediaType === "video"
            ? `<video src="${post.mediaUrl}" controls></video>`
            : `<img src="${post.mediaUrl}" width="200"/>`}
          <div>${post.caption}</div>
          <div>❤️ ${post.likesCount || 0}</div>
          ${boosted ? `<div style="color:green">🚀 Boosted (${Math.round((post.boostedUntil - now)/86400000)} days left)</div>` : ""}
        `;
        postList.appendChild(el);
      }
    }
  </script>
</body>
</html>
