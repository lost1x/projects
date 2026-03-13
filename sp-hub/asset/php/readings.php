<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Save a reading
    $user = getCurrentUser($db);
    
    if (!$user) {
        sendResponse(['error' => 'Unauthorized'], 401);
    }
    
    $data = json_decode(file_get_contents('php://input'), true);
    
    $tool_name = trim($data['tool_name'] ?? '');
    $reading_type = $data['reading_type'] ?? '';
    $reading_data = json_encode($data['reading_data'] ?? []);
    $reading_result = $data['reading_result'] ?? '';
    
    if (empty($tool_name)) {
        sendResponse(['error' => 'Tool name required'], 422);
    }
    
    $stmt = $db->prepare("
        INSERT INTO reading_history (user_id, tool_name, reading_type, reading_data, reading_result)
        VALUES (?, ?, ?, ?, ?)
    ");
    
    $user_id = $user['id'];
    $stmt->bind_param('issss', $user_id, $tool_name, $reading_type, $reading_data, $reading_result);
    
    if (!$stmt->execute()) {
        error_log("Save reading error: " . $stmt->error);
        sendResponse(['error' => 'Failed to save reading'], 500);
    }
    
    $reading_id = $db->insert_id;
    
    sendResponse([
        'success' => true,
        'message' => 'Reading saved',
        'reading_id' => $reading_id
    ], 201);

} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get reading history
    $user = getCurrentUser($db);
    
    if (!$user) {
        sendResponse(['error' => 'Unauthorized'], 401);
    }
    
    $limit = intval($_GET['limit'] ?? 20);
    $offset = intval($_GET['offset'] ?? 0);
    $tool_filter = $_GET['tool'] ?? '';
    
    if ($limit > 100) $limit = 100; // Max 100 per request
    
    $query = "SELECT * FROM reading_history WHERE user_id = ?";
    $params = [$user['id']];
    $types = 'i';
    
    if (!empty($tool_filter)) {
        $query .= " AND tool_name = ?";
        $params[] = $tool_filter;
        $types .= 's';
    }
    
    $query .= " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    $params[] = $limit;
    $params[] = $offset;
    $types .= 'ii';
    
    $stmt = $db->prepare($query);
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $readings = [];
    while ($row = $result->fetch_assoc()) {
        $row['reading_data'] = json_decode($row['reading_data'], true);
        $readings[] = $row;
    }
    
    // Get total count
    $count_query = "SELECT COUNT(*) as total FROM reading_history WHERE user_id = ?";
    $stmt = $db->prepare($count_query);
    $stmt->bind_param('i', $user['id']);
    $stmt->execute();
    $count = $stmt->get_result()->fetch_assoc()['total'];
    
    sendResponse([
        'readings' => $readings,
        'total' => $count,
        'limit' => $limit,
        'offset' => $offset
    ], 200);

} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // Delete a reading
    $user = getCurrentUser($db);
    
    if (!$user) {
        sendResponse(['error' => 'Unauthorized'], 401);
    }
    
    $reading_id = intval($_GET['id'] ?? 0);
    
    if ($reading_id === 0) {
        sendResponse(['error' => 'Reading ID required'], 422);
    }
    
    // Verify ownership
    $stmt = $db->prepare("SELECT user_id FROM reading_history WHERE id = ?");
    $stmt->bind_param('i', $reading_id);
    $stmt->execute();
    $reading = $stmt->get_result()->fetch_assoc();
    
    if (!$reading || $reading['user_id'] !== $user['id']) {
        sendResponse(['error' => 'Not found or unauthorized'], 404);
    }
    
    // Delete reading
    $stmt = $db->prepare("DELETE FROM reading_history WHERE id = ?");
    $stmt->bind_param('i', $reading_id);
    $stmt->execute();
    
    sendResponse(['success' => true, 'message' => 'Reading deleted'], 200);

} else {
    sendResponse(['error' => 'Method not allowed'], 405);
}
?>
