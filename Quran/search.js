let quranData = [];

fetch('quran.json')
  .then(res => res.json())
  .then(data => {
    quranData = data;
  });

function searchQuran() {
  const input = document.getElementById("searchInput").value.toLowerCase();
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = '';

  if (input.length < 2) return;

  const results = quranData.filter(verse =>
    verse.text.toLowerCase().includes(input) ||
    (verse.translation && verse.translation.toLowerCase().includes(input))
  );

  if (results.length === 0) {
    resultsDiv.innerHTML = "<p>No results found.</p>";
    return;
  }

  results.slice(0, 20).forEach(verse => {
    const card = document.createElement("div");
    card.className = "ayah-card";
    card.innerHTML = `
      <p><strong>${verse.surah}:${verse.ayah}</strong></p>
      <p>${verse.text}</p>
      <p><small>${verse.translation || ''}</small></p>
    `;
    resultsDiv.appendChild(card);
  });
}
