<?php
$to = "khanmikey13@gmail.com";
$subject = "Test Email from Localhost";
$message = "This is a test email sent from XAMPP localhost.";
$headers = "From: your-email@gmail.com";

if (mail($to, $subject, $message, $headers)) {
    echo "Email sent successfully!";
} else {
    echo "Failed to send email.";
}
