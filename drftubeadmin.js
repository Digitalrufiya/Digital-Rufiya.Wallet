// Drftubeadmin.js - Admin Panel Logic

function deleteVideo(videoId) {
  alert(`Video ID ${videoId} has been deleted.`);
  // Simulate smart contract or backend call here
  const listItem = document.querySelector(`li:has(button[onclick*="${videoId}"])`);
  if (listItem) listItem.remove();
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("Admin Panel Ready");
});
