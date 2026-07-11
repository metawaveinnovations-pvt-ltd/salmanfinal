<?php
/**
 * Database Connection Layer using secure PDO prepared statements
 */

// Prevent direct file access
if (basename(__FILE__) == basename($_SERVER['SCRIPT_FILENAME'])) {
    header("HTTP/1.1 403 Forbidden");
    exit("Direct access forbidden.");
}

$config = require __DIR__ . '/config.php';

try {
    $dbConfig = $config['db'];
    
    // Construct DSN (Data Source Name)
    $dsn = "mysql:host={$dbConfig['host']};port={$dbConfig['port']};dbname={$dbConfig['database']};charset=utf8mb4";
    
    // PDO options for production security and reliability
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION, // Throw exceptions on errors
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,       // Fetch associative arrays
        PDO::ATTR_EMULATE_PREPARES   => false,                  // Use real prepared statements
    ];
    
    $pdo = new PDO($dsn, $dbConfig['username'], $dbConfig['password'], $options);
    return $pdo;
    
} catch (PDOException $e) {
    // Log error locally if a logging mechanism is set up.
    // NEVER expose raw $e->getMessage() to the public as it may leak host or username in production!
    http_response_code(500);
    
    $devDetails = "";
    if (isset($config['is_dev']) && $config['is_dev']) {
        $devDetails = " Error details: " . $e->getMessage();
    }
    
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
    exit();
}
