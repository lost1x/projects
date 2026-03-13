<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get profile
    $user = getCurrentUser($db);
    
    if (!$user) {
        sendResponse(['error' => 'Unauthorized'], 401);
    }
    
    // Get stats
    $stmt = $db->prepare("
        SELECT 
            COUNT(*) as total_readings,
            COUNT(CASE WHEN is_favorite THEN 1 END) as favorite_readings
        FROM reading_history
        WHERE user_id = ?
    ");
    
    $stmt->bind_param('i', $user['id']);
    $stmt->execute();
    $stats = $stmt->get_result()->fetch_assoc();
    
    sendResponse([
        'user' => [
            'id' => $user['id'],
            'username' => $user['username'],
            'email' => $user['email'],
            'display_name' => $user['display_name'],
            'bio' => $user['bio'],
            'avatar_url' => $user['avatar_url'],
            'birth_date' => $user['birth_date'],
            'zodiac_sign' => $user['zodiac_sign'],
            'created_at' => $user['created_at']
        ],
        'stats' => $stats
    ], 200);

} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    // Update profile
    $user = getCurrentUser($db);
    
    if (!$user) {
        sendResponse(['error' => 'Unauthorized'], 401);
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    $display_name = $data['display_name'] ?? $user['display_name'];
    $bio = $data['bio'] ?? $user['bio'];
    $birth_date = $data['birth_date'] ?? $user['birth_date'];
    $zodiac_sign = $data['zodiac_sign'] ?? $user['zodiac_sign'];
    
    $stmt = $db->prepare("
        UPDATE users 
        SET display_name = ?, bio = ?, birth_date = ?, zodiac_sign = ?
        WHERE id = ?
    ");
    
    $stmt->bind_param('ssssi', $display_name, $bio, $birth_date, $zodiac_sign, $user['id']);
    
    if (!$stmt->execute()) {
        sendResponse(['error' => 'Update failed'], 500);
    }
    
    sendResponse([
        'success' => true,
        'message' => 'Profile updated',
        'user' => [
            'display_name' => $display_name,
            'bio' => $bio,
            'birth_date' => $birth_date,
            'zodiac_sign' => $zodiac_sign
        ]
    ], 200);

} else {
    sendResponse(['error' => 'Method not allowed'], 405);
}
?>
