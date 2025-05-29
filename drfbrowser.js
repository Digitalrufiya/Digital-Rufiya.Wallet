function performSearch() {
  const query = document.getElementById("searchInput").value.trim();
  const engine = document.getElementById("engineSelect").value;

  if (!query) {
    alert("Please enter something to search.");
    return;
  }

  let url = "";

  // If user enters a full URL (with or without http/https), redirect directly
  if (query.match(/^(https?:\/\/)?(www\.)?[a-z0-9.-]+\.[a-z]{2,}\/?/i)) {
    url = query.startsWith("http") ? query : "https://" + query;
  } else {
    // It's a search query
    switch (engine) {
      case "google":
        url = "https://www.google.com/search?q=" + encodeURIComponent(query);
        break;
      case "duckduckgo":
        url = "https://duckduckgo.com/?q=" + encodeURIComponent(query);
        break;
      case "bing":
        url = "https://www.bing.com/search?q=" + encodeURIComponent(query);
        break;
      default:
        url = "https://www.google.com/search?q=" + encodeURIComponent(query);
    }
  }

  // Open in new tab
  window.open(url, "_blank");
}
