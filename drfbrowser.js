function performSearch() {
  const query = document.getElementById('searchInput').value.trim();
  const engine = document.getElementById('engineSelect').value;

  if (!query) {
    alert("Please enter a search term.");
    return;
  }

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

  window.open(url, '_blank');
}
