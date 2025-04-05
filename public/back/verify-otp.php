<?php
session_start();
header("Content-Type: application/json");
error_reporting(E_ALL);
ini_set('display_errors', 1);

require "connection.php"; // Ensure you have database connection

// Check database connection
if (!$con) {
    echo json_encode(["success" => false, "message" => "Database connection failed!"]);
    exit();
}

// Get OTP and Email
$otp = $_POST['otp'] ?? '';
$email = $_SESSION['email'] ?? '';

if (empty($otp)) {
    echo json_encode(["success" => false, "message" => "OTP is required!"]);
    exit();
}

if (empty($email)) {
    echo json_encode(["success" => false, "message" => "Session expired! Please log in again."]);
    exit();
}

// Use prepared statement to prevent SQL injection
$stmt = $con->prepare("SELECT * FROM usertable WHERE email = ? AND code = ?");
$stmt->bind_param("ss", $email, $otp);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    // OTP matched, update status
    $updateStmt = $con->prepare("UPDATE usertable SET status='verified' WHERE email=?");
    $updateStmt->bind_param("s", $email);
    if ($updateStmt->execute()) {
        echo json_encode(["success" => true, "message" => "Verification successful!"]);
    } else {
        echo json_encode(["success" => false, "message" => "Verification failed! Please try again."]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid OTP!"]);
}

// Close statements and connection
$stmt->close();
$updateStmt->close();
$con->close();

exit();
?>
