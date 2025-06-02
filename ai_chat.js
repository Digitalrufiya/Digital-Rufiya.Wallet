<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>DRF Intelligence System</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet" />
  <style>
// Example logic for Quranic AI Chat page

document.addEventListener('DOMContentLoaded', () => {
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const chatLog = document.getElementById('chatLog');

  chatForm.addEventListener('submit', async e => {
    e.preventDefault();
    const question = chatInput.value.trim();
    if (!question) return;

    appendMessage('You', question);
    chatInput.value = '';
    
    // Simulate API call (replace with real AI logic)
    appendMessage('DRF AI', 'Processing your question...');
    
    try {
      // Example fetch to your AI backend or API
      const response = await fetch('https://your-drf-ai-api.example.com/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });
      const data = await response.json();
      updateLastMessage('DRF AI', data.answer || 'Sorry, I have no answer now.');
    } catch (err) {
      updateLastMessage('DRF AI', 'Error processing your question. Try again.');
    }
  });

  function appendMessage(sender, text) {
    const div = document.createElement('div');
    div.className = 'chat-message';
    div.innerHTML = `<strong>${sender}:</strong> ${text}`;
    chatLog.appendChild(div);
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  function updateLastMessage(sender, text) {
    const messages = chatLog.querySelectorAll('.chat-message');
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    lastMsg.innerHTML = `<strong>${sender}:</strong> ${text}`;
  }
});
