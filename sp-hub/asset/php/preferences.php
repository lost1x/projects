<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get preferences
    $user = getCurrentUser($db);
    
    if (!$user) {
        sendResponse(['error' => 'Unauthorized'], 401);
    }
    
    $stmt = $db->prepare("SELECT * FROM user_preferences WHERE user_id = ?");
    $stmt->bind_param('i', $user['id']);
    $stmt->execute();
    $preferences = $stmt->get_result()->fetch_assoc();
    
    if (!$preferences) {
        sendResponse(['error' => 'Preferences not found'], 404);
    }
    
    sendResponse($preferences, 200);

} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    // Update preferences
    $user = getCurrentUser($db);
    
    if (!$user) {
        sendResponse(['error' => 'Unauthorized'], 401);
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    $theme = $data['theme'] ?? 'dark';
    $notifications_enabled = $data['notifications_enabled'] ?? true;
    $email_frequency = $data['email_frequency'] ?? 'weekly';
    $language = $data['language'] ?? 'en';
    
    $stmt = $db->prepare("
        UPDATE user_preferences 
        SET theme = ?, notifications_enabled = ?, email_frequency = ?, language = ?
        WHERE user_id = ?
    ");
    
    $stmt->bind_param('ssissi', $theme, $notifications_enabled, $email_frequency, $language, $user['id']);
    
    if (!$stmt->execute()) {
        sendResponse(['error' => 'Update failed'], 500);
    }
    
    sendResponse([
        'success' => true,
        'message' => 'Preferences updated'
    ], 200);

} else {
    sendResponse(['error' => 'Method not allowed'], 405);
}
?>
