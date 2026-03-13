<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(['error' => 'Method not allowed'], 405);
}

$data = json_decode(file_get_contents('php://input'), true);

// Validate input
$username = trim($data['username'] ?? '');
$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';
$password_confirm = $data['password_confirm'] ?? '';

// Validation rules
$errors = [];

if (strlen($username) < 3) {
    $errors[] = 'Username must be at least 3 characters';
}

if (!preg_match('/^[a-zA-Z0-9_-]+$/', $username)) {
    $errors[] = 'Username can only contain letters, numbers, underscores, and hyphens';
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Invalid email address';
}

if (strlen($password) < PASSWORD_MIN_LENGTH) {
    $errors[] = 'Password must be at least ' . PASSWORD_MIN_LENGTH . ' characters';
}

if ($password !== $password_confirm) {
    $errors[] = 'Passwords do not match';
}

if (!empty($errors)) {
    sendResponse(['errors' => $errors], 422);
}

// Check if username/email already exists
$stmt = $db->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
$stmt->bind_param('ss', $username, $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    sendResponse(['error' => 'Username or email already registered'], 409);
}

// Hash password
$password_hash = hashPassword($password);

// Create user
$stmt = $db->prepare("
    INSERT INTO users (username, email, password_hash, display_name)
    VALUES (?, ?, ?, ?)
");

$display_name = $username;
$stmt->bind_param('ssss', $username, $email, $password_hash, $display_name);

if (!$stmt->execute()) {
    error_log("Registration error: " . $stmt->error);
    sendResponse(['error' => 'Registration failed'], 500);
}

$user_id = $db->insert_id;

// Create user preferences
$theme = 'dark';
$stmt = $db->prepare("
    INSERT INTO user_preferences (user_id, theme)
    VALUES (?, ?)
");
$stmt->bind_param('is', $user_id, $theme);
$stmt->execute();

// Generate session token
$token = generateToken();
$expires_at = date('Y-m-d H:i:s', time() + SESSION_DURATION);
$ip_address = $_SERVER['REMOTE_ADDR'];
$user_agent = $_SERVER['HTTP_USER_AGENT'];

$stmt = $db->prepare("
    INSERT INTO user_sessions (user_id, token, ip_address, user_agent, expires_at)
    VALUES (?, ?, ?, ?, ?)
");

$stmt->bind_param('issss', $user_id, $token, $ip_address, $user_agent, $expires_at);
$stmt->execute();

sendResponse([
    'success' => true,
    'message' => 'Registration successful',
    'user' => [
        'id' => $user_id,
        'username' => $username,
        'email' => $email,
        'display_name' => $display_name
    ],
    'token' => $token
], 201);
?>
