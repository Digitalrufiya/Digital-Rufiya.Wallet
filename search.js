// search.js

function searchQuran() {
  const input = document.getElementById('searchInput').value.trim().toLowerCase();
  const resultsDiv = document.getElementById('results');

  if (input.length === 0) {
    resultsDiv.innerHTML = '';
    return;
  }

  // Filter verses based on input
  const filtered = quranData.filter(verse => {
    // Convert fields to lowercase for comparison
    const arabic = verse.arabic.toLowerCase();
    const english = verse.english.toLowerCase();
    const surahStr = verse.surah.toString();
    const ayahStr = verse.ayah.toString();

    // Conditions to match user input anywhere in Arabic or English text
    // or partial match with surah or ayah numbers
    return (
      arabic.includes(input) ||
      english.includes(input) ||
      surahStr.startsWith(input) ||
      ayahStr.startsWith(input)
    );
  });

  if (filtered.length === 0) {
    resultsDiv.innerHTML = `<p>No results found for "<strong>${input}</strong>"</p>`;
    return;
  }

  // Build HTML results output
  let html = '';
  filtered.forEach(v => {
    html += `
      <div style="padding: 10px; border-bottom: 1px solid #ddd;">
        <div><strong>Surah ${v.surah}, Ayah ${v.ayah}</strong></div>
        <div style="font-size: 1.3rem; font-weight: 700; direction: rtl;">${v.arabic}</div>
        <div style="font-style: italic; color: #555;">${v.english}</div>
      </div>`;
  });

  resultsDiv.innerHTML = html;
}
