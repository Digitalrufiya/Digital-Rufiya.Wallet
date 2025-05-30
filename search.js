function searchQuran() {
    const input = document.getElementById("searchInput").value.toLowerCase();
    const results = document.getElementById("results");
    results.innerHTML = "";

    if (input.length === 0) return;

    const filtered = quranData.filter(entry =>
        entry.arabic.includes(input) ||
        entry.english.toLowerCase().includes(input) ||
        entry.surah.toLowerCase().includes(input) ||
        (`${entry.surah.toLowerCase()} ${entry.verse}`.includes(input))
    );

    if (filtered.length === 0) {
        results.innerHTML = "<p>No matching verses found.</p>";
        return;
    }

    filtered.forEach(entry => {
        const div = document.createElement("div");
        div.className = "result";
        div.innerHTML = `
            <div class="arabic">${entry.arabic}</div>
            <div class="translation">${entry.english}</div>
            <div class="reference"><strong>${entry.surah}</strong> - Verse ${entry.verse}</div>
        `;
        results.appendChild(div);
    });
}
