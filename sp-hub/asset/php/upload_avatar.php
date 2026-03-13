<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(['error' => 'Method not allowed'], 405);
}

$user = getCurrentUser($db);
if (!$user) {
    sendResponse(['error' => 'Unauthorized'], 401);
}

if (!isset($_FILES['avatar']) || !is_uploaded_file($_FILES['avatar']['tmp_name'])) {
    sendResponse(['error' => 'No file uploaded'], 422);
}

$maxSize = 2 * 1024 * 1024; // 2MB
$file = $_FILES['avatar'];

if ($file['size'] > $maxSize) {
    sendResponse(['error' => 'File too large (max 2MB)'], 413);
}

$allowedMime = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!isset($allowedMime[$mime])) {
    sendResponse(['error' => 'Unsupported file type'], 415);
}

$ext = $allowedMime[$mime];
$uploadDir = __DIR__ . '/uploads/avatars';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$filename = sprintf('avatar_%s_%s.%s', $user['id'], time(), $ext);
$target = $uploadDir . '/' . $filename;

if (!move_uploaded_file($file['tmp_name'], $target)) {
    sendResponse(['error' => 'Failed to save file'], 500);
}

// Build a public URL (assumes asset/php/uploads is web-accessible)
$baseUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http') . '://' . $_SERVER['HTTP_HOST'];
$avatarUrl = $baseUrl . dirname($_SERVER['REQUEST_URI']) . '/uploads/avatars/' . $filename;

// Update user record
$stmt = $db->prepare('UPDATE users SET avatar_url = ? WHERE id = ?');
$stmt->bind_param('si', $avatarUrl, $user['id']);
$stmt->execute();

sendResponse(['success' => true, 'avatar_url' => $avatarUrl]);