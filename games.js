const questions = [
  {
    question: "What is the best deed in Islam?",
    answers: ["Charity", "Fasting", "Hajj", "Reading"],
    correct: 0,
  },
  {
    question: "Which month is known for fasting?",
    answers: ["Muharram", "Ramadan", "Shawwal", "Dhul Hijjah"],
    correct: 1,
  },
  {
    question: "How many daily prayers are there?",
    answers: ["3", "4", "5", "6"],
    correct: 2,
  },
];

let currentQuestionIndex = 0;
let points = 0;
const scriptURL = "https://script.google.com/macros/s/AKfycbxg3KZHRr_KYRn1I5_d3LK76ACw8-RXpOugfy3EGM3IcbHkm5IOVoGlzYIRTNSZstH4/exec";

document.addEventListener("DOMContentLoaded", () => {
  showQuestion();
  loadLeaderboard();
});

function showQuestion() {
  const q = questions[currentQuestionIndex];
  document.getElementById('question-text').innerText = q.question;
  const btnContainer = document.getElementById('answer-buttons');
  btnContainer.innerHTML = '';
  q.answers.forEach((text, i) => {
    const btn = document.createElement('button');
    btn.innerText = text;
    btn.onclick = () => handleAnswer(i);
    btnContainer.appendChild(btn);
  });
}

function handleAnswer(selectedIndex) {
  const correct = questions[currentQuestionIndex].correct;
  if (selectedIndex === correct) {
    points += 10;
    document.getElementById('points').innerText = points;
  }
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    document.getElementById('question-text').innerText = "You've completed all questions! 🎉";
    document.getElementById('answer-buttons').innerHTML = '';
  }
}

async function donatePoints() {
  if (points === 0) {
    document.getElementById('donation-msg').innerText = "You have no Bitcoin Pound coin 🪙 to donate.";
    return;
  }

  const name = prompt("Enter your name or wallet address:");
  if (!name) return;

  try {
    const response = await fetch(scriptURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, points }),
    });
    const result = await response.json();
    if (result.success) {
      document.getElementById('donation-msg').innerText = `✅ Thank you, ${name}! Your donation of ${points} 🪙 was successful.`;
      points = 0;
      document.getElementById('points').innerText = points;
      loadLeaderboard();
    } else {
      document.getElementById('donation-msg').innerText = `❌ ${result.message || "Donation failed."}`;
    }
  } catch (err) {
    document.getElementById('donation-msg').innerText = "❌ Error sending data. Try again later.";
  }
}

async function loadLeaderboard() {
  try {
    const res = await fetch(scriptURL);
    const data = await res.json();
    const list = document.getElementById('leaderboard-list');
    list.innerHTML = '';

    if (data.success && data.leaderboard.length > 0) {
      data.leaderboard.forEach((entry, i) => {
        const li = document.createElement('li');
        li.innerText = `${i + 1}. ${entry.name} - ${entry.points} 🪙`;
        list.appendChild(li);
      });
    } else {
      list.innerHTML = '<li>No donations yet.</li>';
    }
  } catch (err) {
    document.getElementById('leaderboard-list').innerHTML = '<li>Failed to load leaderboard</li>';
  }
}
