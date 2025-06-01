// File: moderator.js

document.addEventListener("DOMContentLoaded", () => {
  const videos = [
    { id: 101, title: "User Video 1" },
    { id: 102, title: "User Video 2" },
  ];

  const list = document.getElementById("videoList");

  videos.forEach((v) => {
    const div = document.createElement("div");
    div.innerHTML = `<h4>${v.title}</h4><button onclick="flagVideo(${v.id})">Flag</button>`;
    list.appendChild(div);
  });
});

function flagVideo(id) {
  alert(`Moderator flagged video ID ${id} for review.`);
}
