<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(['error' => 'Method not allowed'], 405);
}

$data = json_decode(file_get_contents('php://input'), true);
$email = trim($data['email'] ?? '');
$subscribe = isset($data['subscribe']) ? (bool)$data['subscribe'] : true;

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    sendResponse(['error' => 'Invalid email address'], 422);
}

// Optional: associate subscription with logged-in user
$user = getCurrentUser($db);
$user_id = $user['id'] ?? null;

if ($subscribe) {
    $stmt = $db->prepare("SELECT id FROM subscriptions WHERE email = ?");
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $stmt = $db->prepare("UPDATE subscriptions SET active = 1, user_id = ?, updated_at = NOW() WHERE email = ?");
        $stmt->bind_param('is', $user_id, $email);
        $stmt->execute();
    } else {
        $stmt = $db->prepare("INSERT INTO subscriptions (user_id, email, active) VALUES (?, ?, 1)");
        $stmt->bind_param('is', $user_id, $email);
        $stmt->execute();
    }

    sendResponse(['success' => true, 'message' => 'Subscribed successfully']);
} else {
    $stmt = $db->prepare("UPDATE subscriptions SET active = 0, updated_at = NOW() WHERE email = ?");
    $stmt->bind_param('s', $email);
    $stmt->execute();
    sendResponse(['success' => true, 'message' => 'Unsubscribed successfully']);
}