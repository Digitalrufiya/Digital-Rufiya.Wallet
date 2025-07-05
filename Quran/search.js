function searchQuran() {
  const input = document.getElementById('searchInput').value.trim().toLowerCase();
  const resultsContainer = document.getElementById('results');
  resultsContainer.innerHTML = '';

  if (!input) return;

  const filtered = quran.filter(verse =>
    verse.arabic.includes(input) || verse.english.toLowerCase().includes(input)
  );

  if (filtered.length === 0) {
    resultsContainer.innerHTML = '<p>No results found.</p>';
    return;
  }

  filtered.forEach(verse => {
    const card = document.createElement('div');
    card.className = 'ayah-card';
    card.innerHTML = `
      <p><strong>Verse ${verse.verse}</strong></p>
      <p>${verse.arabic}</p>
      <p><small>${verse.english}</small></p>
    `;
    resultsContainer.appendChild(card);
  });
}

// Attach event listener if you want JS-only way instead of inline HTML
document.getElementById('searchInput').addEventListener('keyup', searchQuran);
