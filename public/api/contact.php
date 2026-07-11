<?php
/**
 * PHP Endpoint: Secure General Family Inquiry Processing
 */

// Initialize config and database connection
$config = require __DIR__ . '/config.php';
$pdo = require __DIR__ . '/db.php';

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method Not Allowed. Only POST requests are permitted.'
    ]);
    exit();
}

// Parse JSON input
$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

if (!$input) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid JSON payload.'
    ]);
    exit();
}

// Extract variables with default fallback
$name     = trim($input['name'] ?? '');
$email    = trim($input['email'] ?? '');
$phone    = trim($input['phone'] ?? '');
$relation = trim($input['relation'] ?? 'Family Member / Guardian');
$message  = trim($input['message'] ?? '');

// SERVER-SIDE VALIDATION
$errors = [];

// 1. Required field checks
if (empty($name)) {
    $errors['name'] = 'Your Full Name is required.';
} elseif (strlen($name) > 255) {
    $errors['name'] = 'Your Name must not exceed 255 characters.';
}

if (empty($email)) {
    $errors['email'] = 'Contact Email Address is required.';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'Please enter a valid email address.';
} elseif (strlen($email) > 255) {
    $errors['email'] = 'Email must not exceed 255 characters.';
}

if (!empty($phone)) {
    if (strlen($phone) > 50) {
        $errors['phone'] = 'Phone number must not exceed 50 characters.';
    } elseif (!preg_match('/^[0-9\s\-\+\(\)]+$/', $phone)) {
        $errors['phone'] = 'Phone number contains invalid characters.';
    }
}

if (empty($relation)) {
    $errors['relation'] = 'Relationship to resident is required.';
} elseif (strlen($relation) > 255) {
    $errors['relation'] = 'Relationship designation is too long.';
}

if (empty($message)) {
    $errors['message'] = 'Inquiry or Consultation message is required.';
}

// Reject if validation fails
if (!empty($errors)) {
    http_response_code(422); // Unprocessable Entity
    echo json_encode([
        'success' => false,
        'message' => 'Validation failed.',
        'errors' => $errors
    ]);
    exit();
}

// SANITIZE USER INPUT TO PREVENT XSS
$name     = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
$email    = filter_var($email, FILTER_SANITIZE_EMAIL);
$phone    = htmlspecialchars($phone, ENT_QUOTES, 'UTF-8');
$relation = htmlspecialchars($relation, ENT_QUOTES, 'UTF-8');
$message  = htmlspecialchars($message, ENT_QUOTES, 'UTF-8');

// WRITE TO DATABASE USING PREPARED STATEMENTS
try {
    $sql = "INSERT INTO inquiries (
                name, 
                email, 
                phone, 
                relation, 
                message
            ) VALUES (
                :name, 
                :email, 
                :phone, 
                :relation, 
                :message
            )";
            
    $stmt = $pdo->prepare($sql);
    
    $stmt->execute([
        ':name'     => $name,
        ':email'    => $email,
        ':phone'    => !empty($phone) ? $phone : null,
        ':relation' => $relation,
        ':message'  => $message
    ]);
    
    http_response_code(201); // Created
    echo json_encode([
        'success' => true,
        'message' => 'Your consultation inquiry was securely received. Our support team will contact you shortly.',
        'data' => [
            'name'  => $name,
            'email' => $email
        ]
    ]);
    
} catch (PDOException $e) {
    // Secure error logging. Never leak system details.
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred while saving your inquiry to our secure server.'
    ]);
}
