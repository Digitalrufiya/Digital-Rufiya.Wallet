function performSearch() {
  const query = document.getElementById("searchInput").value.trim();
  const engine = document.getElementById("engineSelect").value;

  if (query === "") {
    alert("Please enter a search term.");
    return;
  }

  let searchURL = "";

  switch (engine) {
    case "google":
      searchURL = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      break;
    case "duckduckgo":
      searchURL = `https://duckduckgo.com/?q=${encodeURIComponent(query)}`;
      break;
    case "bing":
      searchURL = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
      break;
  }

  window.open(searchURL, "_blank");
}
