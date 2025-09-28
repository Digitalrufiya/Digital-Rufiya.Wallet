function sendScore() {
  fetch("https://script.google.com/macros/s/YOUR_DEPLOYED_SCRIPT_ID/exec", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: "Test",
      score: 99
    })
  })
  .then(res => res.json())
  .then(data => console.log("✅ Success:", data))
  .catch(err => console.error("❌ Error:", err));
}
