<?php
require_once 'config.php';

try {
    // Test connection
    if ($db->ping()) {
        echo "Database connection: SUCCESS\n";
    } else {
        echo "Database connection: FAILED\n";
    }

    // Test if tables exist
    $tables = ['users', 'user_sessions', 'user_preferences', 'reading_history', 'public_readings'];
    foreach ($tables as $table) {
        $result = $db->query("SHOW TABLES LIKE '$table'");
        if ($result->num_rows > 0) {
            echo "Table '$table': EXISTS\n";
        } else {
            echo "Table '$table': MISSING\n";
        }
    }

    // Test a simple query
    $result = $db->query("SELECT COUNT(*) as count FROM users");
    $row = $result->fetch_assoc();
    echo "Users count: " . $row['count'] . "\n";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>