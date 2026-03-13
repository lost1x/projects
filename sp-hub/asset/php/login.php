<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(['error' => 'Method not allowed'], 405);
}

$data = json_decode(file_get_contents('php://input'), true);

$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

if (empty($email) || empty($password)) {
    sendResponse(['error' => 'Email and password required'], 422);
}

// Find user by email
$stmt = $db->prepare("SELECT id, username, email, password_hash, display_name FROM users WHERE email = ? AND is_active = TRUE");
$stmt->bind_param('s', $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    sendResponse(['error' => 'Invalid email or password'], 401);
}

$user = $result->fetch_assoc();

// Verify password
if (!verifyPassword($password, $user['password_hash'])) {
    sendResponse(['error' => 'Invalid email or password'], 401);
}

// Generate session token
$token = generateToken();
$expires_at = date('Y-m-d H:i:s', time() + SESSION_DURATION);
$ip_address = $_SERVER['REMOTE_ADDR'];
$user_agent = $_SERVER['HTTP_USER_AGENT'];
$user_id = $user['id'];

$stmt = $db->prepare("
    INSERT INTO user_sessions (user_id, token, ip_address, user_agent, expires_at)
    VALUES (?, ?, ?, ?, ?)
");

$stmt->bind_param('issss', $user_id, $token, $ip_address, $user_agent, $expires_at);
$stmt->execute();

// Update last login
$stmt = $db->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
$stmt->bind_param('i', $user_id);
$stmt->execute();

sendResponse([
    'success' => true,
    'message' => 'Login successful',
    'user' => [
        'id' => $user['id'],
        'username' => $user['username'],
        'email' => $user['email'],
        'display_name' => $user['display_name']
    ],
    'token' => $token
], 200);
?>
