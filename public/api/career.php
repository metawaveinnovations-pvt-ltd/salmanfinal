<?php
/**
 * PHP Endpoint: Secure Career Application Expression of Interest Processing
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
$name       = trim($input['name'] ?? '');
$email      = trim($input['email'] ?? '');
$phone      = trim($input['phone'] ?? '');
$position   = trim($input['position'] ?? 'Apply to Become an Adult Support Worker');
$hasDBS     = trim($input['hasDBS'] ?? 'yes');
$experience = trim($input['experience'] ?? '');
$statement  = trim($input['statement'] ?? '');

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

if (empty($position)) {
    $errors['position'] = 'Position of interest is required.';
} elseif (strlen($position) > 255) {
    $errors['position'] = 'Position designation is too long.';
}

if ($hasDBS !== 'yes' && $hasDBS !== 'no') {
    $errors['hasDBS'] = 'DBS status confirmation is required.';
}

if (empty($statement)) {
    $errors['statement'] = 'Statement of values and caring motivation is required.';
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
$name       = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
$email      = filter_var($email, FILTER_SANITIZE_EMAIL);
$phone      = htmlspecialchars($phone, ENT_QUOTES, 'UTF-8');
$position   = htmlspecialchars($position, ENT_QUOTES, 'UTF-8');
$hasDBS     = htmlspecialchars($hasDBS, ENT_QUOTES, 'UTF-8');
$experience = htmlspecialchars($experience, ENT_QUOTES, 'UTF-8');
$statement  = htmlspecialchars($statement, ENT_QUOTES, 'UTF-8');

// WRITE TO DATABASE USING PREPARED STATEMENTS
try {
    $sql = "INSERT INTO careers (
                name, 
                email, 
                phone, 
                position, 
                has_dbs,
                experience,
                statement
            ) VALUES (
                :name, 
                :email, 
                :phone, 
                :position, 
                :has_dbs,
                :experience,
                :statement
            )";
            
    $stmt = $pdo->prepare($sql);
    
    $stmt->execute([
        ':name'       => $name,
        ':email'      => $email,
        ':phone'      => !empty($phone) ? $phone : null,
        ':position'   => $position,
        ':has_dbs'     => $hasDBS,
        ':experience' => !empty($experience) ? $experience : null,
        ':statement'  => $statement
    ]);
    
    http_response_code(201); // Created
    echo json_encode([
        'success' => true,
        'message' => 'Your expression of interest was securely received. Our recruitment team will contact you shortly.',
        'data' => [
            'name'     => $name,
            'position' => $position,
            'email'    => $email
        ]
    ]);
    
} catch (PDOException $e) {
    // Secure error logging. Never leak system details.
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred while saving your application to our secure server.'
    ]);
}
