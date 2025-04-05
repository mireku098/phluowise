<?php
session_start();
header("Content-Type: application/json");
error_reporting(E_ALL);
ini_set('display_errors', 1);

$start_time = microtime(true);

// Database connection
$con = mysqli_connect("localhost", "root", "", "phluowise");
if (!$con) {
    echo json_encode(["success" => false, "errors" => ["db_error" => "Database connection failed!"]]);
    exit();
}

// Collect data
$data = json_decode(file_get_contents("php://input"), true);
if (!$data) {
    echo json_encode(["success" => false, "message" => "Invalid JSON input"]);
    exit();
}

$errors = [];

// Retrieve and sanitize form fields
$name = mysqli_real_escape_string($con, trim($data['company_name'] ?? ''));
$email = mysqli_real_escape_string($con, trim($data['email'] ?? ''));
$password = mysqli_real_escape_string($con, trim($data['password'] ?? ''));
$cpassword = mysqli_real_escape_string($con, trim($data['confirm_password'] ?? ''));

// Validate inputs
if (empty($name)) $errors["company_name"] = "Company name is required!";
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors["email"] = "Invalid email format!";
if ($password !== $cpassword) $errors["password"] = "Passwords do not match!";

// Check if email exists
$email_check = "SELECT * FROM usertable WHERE email = '$email'";
$res = mysqli_query($con, $email_check);
if (mysqli_num_rows($res) > 0) {
    $errors["email"] = "Email already exists!";
}

// If no errors, insert user
if (empty($errors)) {
    $encpass = password_hash($password, PASSWORD_BCRYPT);
    $code = rand(1000, 9999);
    $status = "notverified";
    $email_status = "pending"; // New column to track email status

    $insert_data = "INSERT INTO usertable (company_name, email, password, code, status, email_status) 
                    VALUES('$name', '$email', '$encpass', '$code', '$status', '$email_status')";
    $data_check = mysqli_query($con, $insert_data);

    if ($data_check) {
        $_SESSION['email'] = $email;

        // Use email-handler.php to send email in the background
        exec("php ../back/email- .php?action=send_email &> /dev/null &");



        echo json_encode(["success" => true, "email_sent" => false, "message" => "Processing email..."]);
        exit();
    } else {
        $errors["db_error"] = "Failed to insert data into database!";
    }
}

// Return errors if any
echo json_encode(["success" => false, "errors" => $errors]);
exit();
