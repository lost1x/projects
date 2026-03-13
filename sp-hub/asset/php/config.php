<?php
// Database configuration
define('DB_HOST', 'sql112.infinityfree.com');
define('DB_USER', 'if0_41020389');
define('DB_PASS', 'Tye858k24');
define('DB_NAME', 'if0_41020389_spaarow_hub');

// Security
define('JWT_SECRET', 'your-super-secret-key-change-this');
define('SESSION_DURATION', 7 * 24 * 60 * 60); // 7 days in seconds
define('PASSWORD_MIN_LENGTH', 8);

// Debugging (set true during development to surface errors)
define('DEBUG', true);

// LLM / Chatbot settings (set your API key and provider)
// Supported providers: 'huggingface', 'openrouter', 'ollama'
define('LLM_PROVIDER', 'huggingface'); // 'huggingface' | 'openrouter' | 'ollama'

define('LLM_API_KEY', '');
define('LLM_MODEL', 'gpt2'); // For HF/OpenRouter: model ID. For Ollama: model name (e.g., 'llama2', 'orca', etc.)

// Ollama (local) settings
// Ollama is free and can run locally. Set host/port to match your installation.
define('OLLAMA_HOST', 'localhost');
define('OLLAMA_PORT', 11434);
define('OLLAMA_API_KEY', ''); // Optional: set if using Ollama's API key auth

// Email settings (used for weekly horoscopes)
define('EMAIL_FROM', 'no-reply@spaarowhub.great-site.net');
define('EMAIL_SUBJECT_PREFIX', '[Spaarow Hub] ');

define('EMAIL_PROVIDER', 'mail'); // 'mail' or 'sendgrid'
define('SENDGRID_API_KEY', '');

define('SENDGRID_SENDER_NAME', 'Spaarow Hub');

define('SENDGRID_SENDER_EMAIL', 'no-reply@spaarowhub.great-site.net');

// Set error reporting
error_reporting(E_ALL);
ini_set('display_errors', DEBUG ? 1 : 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../../logs/error.log');

// Create logs directory if doesn't exist
if (!is_dir(__DIR__ . '/../../logs')) {
    mkdir(__DIR__ . '/../../logs', 0755, true);
}

// Database connection
try {
    $db = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    
    if ($db->connect_error) {
        throw new Exception("Database connection failed: " . $db->connect_error);
    }
    
    // Set charset to UTF-8
    $db->set_charset("utf8mb4");
    
} catch (Exception $e) {
    http_response_code(500);
    $response = ['error' => 'Service unavailable'];
    if (DEBUG) {
        $response['details'] = $e->getMessage();
    }
    echo json_encode($response);
    error_log($e->getMessage());
    exit;
}

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Get authorization token
function getAuthToken() {
    $headers = getallheaders();
    if (isset($headers['Authorization'])) {
        return str_replace('Bearer ', '', $headers['Authorization']);
    }
    return null;
}

// Validate and get current user
function getCurrentUser($db) {
    $token = getAuthToken();
    
    if (!$token) {
        return null;
    }
    
    $stmt = $db->prepare("
        SELECT u.* FROM users u
        INNER JOIN user_sessions s ON u.id = s.user_id
        WHERE s.token = ? AND s.expires_at > NOW()
    ");
    
    $stmt->bind_param('s', $token);
    $stmt->execute();
    $result = $stmt->get_result();
    
    return $result->fetch_assoc();
}

// Hash password
function hashPassword($password) {
    return password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
}

// Verify password
function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

// Generate secure token
function generateToken($length = 32) {
    return bin2hex(random_bytes($length));
}

// Response helper
function sendResponse($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data);
    exit;
}
?>
