// Admin credentials
const adminEmail = "digitalrufiya@gmail.com";
const adminPassword = "Zivian@2020";

// Login function
function login() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    if (username === adminEmail && password === adminPassword) {
        alert("Admin login successful!");
        localStorage.setItem('isAdmin', 'true');
        window.location.href = "admin.html";
    } else {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
            alert("User login successful!");
            localStorage.setItem('isAdmin', 'false');
            localStorage.setItem('currentUser', JSON.stringify(user));
            window.location.href = "wallet.html";
        } else {
            alert("Invalid credentials!");
        }
    }
}

// Register function
function register() {
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;

    if (!username || !password) {
        alert("Please fill all fields.");
        return;
    }

    let users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.find(u => u.username === username)) {
        alert("Username already exists!");
        return;
    }

    users.push({ username, password });
    localStorage.setItem('users', JSON.stringify(users));
    alert("Registration successful!");
    window.location.href = "index.html";
}
