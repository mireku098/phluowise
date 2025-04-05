<?php
session_start();
require "connection.php"; // Ensure database connection

$response = ["success" => false, "message" => "Invalid request."];

if (isset($_SESSION['email'])) {
    $email = $_SESSION['email'];

    // Generate a new OTP
    $new_code = rand(9999, 1111);

    // Update OTP in the database
    $update_query = "UPDATE usertable SET code = '$new_code' WHERE email = '$email'";
    if (mysqli_query($con, $update_query)) {
        // Send OTP via email
        $subject = "New Verification Code";
        $message = "Your new verification code is $new_code";
        $sender = "From: michaelmireku098@gmail.com";

        if (mail($email, $subject, $message, $sender)) {
            $response = ["success" => true, "message" => "A new OTP has been sent to your email."];
        } else {
            $response = ["success" => false, "message" => "Failed to send OTP email. Please try again."];
        }
    } else {
        $response = ["success" => false, "message" => "Database error. Please try again."];
    }
} else {
    $response = ["success" => false, "message" => "Session expired. Please sign up again."];
}

echo json_encode($response);
