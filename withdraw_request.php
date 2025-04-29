<?php
session_start();
date_default_timezone_set('UTC');

// Database connection
$host = "localhost";
$dbname = "staking_db";
$username = "root";
$password = "";

$conn = new mysqli($host, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Database connection failed: " . $conn->connect_error);
}

// Validate request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $wallet = trim($_POST['wallet']);
    $amount = floatval($_POST['amount']);
    $timestamp = date("Y-m-d H:i:s");

    // Basic validation
    if (empty($wallet) || $amount <= 0) {
        echo json_encode(["status" => "error", "message" => "Invalid input."]);
        exit;
    }

    // Save withdrawal request
    $stmt = $conn->prepare("INSERT INTO withdrawal_requests (wallet_address, amount, request_time, status) VALUES (?, ?, ?, 'pending')");
    $stmt->bind_param("sds", $wallet, $amount, $timestamp);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Withdrawal request submitted. Admin will review it."]);
    } else {
        echo json_encode(["status" => "error", "message" => "Database error. Try again later."]);
    }

    $stmt->close();
} else {
    echo json_encode(["status" => "error", "message" => "Invalid request."]);
}

$conn->close();
?>
