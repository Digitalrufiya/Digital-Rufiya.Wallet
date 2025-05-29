function performSearch() {
  const query = document.getElementById('searchInput').value.trim();
  const engine = document.getElementById('engineSelect').value;
  let url = '';

  switch (engine) {
    case 'google':
      url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      break;
    case 'duckduckgo':
      url = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
      break;
    case 'bing':
      url = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
      break;
  }

  if (query !== '') {
    window.open(url, '_blank');
  }
}

async function loadRandomVerse() {
  try {
    const randomSurah = Math.floor(Math.random() * 114) + 1;
    const res = await fetch(`https://api.alquran.cloud/v1/ayah/${randomSurah}:1/en.asad`);
    const data = await res.json();
    if (data.code === 200) {
      const verse = data.data.text;
      const surah = data.data.surah.englishName;
      const ayah = data.data.numberInSurah;
      document.getElementById('dailyVerse').innerHTML = `📖 ${verse} — <strong>${surah} [${ayah}]</strong>`;
    }
  } catch (err) {
    document.getElementById('dailyVerse').innerText = 'Unable to load verse. Try again later.';
  }
}

window.onload = loadRandomVerse;
