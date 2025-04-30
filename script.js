
// Wait until DOM is ready
window.addEventListener("DOMContentLoaded", () => {
  const receiveBtn = document.getElementById("receiveBtn");
  const closeBtn = document.getElementById("closeReceiveModal");
  const copyBtn = document.getElementById("copyReceiveBtn");
  const modal = document.getElementById("receiveModal");

  if (receiveBtn && modal) {
    receiveBtn.addEventListener("click", () => {
      modal.style.display = "flex";
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", () => {
      const addrEl = document.getElementById("receiveAddress");
      if (addrEl) {
        navigator.clipboard.writeText(addrEl.textContent)
          .then(() => alert("Address copied to clipboard!"))
          .catch(() => alert("Copy failed."));
      }
    });
  }

  if (modal) {
    window.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
      }
    });
  }
});
