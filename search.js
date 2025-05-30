
function searchQuran() {
    const input = document.getElementById('searchInput').value.toLowerCase();
    const results = document.getElementById('results');
    results.innerHTML = '';
    if (input.length === 0) return;
    
    const matches = quran.filter(verse =>
        verse.arabic.includes(input) ||
        verse.english.toLowerCase().includes(input)
    );

    if (matches.length === 0) {
        results.innerHTML = '<p>No matches found.</p>';
        return;
    }

    matches.forEach(verse => {
        const div = document.createElement('div');
        div.classList.add('verse');
        div.innerHTML = `<strong>Surah ${verse.surah} - Ayah ${verse.ayah}</strong><br>
                         <span class="arabic">${verse.arabic}</span><br>
                         <span class="english">${verse.english}</span>`;
        results.appendChild(div);
    });
}
