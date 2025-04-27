body {
  margin: 0;
  font-family: 'Poppins', sans-serif;
  background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
  color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.wallet-container {
  background: #1f1f1f;
  padding: 30px;
  border-radius: 15px;
  width: 100%;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
}

.logo {
  width: 80px;
  margin-bottom: 20px;
}

h1 {
  font-size: 28px;
  margin-bottom: 20px;
}

.btn-primary, .btn-secondary {
  padding: 10px 20px;
  border: none;
  border-radius: 30px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 15px;
}

.btn-primary {
  background: #3498db;
  color: #fff;
}

.btn-primary:hover {
  background: #2980b9;
}

.btn-secondary {
  background: #2ecc71;
  color: #fff;
}

.btn-secondary:hover {
  background: #27ae60;
}

.wallet-info {
  margin-top: 20px;
  text-align: left;
}

.status-text {
  margin-top: 20px;
  font-size: 14px;
}

.modal {
  display: none;
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
}

.modal-content {
  background-color: #2c3e50;
  margin: 15% auto;
  padding: 20px;
  border-radius: 10px;
  width: 90%;
  max-width: 400px;
}

input {
  width: 100%;
  margin-top: 10px;
  padding: 10px;
  border-radius: 10px;
  border: none;
  margin-bottom: 15px;
}

.close {
  float: right;
  font-size: 28px;
  cursor: pointer;
}

.checkmark {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: block;
  stroke-width: 2;
  stroke: #2ecc71;
  stroke-miterlimit: 10;
  margin: 50px auto;
  box-shadow: inset 0px 0px 0px #2ecc71;
  animation: fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both;
}

.checkmark_stem {
  position: absolute;
  width: 5px;
  height: 30px;
  background: #2ecc71;
  transform: rotate(45deg) translate(12px, 12px);
}

.checkmark_kick {
  position: absolute;
  width: 5px;
  height: 15px;
  background: #2ecc71;
  transform: rotate(-45deg) translate(-2px, 22px);
}

@keyframes fill {
  100% {
    box-shadow: inset 0px 0px 0px 30px #2ecc71;
  }
}

@keyframes scale {
  0%, 100% {
    transform: none;
  }
  50% {
    transform: scale3d(1.1, 1.1, 1);
  }
}



