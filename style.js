/* style.css */

/* Reset some default styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

/* Body styling */
body {
    background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
    color: #ffffff;
    font-family: 'Poppins', sans-serif;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

/* Container */
.container {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 30px 40px;
    width: 100%;
    max-width: 400px;
    text-align: center;
    backdrop-filter: blur(15px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
}

/* Logo */
.logo {
    width: 100px;
    height: 100px;
    object-fit: cover;
    margin-bottom: 20px;
    border-radius: 50%;
    border: 2px solid #ffffff33;
}

/* Heading */
h1 {
    font-size: 2rem;
    margin-bottom: 20px;
}

/* Buttons */
.btn {
    background: #00c6ff;
    background: linear-gradient(to right, #0072ff, #00c6ff);
    border: none;
    padding: 12px 25px;
    margin: 10px 0;
    font-size: 1rem;
    font-weight: bold;
    color: white;
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn:hover {
    background: linear-gradient(to right, #00c6ff, #0072ff);
    transform: scale(1.05);
}

/* Wallet Info */
.wallet-info {
    margin-top: 20px;
    text-align: left;
    background: rgba(255, 255, 255, 0.1);
    padding: 15px;
    border-radius: 12px;
}

.wallet-info p {
    margin-bottom: 10px;
    font-size: 0.95rem;
    line-height: 1.4;
}

/* Status Text */
.status-text {
    margin-top: 20px;
    font-size: 0.9rem;
    color: #ccc;
}

/* Responsive */
@media (max-width: 500px) {
    .container {
        padding: 20px;
    }

    h1 {
        font-size: 1.5rem;
    }
}
