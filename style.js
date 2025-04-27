body {
  font-family: Arial, sans-serif;
  background: #f7f9fc;
  text-align: center;
  padding: 20px;
}

.container {
  margin-top: 50px;
}

.logo {
  width: 150px;
  margin-bottom: 20px;
}

button {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
}

button:hover {
  background-color: #2980b9;
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
  background-color: #fff;
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
