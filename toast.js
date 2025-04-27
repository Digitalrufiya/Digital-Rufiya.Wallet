// toast.js

function showToast(message, type = 'info') {
    let bgColor = "#3498db"; // Default blue

    if (type === 'success') bgColor = "#2ecc71";
    else if (type === 'error') bgColor = "#e74c3c";
    else if (type === 'warning') bgColor = "#f39c12";

    Toastify({
        text: message,
        duration: 4000,
        close: true,
        gravity: "top", // top or bottom
        position: "right", // left, center, right
        backgroundColor: bgColor,
        stopOnFocus: true,
    }).showToast();
}
