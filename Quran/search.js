function searchQuran() {
  const input = document.getElementById('searchInput').value.toLowerCase().trim();
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '';

  if (!input) return;

  const results = quran.filter(ayah =>
    ayah.arabic.toLowerCase().includes(input) ||
    ayah.english.toLowerCase().includes(input)
  );

  if (results.length === 0) {
    resultsDiv.innerHTML = '<p>No results found.</p>';
    return;
  }

  results.forEach(ayah => {
    const div = document.createElement('div');
    div.className = 'ayah-card';
    div.innerHTML = `<p>${ayah.arabic}</p><p><em>${ayah.english}</em></p>`;
    resultsDiv.appendChild(div);
  });
}
