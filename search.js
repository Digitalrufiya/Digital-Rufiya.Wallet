// Assumes quranData = [{surahNumber, surahNameEnglish, surahNameArabic, ayahs: [{verse, textArabic, textEnglish}]}]

// Normalize strings for easier matching
function normalize(str) {
  return str.toLowerCase().replace(/[^a-z0-9ء-ي ]/g, '').trim();
}

// Remove filler words like "surah", "verse", "ayah"
function removeFillers(str) {
  return str.replace(/\b(surah|verse|ayah|verses)\b/gi, '').trim();
}

// Find surahs by partial name match (English or Arabic)
function findSurahsByPartialName(input) {
  let normInput = normalize(input);
  return quranData.filter(surah => {
    return normalize(surah.surahNameEnglish).includes(normInput) || 
           normalize(surah.surahNameArabic).includes(normInput);
  });
}

// Get exact verse from surah number and verse number
function getVerse(surahNumber, verseNumber) {
  let surah = quranData.find(s => s.surahNumber === surahNumber);
  if (!surah) return null;
  let ayah = surah.ayahs.find(a => a.verse === verseNumber);
  if (!ayah) return null;
  return {
    surahNumber: surah.surahNumber,
    surahNameEnglish: surah.surahNameEnglish,
    surahNameArabic: surah.surahNameArabic,
    verseNumber: ayah.verse,
    textArabic: ayah.textArabic,
    textEnglish: ayah.textEnglish
  };
}

// Main search function called on input
function searchQuran() {
  let input = document.getElementById('searchInput').value;
  input = removeFillers(input);
  if (!input) {
    displayResults([]);
    return;
  }

  let parts = input.split(' ');
  let possibleNumber = parts[parts.length - 1];
  let surahPart = parts.slice(0, parts.length - 1).join(' ');

  if (!isNaN(possibleNumber)) {
    // Input ends with number: treat as surah + verse number
    let verseNumber = parseInt(possibleNumber, 10);
    let matchedSurahs = findSurahsByPartialName(surahPart);
    
    if (matchedSurahs.length === 1) {
      // Exact surah found, show the exact verse if exists
      let verse = getVerse(matchedSurahs[0].surahNumber, verseNumber);
      if (verse) {
        displayResults([verse]);
      } else {
        displayResults([`Verse ${verseNumber} not found in Surah ${matchedSurahs[0].surahNameEnglish}`]);
      }
    } else if (matchedSurahs.length > 1) {
      // Multiple surahs matched, show list for user to refine
      displaySurahList(matchedSurahs);
    } else {
      // No surah matched, fallback to searching surah names without number
      let fallbackSurahs = findSurahsByPartialName(input);
      if (fallbackSurahs.length) displaySurahList(fallbackSurahs);
      else displayResults(['No results found']);
    }

  } else {
    // Input does not end with number: search surah names only
    let matchedSurahs = findSurahsByPartialName(input);
    if (matchedSurahs.length === 1) {
      // Show first 5 verses of matched surah as preview
      displaySurahPreview(matchedSurahs[0]);
    } else if (matchedSurahs.length > 1) {
      // Show list of matching surahs
      displaySurahList(matchedSurahs);
    } else {
      displayResults(['No results found']);
    }
  }
}

// Display list of surahs for user to select
function displaySurahList(surahList) {
  let html = '<ul>';
  surahList.forEach(surah => {
    html += `<li><strong>${surah.surahNameEnglish}</strong> - ${surah.surahNameArabic} (Surah ${surah.surahNumber})</li>`;
  });
  html += '</ul>';
  document.getElementById('results').innerHTML = html;
}

// Display preview of first few verses of a surah
function displaySurahPreview(surah) {
  let html = `<h2>${surah.surahNameEnglish} - ${surah.surahNameArabic} (Surah ${surah.surahNumber})</h2>`;
  surah.ayahs.slice(0, 5).forEach(ayah => {
    html += `<p><b>Verse ${ayah.verse}:</b> ${ayah.textArabic}<br><i>${ayah.textEnglish}</i></p>`;
  });
  document.getElementById('results').innerHTML = html;
}

// Display search results (verses or messages)
function displayResults(results) {
  if (!results || results.length === 0) {
    document.getElementById('results').innerHTML = '<p>No results found.</p>';
    return;
  }
  if (typeof results[0] === 'string') {
    // Show messages
    document.getElementById('results').innerHTML = results.map(r => `<p>${r}</p>`).join('');
    return;
  }
  // Show verses
  let html = '';
  results.forEach(r => {
    html += `<h2>${r.surahNameEnglish} - ${r.surahNameArabic} (Surah ${r.surahNumber})</h2>`;
    html += `<p><b>Verse ${r.verseNumber}:</b> ${r.textArabic}<br><i>${r.textEnglish}</i></p>`;
  });
  document.getElementById('results').innerHTML = html;
}
