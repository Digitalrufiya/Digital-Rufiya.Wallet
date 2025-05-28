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
    document.getElementById('question-text').innerText = "🎉 You've completed all questions!";
    document.getElementById('answer-buttons').innerHTML = '';
  }
}

function donatePoints() {
  if (points === 0) {
    document.getElementById('donation-msg').innerText = "⚠️ You have no Bitcoin Pound coin 🪙 to donate.";
    return;
  }

  const name = prompt("Enter your name or wallet address:");
  if (!name) return;

  submitToGoogleForm(name, points);
  document.getElementById('donation-msg').innerText = `✅ Thank you, ${name}! Your donation of ${points} 🪙 was submitted.`;
  points = 0;
  document.getElementById('points').innerText = points;
}

function submitToGoogleForm(name, points) {
  const today = new Date().toLocaleDateString("en-GB");

  const formBaseURL = "https://docs.google.com/forms/d/e/1FAIpQLSfLFzzlK5EcWZqGFyHynTXjF8gI6D4eRB5zSbMeGtfdsQ5QVA/formResponse";

  const formData = new URLSearchParams();
  formData.append("entry.417627887", name);         // Name / Wallet
  formData.append("entry.1355155876", points);       // Points
  formData.append("entry.1341601281", today);        // Date

  fetch(formBaseURL, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  }).then(() => {
    console.log("Submitted to Google Form");
  }).catch((error) => {
    console.error("Google Form Error:", error);
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', showQuestion);
