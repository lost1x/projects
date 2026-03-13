<?php
require_once 'config.php';

$token = getAuthToken();

if ($token) {
    $stmt = $db->prepare("DELETE FROM user_sessions WHERE token = ?");
    $stmt->bind_param('s', $token);
    $stmt->execute();
}

sendResponse(['success' => true, 'message' => 'Logout successful'], 200);
?>
