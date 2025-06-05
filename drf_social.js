
// Placeholder: Replace with your actual working Google Sign-In script
window.onload = function () {
  google.accounts.id.initialize({
    client_id: 'YOUR_GOOGLE_CLIENT_ID',
    callback: handleCredentialResponse,
  });
  google.accounts.id.renderButton(document.getElementById("gSignInBtn"), {
    theme: 'outline',
    size: 'large',
  });
};

function handleCredentialResponse(response) {
  const data = jwt_decode(response.credential);
  document.getElementById('welcomeMessage').innerText = `Welcome, ${data.name}`;
  document.getElementById('userEmail').innerText = data.email;
  document.getElementById('gSignInBtn').style.display = 'none';
  document.getElementById('logoutBtn').style.display = 'inline-block';
}

function logout() {
  document.getElementById('welcomeMessage').innerText = '';
  document.getElementById('userEmail').innerText = '';
  document.getElementById('gSignInBtn').style.display = 'block';
  document.getElementById('logoutBtn').style.display = 'none';
}
