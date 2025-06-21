<script type="module">
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
  import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js";

  const firebaseConfig = {
    apiKey: "AIzaSyB-W_j74lsbmJUFnTbJpn79HM62VLmkQC8",
    authDomain: "drfsocial-23a06.firebaseapp.com",
    databaseURL: "https://drfsocial-23a06-default-rtdb.firebaseio.com",
    projectId: "drfsocial-23a06",
    storageBucket: "drfsocial-23a06.appspot.com",
    messagingSenderId: "608135115201",
    appId: "1:608135115201:web:dc999df2c0f37241ff3f40"
  };

  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);

  let allPosts = [];

  const postContainer = document.getElementById("postContainer");

  function renderPosts(posts) {
    postContainer.innerHTML = "";
    posts.forEach(post => {
      const isBoosted = post.boostedUntil && post.boostedUntil > Date.now();
      const boostTag = isBoosted ? `<span class="boost-badge">🔥 BOOSTED</span>` : "";

      const html = `
        <div class="post-card">
          <img src="${post.mediaUrl}" style="width: 100%; border-radius: 8px;" />
          <p>${post.caption}</p>
          ${boostTag}
        </div>
      `;
      postContainer.innerHTML += html;
    });
  }

  function showAllPosts() {
    const now = Date.now();
    const boosted = [];
    const normal = [];

    allPosts.forEach(post => {
      if (post.boostedUntil && post.boostedUntil > now) {
        boosted.push(post);
      } else {
        normal.push(post);
      }
    });

    const sorted = [...boosted, ...normal];
    renderPosts(sorted);
  }

  function showBoostedPosts() {
    const now = Date.now();
    const boostedOnly = allPosts.filter(p => p.boostedUntil && p.boostedUntil > now);
    renderPosts(boostedOnly);
  }

  // Fetch posts from Firebase
  onValue(ref(db, "posts"), snapshot => {
    const data = snapshot.val();
    allPosts = [];

    for (const id in data) {
      allPosts.push({ ...data[id], id });
    }

    showAllPosts(); // default view
  });
</script>
