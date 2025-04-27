/* style.css */

/* Reset some default styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}
/* Modal Styles */
.modal {
    display: none; 
    position: fixed;
    z-index: 999;
    padding-top: 150px;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgba(0,0,0,0.6);
}

.modal-content {
    background-color: #fefefe;
    margin: auto;
    padding: 25px;
    border: 1px solid #888;
    width: 300px;
    border-radius: 12px;
    text-align: center;
}

.modal-content input {
    width: 90%;
    padding: 10px;
    margin: 10px 0;
    border-radius: 8px;
    border: 1px solid #ccc;
}

.modal-content button {
    padding: 10px 20px;
    background-color: #27ae60;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    margin-top: 10px;
}

.close {
    color: #aaa;
    float: right;
    font-size: 28px;
    cursor: pointer;
}
.close:hover {
    color: black;
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
/* Checkmark Animation */
#successAnimation {
    position: fixed;
    top: 40%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 9999;
}

.checkmark {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    display: block;
    stroke-width: 2;
    stroke: #2ecc71;
    stroke-miterlimit: 10;
    box-shadow: inset 0px 0px 0px #2ecc71;
    animation: fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both;
    position: relative;
    background: white;
}

.checkmark_stem {
    position: absolute;
    width: 3px;
    height: 25px;
    background-color: #2ecc71;
    left: 38px;
    top: 18px;
    transform: rotate(45deg);
    transform-origin: center center;
    animation: stemGrow .3s ease-in-out .5s forwards;
    opacity: 0;
}

.checkmark_kick {
    position: absolute;
    width: 3px;
    height: 15px;
    background-color: #2ecc71;
    left: 30px;
    top: 42px;
    transform: rotate(-45deg);
    transform-origin: center center;
    animation: kickGrow .3s ease-in-out .6s forwards;
    opacity: 0;
}

@keyframes fill {
    100% {
        box-shadow: inset 0px 0px 0px 30px #2ecc71;
    }
}

@keyframes scale {
    0%, 100% {
        transform: translate(-50%, -50%) scale(1);
    }
    50% {
        transform: translate(-50%, -50%) scale(1.1);
    }
}

@keyframes stemGrow {
    100% {
        height: 40px;
        opacity: 1;
    }
}

@keyframes kickGrow {
    100% {
        height: 20px;
        opacity: 1;
    }
}

