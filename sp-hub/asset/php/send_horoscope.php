<?php
require_once 'config.php';

// This endpoint is intended to be run by a cron job (weekly) or manually.
// It sends a simple horoscope email to all active subscribers.

if (php_sapi_name() !== 'cli' && $_SERVER['REQUEST_METHOD'] !== 'GET') {
    sendResponse(['error' => 'Method not allowed'], 405);
}

$subscribers = [];
$stmt = $db->prepare("SELECT id, user_id, email FROM subscriptions WHERE active = 1");
$stmt->execute();
$result = $stmt->get_result();
while ($row = $result->fetch_assoc()) {
    $subscribers[] = $row;
}

if (!count($subscribers)) {
    sendResponse(['success' => true, 'sent' => 0, 'message' => 'No active subscribers']);
}

// Simple horoscope generator (random positive messages)
$horoscopes = [
    "This week brings new doors—trust your instincts and step through.",
    "Your energy attracts support; share your vision and watch it grow.",
    "A surprise connection will spark inspiration—stay open.",
    "Take time to rest and reflect; clarity comes in quiet moments.",
    "A small act of kindness will lead to a larger blessing.",
    "Your creativity is your superpower—use it to build what matters.",
    "Let go of what no longer fits; what remains will feel lighter.",
    "A new opportunity is near; prepare by tidying what’s unfinished.",
    "Speak your truth gently; you’ll be heard by the right people.",
    "This week, trust that you’re exactly where you need to be."
];

$sent = 0;
$errors = [];

foreach ($subscribers as $sub) {
    $message = "Hello,\n\n";
    $message .= "Here is your weekly horoscope from Spaarow Hub:\n\n";
    $message .= $horoscopes[array_rand($horoscopes)] . "\n\n";
    $message .= "If you'd like to unsubscribe, click the link below:\n";
    $message .= "https://" . ($_SERVER['HTTP_HOST'] ?? 'spaarowhub.great-site.net') . "/asset/php/subscribe.php?email=" . urlencode($sub['email']) . "&subscribe=0\n\n";
    $message .= "With cosmic blessings,\nSpaarow Hub\n";

    $subject = EMAIL_SUBJECT_PREFIX . "Your Weekly Horoscope";
    $headers = "From: " . EMAIL_FROM . "\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

    if (@mail($sub['email'], $subject, $message, $headers)) {
        $sent++;
    } else {
        $errors[] = "Failed to send to {$sub['email']}";
    }
}

sendResponse(['success' => true, 'sent' => $sent, 'errors' => $errors]);