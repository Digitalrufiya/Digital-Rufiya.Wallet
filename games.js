async function donatePoints() {
  if (points === 0) {
    document.getElementById('donation-msg').innerText = "You have no points to donate.";
    return;
  }

  const name = prompt("Enter your name or wallet address:");
  if (!name) return;

  // Send to Google Apps Script
  const res = await fetch("https://script.google.com/macros/s/AKfycbx-oH3Xu7FiUQ-_ku8Hu_eHlMfcESlIJwgNXVWlc6HkfG70Cgi_uZH6-bs3rgq-f892/exec", {
    method: "POST",
    mode: "no-cors", // if your script allows CORS, you can use 'cors' and handle the JSON
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, points }),
  });

  // Update local leaderboard
  leaderboard.push({ name, points });
  leaderboard.sort((a, b) => b.points - a.points);
  updateLeaderboard();

  points = 0;
  document.getElementById('points').innerText = points;
  document.getElementById('donation-msg').innerText = `Thank you, ${name}! Your ${points} points were donated. 🌟`;
}
