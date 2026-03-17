<?php
require_once 'config.php';

// Enable error reporting for debugging
error_reporting(DEBUG ? E_ALL : 0);
ini_set('display_errors', DEBUG ? 1 : 0);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Subscription plans
const SUBSCRIPTION_PLANS = [
    'free' => [
        'name' => 'Free',
        'price' => 0,
        'features' => [
            'Basic tarot reading',
            'Simple love language quiz', 
            'Basic dream analysis',
            'Limited daily readings (3/day)',
            'Community support'
        ]
    ],
    'premium' => [
        'name' => 'Premium',
        'price' => 9.99,
        'features' => [
            'All tarot spreads',
            'Advanced love language analysis',
            'Deep dream interpretation', 
            'Unlimited daily readings',
            'Advanced fortune methods',
            'Priority customer support',
            'Detailed astrological reports',
            'Crystal healing guides',
            'Numerology life path analysis',
            'Reading history export',
            'Ad-free experience',
            'Custom profile themes',
            'Advanced oracle chat'
        ]
    ]
];

class SubscriptionManager {
    private $db;
    
    public function __construct($database) {
        $this->db = $database;
    }
    
    // Get current user's subscription status
    public function getSubscriptionStatus() {
        $user = getCurrentUser($this->db);
        if (!$user) {
            sendResponse(['error' => 'Unauthorized'], 401);
        }
        
        // Check if user has active subscription in database
        $stmt = $this->db->prepare("
            SELECT s.*, u.email 
            FROM subscriptions s 
            JOIN users u ON s.user_id = u.id 
            WHERE s.user_id = ? AND s.status = 'active' 
            AND (s.ends_at IS NULL OR s.ends_at > NOW())
            ORDER BY s.created_at DESC 
            LIMIT 1
        ");
        
        $stmt->bind_param('i', $user['id']);
        $stmt->execute();
        $subscription = $stmt->get_result()->fetch_assoc();
        
        if ($subscription) {
            return [
                'status' => 'active',
                'plan' => $subscription['plan_type'],
                'features' => SUBSCRIPTION_PLANS[$subscription['plan_type']]['features'],
                'ends_at' => $subscription['ends_at'],
                'created_at' => $subscription['created_at']
            ];
        }
        
        return [
            'status' => 'free',
            'plan' => 'free',
            'features' => SUBSCRIPTION_PLANS['free']['features']
        ];
    }
    
    // Create or update subscription from PayPal webhook
    public function createSubscription($paypalData) {
        // Verify PayPal webhook signature (in production)
        if (!DEBUG) {
            // TODO: Implement PayPal webhook verification
        }
        
        $user = getCurrentUser($this->db);
        if (!$user) {
            sendResponse(['error' => 'User not found'], 404);
        }
        
        $planType = $paypalData['plan_type'] ?? 'premium';
        $subscriptionId = $paypalData['subscription_id'];
        $status = $paypalData['status'] ?? 'active';
        
        // Create subscriptions table if not exists
        $this->createSubscriptionsTable();
        
        // Insert or update subscription
        $stmt = $this->db->prepare("
            INSERT INTO subscriptions (user_id, plan_type, paypal_subscription_id, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, NOW(), NOW())
            ON DUPLICATE KEY UPDATE 
            plan_type = VALUES(plan_type),
            paypal_subscription_id = VALUES(paypal_subscription_id),
            status = VALUES(status),
            updated_at = NOW()
        ");
        
        $stmt->bind_param('isss', $user['id'], $planType, $subscriptionId, $status);
        
        if ($stmt->execute()) {
            // Log subscription event
            error_log("Subscription created: User {$user['id']}, Plan: $planType, ID: $subscriptionId");
            
            sendResponse([
                'success' => true,
                'message' => 'Subscription activated successfully',
                'plan' => $planType,
                'features' => SUBSCRIPTION_PLANS[$planType]['features']
            ]);
        } else {
            sendResponse(['error' => 'Failed to create subscription'], 500);
        }
    }
    
    // Cancel subscription
    public function cancelSubscription() {
        $user = getCurrentUser($this->db);
        if (!$user) {
            sendResponse(['error' => 'Unauthorized'], 401);
        }
        
        $stmt = $this->db->prepare("
            UPDATE subscriptions 
            SET status = 'cancelled', ends_at = NOW(), updated_at = NOW()
            WHERE user_id = ? AND status = 'active'
        ");
        
        $stmt->bind_param('i', $user['id']);
        
        if ($stmt->execute()) {
            error_log("Subscription cancelled: User {$user['id']}");
            sendResponse(['success' => true, 'message' => 'Subscription cancelled']);
        } else {
            sendResponse(['error' => 'Failed to cancel subscription'], 500);
        }
    }
    
    // Get available plans
    public function getPlans() {
        sendResponse([
            'plans' => SUBSCRIPTION_PLANS,
            'currency' => 'USD',
            'billing_cycle' => 'monthly'
        ]);
    }
    
    // Create subscriptions table if not exists
    private function createSubscriptionsTable() {
        $createTable = "
            CREATE TABLE IF NOT EXISTS subscriptions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                plan_type ENUM('free', 'premium') DEFAULT 'free',
                paypal_subscription_id VARCHAR(255),
                status ENUM('active', 'cancelled', 'expired') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                ends_at TIMESTAMP NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_user_status (user_id, status),
                INDEX idx_paypal_subscription (paypal_subscription_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        ";
        
        if (!$this->db->query($createTable)) {
            error_log("Failed to create subscriptions table: " . $this->db->error);
        }
    }
}

// Handle different request methods
$method = $_SERVER['REQUEST_METHOD'];
$subscriptionManager = new SubscriptionManager($db);

try {
    switch ($method) {
        case 'GET':
            $action = $_GET['action'] ?? 'status';
            
            switch ($action) {
                case 'status':
                    $subscriptionManager->getSubscriptionStatus();
                    break;
                    
                case 'plans':
                    $subscriptionManager->getPlans();
                    break;
                    
                default:
                    sendResponse(['error' => 'Invalid action'], 400);
            }
            break;
            
        case 'POST':
            // Handle PayPal webhook or subscription creation
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (isset($input['paypal_data'])) {
                $subscriptionManager->createSubscription($input['paypal_data']);
            } else {
                sendResponse(['error' => 'Invalid request data'], 400);
            }
            break;
            
        case 'PUT':
            // Update subscription (e.g., change plan)
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (isset($input['action']) && $input['action'] === 'cancel') {
                $subscriptionManager->cancelSubscription();
            } else {
                sendResponse(['error' => 'Invalid action'], 400);
            }
            break;
            
        case 'DELETE':
            // Cancel subscription
            $subscriptionManager->cancelSubscription();
            break;
            
        default:
            sendResponse(['error' => 'Method not allowed'], 405);
    }
} catch (Exception $e) {
    error_log("Subscription API Error: " . $e->getMessage());
    sendResponse(['error' => 'Internal server error'], 500);
}
?>
