<?php
session_start();
header("Content-Type: application/json");
error_reporting(E_ALL);
ini_set('display_errors', 1);
ob_clean();



use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/../../vendor/autoload.php';

 // If installed via Composer
// require 'path/to/PHPMailer/src/PHPMailer.php'; // If manually installed
// require 'path/to/PHPMailer/src/SMTP.php';
// require 'path/to/PHPMailer/src/Exception.php';

// Database connection
$con = mysqli_connect("localhost", "root", "", "phluowise");
if (!$con) {
    echo json_encode(["success" => false, "message" => "Database connection failed!"]);
    exit();
}

// Get the action (send_email, check_status)
$action = $_GET['action'] ?? '';

if ($action === "send_email") {
    if (!isset($_SESSION['email'])) {
        echo json_encode(["success" => false, "message" => "No user email found in session!"]);
        exit();
    }

    $email = mysqli_real_escape_string($con, $_SESSION['email']);
    $query = "SELECT * FROM usertable WHERE email = '$email'";
    $result = mysqli_query($con, $query);
    $user = mysqli_fetch_assoc($result);

    if (!$user) {
        echo json_encode(["success" => false, "message" => "User not found!"]);
        exit();
    }

    if ($user['email_status'] === 'sent') {
        $_SESSION['email_sent'] = true;
        echo json_encode(["success" => true, "message" => "Email already sent!"]);
        exit();
    }

    $code = $user['code'];

    // Send Email with PHPMailer
    $mail = new PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com'; // Change for other email providers
        $mail->SMTPAuth   = true;
        $mail->Username   = 'michaelmireku098@gmail.com';  // Your email
        $mail->Password   = 'zyzg kqyw qgff mldc';  // Use Gmail App Password
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;

        // Email Details
        $mail->setFrom('michaelmireku098@gmail.com', 'Phluowise');
        $mail->addAddress($email);
        $mail->Subject = "Email Verification Code";
        $mail->Body    = "Your verification code is: $code";

        if ($mail->send()) {
            mysqli_query($con, "UPDATE usertable SET email_status='sent' WHERE email='$email'");
            $_SESSION['email_sent'] = true;
            echo json_encode(["success" => true, "message" => "Verification email sent!"]);
        } else {
            echo json_encode(["success" => false, "message" => "Failed to send email."]);
        }
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => "Mailer Error: " . $mail->ErrorInfo]);
    }

    exit();
}

// Check Email Status
if ($action === "check_status") {
    if (!isset($_SESSION['email'])) {
        echo json_encode(["success" => false, "message" => "No user email found in session!"]);
        exit();
    }

    $email = mysqli_real_escape_string($con, $_SESSION['email']);
    $query = "SELECT email_status FROM usertable WHERE email='$email'";
    $result = mysqli_query($con, $query);
    $user = mysqli_fetch_assoc($result);

    if (!$user) {
        echo json_encode(["success" => false, "message" => "User not found!"]);
        exit();
    }

    if ($user['email_status'] === 'sent') {
        $_SESSION['email_sent'] = true;
        echo json_encode(["success" => true, "status" => "sent"]);
    } else {
        echo json_encode(["success" => false, "status" => "pending"]);
    }

    exit();
}

echo json_encode(["success" => false, "message" => "Invalid request!"]);
exit();
?>
