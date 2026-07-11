<?php
/**
 * Pro Care Homes PHP Backend Configuration
 * Supporting Hostinger Premium Shared Hosting
 */

// Prevent direct file access
if (basename(__FILE__) == basename($_SERVER['SCRIPT_FILENAME'])) {
    header("HTTP/1.1 403 Forbidden");
    exit("Direct access forbidden.");
}

// Global Headers for JSON API endpoints
header("Content-Type: application/json; charset=UTF-8");

// Setup CORS: Only allow origin if explicitly required or same-domain
// In shared hosting, frontend and backend are usually on the same domain.
// But to ensure flawless development and deployment cross-origin flexibility,
// we allow standard headers.
$allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173'
];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: " . $origin);
    header("Access-Control-Allow-Credentials: true");
} else {
    header("Access-Control-Allow-Origin: *");
}
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("HTTP/1.1 200 OK");
    exit();
}

// Display errors only in development, suppress in production for security
$isDev = (
    ($_SERVER['SERVER_NAME'] ?? '') === 'localhost' ||
    ($_SERVER['SERVER_ADDR'] ?? '') === '127.0.0.1'
);

if ($isDev) {
    ini_set('display_errors', '1');
    ini_set('display_startup_errors', '1');
    error_reporting(E_ALL);
} else {
    ini_set('display_errors', '0');
    error_reporting(0);
}

/**
 * Simple Helper to load .env variables if present
 */
if (!function_exists('loadEnv')) {
    function loadEnv($path) {
        if (!file_exists($path)) {
            return;
        }
        $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            if (strpos(trim($line), '#') === 0) {
                continue;
            }
            list($name, $value) = explode('=', $line, 2);
            $name = trim($name);
            $value = trim($value);
            
            // Strip surrounding quotes
            if (preg_match('/^"s*(.*?)s*"$/', $value, $matches)) {
                $value = $matches[1];
            } elseif (preg_match('/^\'s*(.*?)\'$/', $value, $matches)) {
                $value = $matches[1];
            }
            
            if (!array_key_exists($name, $_SERVER) && !array_key_exists($name, $_ENV)) {
                putenv("{$name}={$value}");
                $_ENV[$name] = $value;
                $_SERVER[$name] = $value;
            }
        }
    }
}

// Load root .env or look for it in parent directories
loadEnv(__DIR__ . '/../../.env');
loadEnv(__DIR__ . '/../.env');
loadEnv(__DIR__ . '/.env');

/**
 * Safely retrieve environment variables with a fallback default.
 * Handles cases where environment variables are set to empty strings.
 */
if (!function_exists('getEnvVar')) {
    function getEnvVar($name, $default) {
        $val = getenv($name);
        if ($val === false || trim($val) === '') {
            return $default;
        }
        return $val;
    }
}

// Return configuration configurations
return [
    'is_dev' => $isDev,
    'db' => [
        'host'     => getEnvVar('DB_HOST', 'localhost'),
        'port'     => getEnvVar('DB_PORT', '3306'),
        'database' => getEnvVar('DB_NAME', 'u986363796_procarehomes'),
        'username' => getEnvVar('DB_USER', 'u986363796_procarehomes'),
        'password' => getEnvVar('DB_PASS', 'ProCareHome@321')
    ],
    'gemini' => [
        'api_key' => getEnvVar('GEMINI_API_KEY', 'MY_GEMINI_API_KEY')
    ]
];
