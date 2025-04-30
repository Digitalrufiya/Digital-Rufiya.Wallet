
// Safe event binding for receive modal
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
      const addr = document.getElementById("receiveAddress");
      if (addr) {
        navigator.clipboard.writeText(addr.textContent).then(() =>
          alert("Address copied to clipboard!")
        );
      }
    });
  }

  if (modal) {
    window.addEventListener("click", (event) => {
      if (event.target === modal) {
        modal.style.display = "none";
      }
    });
  }
});
