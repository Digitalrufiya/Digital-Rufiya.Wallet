// Search Engine Logic
function performSearch() {
  const query = document.getElementById('searchInput').value.trim();
  const engine = document.getElementById('engineSelect').value;

  if (!query) return;

  let searchUrl = '';

  switch (engine) {
    case 'google':
      searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      break;
    case 'duckduckgo':
      searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
      break;
    case 'bing':
      searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
      break;
  }

  window.open(searchUrl, '_blank');
}

// Quran API Integration
async function loadSurahs() {
  const res = await fetch('https://api.alquran.cloud/v1/surah');
  const data = await res.json();
  const select = document.getElementById('surahSelect');

  data.data.forEach(surah => {
    const option = document.createElement('option');
    option.value = surah.number;
    option.textContent = `${surah.number}. ${surah.englishName} (${surah.englishNameTranslation})`;
    select.appendChild(option);
  });

  select.addEventListener('change', loadAyahs);
}

async function loadAyahs() {
  const surahNumber = document.getElementById('surahSelect').value;
  const container = document.getElementById('ayahsContainer');
  container.innerHTML = 'Loading...';

  const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/en.asad`);
  const data = await res.json();

  container.innerHTML = '';
  data.data.ayahs.forEach(ayah => {
    const p = document.createElement('p');
    p.textContent = `${ayah.numberInSurah}. ${ayah.text}`;
    container.appendChild(p);
  });
}

window.onload = loadSurahs;
