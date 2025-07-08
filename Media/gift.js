// gifts.js — Skrill-based donation system for posts

class SkrillGifter {
  constructor(postsContainerId) {
    this.postsContainer = document.getElementById(postsContainerId);

    this.giftOptions = [
      { label: "🌹 Rose", amountUSD: "1.00" },
      { label: "💖 Heart", amountUSD: "5.00" },
      { label: "🦁 Lion", amountUSD: "10.00" },
      { label: "🛡️ Protection", amountUSD: "15.00" },
      { label: "🙏 Dua", amountUSD: "30.00" }
    ];

    if (!this.postsContainer) {
      console.error("SkrillGifter: posts container not found.");
      return;
    }

    this.renderGiftButtonsForAllPosts();
  }

  renderGiftButtonsForAllPosts() {
    const postElements = this.postsContainer.querySelectorAll(".post-item");
    postElements.forEach(postEl => {
      const postId = postEl.dataset.postId || "unknown"; // fallback
      const receiverName = postEl.dataset.displayName || "Anonymous";
      this.renderGiftButtons(postEl, receiverName);
    });
  }

  renderGiftButtons(postElement, receiverName) {
    if (!postElement) return;

    // Check if gift container exists, or create
    let container = postElement.querySelector(".gifts-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "gifts-container";
      container.style.marginTop = "12px";
      postElement.appendChild(container);
    }
    container.innerHTML = ""; // clear previous

    this.giftOptions.forEach(({ label, amountUSD }) => {
      const btn = document.createElement("a");
      const url = this.buildSkrillURL(amountUSD, receiverName);
      btn.href = url;
      btn.target = "_blank";
      btn.innerHTML = `<button style="margin: 5px; padding: 8px 14px; background: #5A2D82; color: white; border: none; border-radius: 5px; cursor: pointer;">${label} $${amountUSD}</button>`;
      container.appendChild(btn);
    });
  }

  buildSkrillURL(amount, name) {
    return `https://pay.skrill.com/?pay_to=digitalrufiyacoin@gmail.com&amount=${amount}&currency=USD&detail1_description=Gift+to+${encodeURIComponent(name)}&detail1_text=Thank+you+for+spreading+truth`;
  }
}

// Export for module usage
export default SkrillGifter;
