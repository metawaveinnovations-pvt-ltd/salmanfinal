<?php
/**
 * PHP Endpoint: Secure Local Authority Referral Processing
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
$commissionerName = trim($input['commissionerName'] ?? '');
$authority        = trim($input['authority'] ?? '');
$email            = trim($input['email'] ?? '');
$phone            = trim($input['phone'] ?? '');
$serviceUserName  = trim($input['serviceUserName'] ?? '');
$dob              = trim($input['dob'] ?? '');
$diagnosis        = trim($input['diagnosis'] ?? 'Learning Disabilities & Autism Mix');
$fundingStatus    = trim($input['fundingStatus'] ?? 'Secured');
$riskDetails      = trim($input['riskDetails'] ?? '');
$requiredRatios   = trim($input['requiredRatios'] ?? '1:1 Support Day & night');
$authorityType    = trim($input['authorityType'] ?? 'CCG (NHS Commissioning)');

// SERVER-SIDE VALIDATION
$errors = [];

// 1. Required field checks
if (empty($commissionerName)) {
    $errors['commissionerName'] = 'Assessor / Commissioner Name is required.';
} elseif (strlen($commissionerName) > 255) {
    $errors['commissionerName'] = 'Assessor Name must not exceed 255 characters.';
}

if (empty($authority)) {
    $errors['authority'] = 'Placing Authority is required.';
} elseif (strlen($authority) > 255) {
    $errors['authority'] = 'Authority Name must not exceed 255 characters.';
}

if (empty($email)) {
    $errors['email'] = 'Official/Secure Email is required.';
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'Please enter a valid secure email address.';
} elseif (strlen($email) > 255) {
    $errors['email'] = 'Email must not exceed 255 characters.';
}

if (empty($phone)) {
    $errors['phone'] = 'Direct Telephone is required.';
} elseif (strlen($phone) > 50) {
    $errors['phone'] = 'Telephone must not exceed 50 characters.';
} elseif (!preg_match('/^[0-9\s\-\+\(\)]+$/', $phone)) {
    $errors['phone'] = 'Telephone contains invalid characters.';
}

if (empty($serviceUserName)) {
    $errors['serviceUserName'] = 'Resident Identifier/Name is required.';
} elseif (strlen($serviceUserName) > 255) {
    $errors['serviceUserName'] = 'Resident Identifier must not exceed 255 characters.';
}

if (empty($dob)) {
    $errors['dob'] = 'Date of birth is required.';
} else {
    // Validate date format YYYY-MM-DD
    $d = DateTime::createFromFormat('Y-m-d', $dob);
    if (!$d || $d->format('Y-m-d') !== $dob) {
        $errors['dob'] = 'Please enter a valid date in YYYY-MM-DD format.';
    }
}

// 2. Maximum length validation on secondary fields to prevent buffer overflow attacks
if (strlen($diagnosis) > 255) {
    $diagnosis = substr($diagnosis, 0, 255);
}
if (strlen($fundingStatus) > 255) {
    $fundingStatus = substr($fundingStatus, 0, 255);
}
if (strlen($requiredRatios) > 255) {
    $requiredRatios = substr($requiredRatios, 0, 255);
}
if (strlen($authorityType) > 255) {
    $authorityType = substr($authorityType, 0, 255);
}

// Reject if there are validation errors
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
$commissionerName = htmlspecialchars($commissionerName, ENT_QUOTES, 'UTF-8');
$authority        = htmlspecialchars($authority, ENT_QUOTES, 'UTF-8');
$email            = filter_var($email, FILTER_SANITIZE_EMAIL);
$phone            = htmlspecialchars($phone, ENT_QUOTES, 'UTF-8');
$serviceUserName  = htmlspecialchars($serviceUserName, ENT_QUOTES, 'UTF-8');
$diagnosis        = htmlspecialchars($diagnosis, ENT_QUOTES, 'UTF-8');
$fundingStatus    = htmlspecialchars($fundingStatus, ENT_QUOTES, 'UTF-8');
$riskDetails      = htmlspecialchars($riskDetails, ENT_QUOTES, 'UTF-8');
$requiredRatios   = htmlspecialchars($requiredRatios, ENT_QUOTES, 'UTF-8');
$authorityType    = htmlspecialchars($authorityType, ENT_QUOTES, 'UTF-8');

// WRITE TO DATABASE USING PREPARED STATEMENTS
try {
    $sql = "INSERT INTO referrals (
                commissioner_name, 
                authority, 
                email, 
                phone, 
                service_user_name, 
                dob, 
                diagnosis, 
                funding_status, 
                risk_details, 
                required_ratios, 
                authority_type
            ) VALUES (
                :commissioner_name, 
                :authority, 
                :email, 
                :phone, 
                :service_user_name, 
                :dob, 
                :diagnosis, 
                :funding_status, 
                :risk_details, 
                :required_ratios, 
                :authority_type
            )";
            
    $stmt = $pdo->prepare($sql);
    
    $stmt->execute([
        ':commissioner_name' => $commissionerName,
        ':authority'         => $authority,
        ':email'             => $email,
        ':phone'             => $phone,
        ':service_user_name' => $serviceUserName,
        ':dob'               => $dob,
        ':diagnosis'         => $diagnosis,
        ':funding_status'    => $fundingStatus,
        ':risk_details'      => $riskDetails,
        ':required_ratios'   => $requiredRatios,
        ':authority_type'    => $authorityType
    ]);
    
    http_response_code(201); // Created
    echo json_encode([
        'success' => true,
        'message' => 'Placement referral dossier securely initiated and stored in our systems.',
        'data' => [
            'commissionerName' => $commissionerName,
            'serviceUserName' => $serviceUserName,
            'email' => $email
        ]
    ]);
    
} catch (PDOException $e) {
    // Log the error securely. Never output stack traces or technical details.
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'An error occurred while saving the referral to our encrypted database.'
    ]);
}
