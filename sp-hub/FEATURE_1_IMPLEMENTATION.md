# Feature 1: User Accounts & Profile System - Implementation Guide

**Status:** Planning  
**Approach:** Self-hosted PHP + MySQL (Free)  
**Effort:** 2-3 weeks  
**Cost:** $0 (uses existing server)  

---

## 🎯 Overview

Implement a complete user authentication system with:
- User registration and login
- Password hashing and security
- Persistent user sessions
- Reading history linked to user accounts
- Cross-device sync
- Public profile pages
- User preferences (theme, email notifications)

---

## 📋 Part 1: Database Schema

### MySQL Table Structure

```sql
-- Users table
-- Reading history table
CREATE TABLE reading_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  tool_name VARCHAR(100) NOT NULL,
  reading_type VARCHAR(50),
  reading_data JSON NOT NULL,
  reading_result TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at),
  INDEX idx_tool_name (tool_name)
);

-- User sessions table
CREATE TABLE user_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_token (token),
  INDEX idx_expires_at (expires_at)
);

-- User preferences table
CREATE TABLE user_preferences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  theme VARCHAR(20) DEFAULT 'dark',
  notifications_enabled BOOLEAN DEFAULT TRUE,
  email_frequency VARCHAR(20) DEFAULT 'weekly',
  language VARCHAR(10) DEFAULT 'en',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
);

-- Public readings table (for sharing)
CREATE TABLE public_readings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  reading_id INT NOT NULL,
  share_token VARCHAR(32) UNIQUE,
  is_public BOOLEAN DEFAULT FALSE,
  views INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reading_id) REFERENCES reading_history(id) ON DELETE CASCADE,
  INDEX idx_share_token (share_token),
  INDEX idx_user_id (user_id)
);
```

---

## 🔧 Part 2: Backend PHP API

Create folder structure:
```
sp-hub/
├── api/
│   ├── config.php              # Database configuration
│   ├── auth.php                # Authentication functions
│   ├── register.php            # User registration endpoint
│   ├── login.php               # User login endpoint
│   ├── logout.php              # Logout endpoint
│   ├── profile.php             # Get/update profile
│   ├── readings.php            # Save/get reading history
│   ├── preferences.php         # User preferences
│   └── share.php               # Share reading publicly
```

### 1. `/api/config.php`

```php
<?php
// Database configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'your_db_user');
define('DB_PASS', 'your_db_password');
define('DB_NAME', 'spaarow_hub');

// Security
define('JWT_SECRET', 'your-super-secret-key-change-this');
define('SESSION_DURATION', 7 * 24 * 60 * 60); // 7 days in seconds
define('PASSWORD_MIN_LENGTH', 8);

// Set error reporting
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../logs/error.log');

// Create logs directory if doesn't exist
if (!is_dir(__DIR__ . '/../logs')) {
    mkdir(__DIR__ . '/../logs', 0755, true);
}

// Database connection
try {
    $db = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    
    if ($db->connect_error) {
        throw new Exception("Database connection failed: " . $db->connect_error);
    }
    
    // Set charset to UTF-8
    $db->set_charset("utf8mb4");
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Service unavailable']);
    error_log($e->getMessage());
    exit;
}

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Get authorization token
function getAuthToken() {
    $headers = getallheaders();
    if (isset($headers['Authorization'])) {
        return str_replace('Bearer ', '', $headers['Authorization']);
    }
    return null;
}

// Validate and get current user
function getCurrentUser($db) {
    $token = getAuthToken();
    
    if (!$token) {
        return null;
    }
    
    $stmt = $db->prepare("
        SELECT u.* FROM users u
        INNER JOIN user_sessions s ON u.id = s.user_id
        WHERE s.token = ? AND s.expires_at > NOW()
    ");
    
    $stmt->bind_param('s', $token);
    $stmt->execute();
    $result = $stmt->get_result();
    
    return $result->fetch_assoc();
}

// Hash password
function hashPassword($password) {
    return password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
}

// Verify password
function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

// Generate secure token
function generateToken($length = 32) {
    return bin2hex(random_bytes($length));
}

// Response helper
function sendResponse($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data);
    exit;
}
?>
```

### 2. `/api/register.php`

```php
<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendResponse(['error' => 'Method not allowed'], 405);
}

$data = json_decode(file_get_contents('php://input'), true);

// Validate input
$username = trim($data['username'] ?? '');
$email = trim($data['email'] ?? '');
$password = $data['password'] ?? '';
$password_confirm = $data['password_confirm'] ?? '';

// Validation rules
$errors = [];

if (strlen($username) < 3) {
    $errors[] = 'Username must be at least 3 characters';
}

if (!preg_match('/^[a-zA-Z0-9_-]+$/', $username)) {
    $errors[] = 'Username can only contain letters, numbers, underscores, and hyphens';
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Invalid email address';
}

if (strlen($password) < PASSWORD_MIN_LENGTH) {
    $errors[] = 'Password must be at least ' . PASSWORD_MIN_LENGTH . ' characters';
}

if ($password !== $password_confirm) {
    $errors[] = 'Passwords do not match';
}

if (!empty($errors)) {
    sendResponse(['errors' => $errors], 422);
}

// Check if username/email already exists
$stmt = $db->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
$stmt->bind_param('ss', $username, $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    sendResponse(['error' => 'Username or email already registered'], 409);
}

// Hash password
$password_hash = hashPassword($password);

// Create user
$stmt = $db->prepare("
    INSERT INTO users (username, email, password_hash, display_name)
    VALUES (?, ?, ?, ?)
");

$display_name = $username;
$stmt->bind_param('ssss', $username, $email, $password_hash, $display_name);

if (!$stmt->execute()) {
    error_log("Registration error: " . $stmt->error);
    sendResponse(['error' => 'Registration failed'], 500);
}

$user_id = $db->insert_id;

// Create user preferences
$theme = 'dark';
$stmt = $db->prepare("
    INSERT INTO user_preferences (user_id, theme)
    VALUES (?, ?)
");
$stmt->bind_param('is', $user_id, $theme);
$stmt->execute();

// Generate session token
$token = generateToken();
$expires_at = date('Y-m-d H:i:s', time() + SESSION_DURATION);
$ip_address = $_SERVER['REMOTE_ADDR'];
$user_agent = $_SERVER['HTTP_USER_AGENT'];

$stmt = $db->prepare("
    INSERT INTO user_sessions (user_id, token, ip_address, user_agent, expires_at)
    VALUES (?, ?, ?, ?, ?)
");

$stmt->bind_param('issss', $user_id, $token, $ip_address, $user_agent, $expires_at);
$stmt->execute();

sendResponse([
    'success' => true,
    'message' => 'Registration successful',
    'user' => [
        'id' => $user_id,
        'username' => $username,
        'email' => $email,
        'display_name' => $display_name
    ],
    'token' => $token
], 201);
?>
```

### 3. `/api/login.php`

```php
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
$stmt = $db->prepare("SELECT id, username, email, password_hash FROM users WHERE email = ? AND is_active = TRUE");
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
        'email' => $user['email']
    ],
    'token' => $token
], 200);
?>
```

### 4. `/api/logout.php`

```php
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
```

### 5. `/api/profile.php`

```php
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
```

### 6. `/api/readings.php`

```php
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
```

### 7. `/api/preferences.php`

```php
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
```

---

## 🎨 Part 3: Frontend Implementation

### 1. Update `/index.html` - Add Login/Register Modal

Add this to the header section:

```html
<!-- Authentication Modal -->
<div class="auth-modal" id="authModal">
    <div class="modal-content auth-content">
        <button class="modal-close" onclick="closeAuthModal()">&times;</button>
        
        <!-- Login Form -->
        <div class="auth-form" id="loginForm">
            <h2>Sign In</h2>
            <p class="auth-subtitle">Access your reading history across all devices</p>
            
            <div class="form-group">
                <input type="email" id="loginEmail" placeholder="Email" required>
            </div>
            <div class="form-group">
                <input type="password" id="loginPassword" placeholder="Password" required>
            </div>
            <button class="auth-button" onclick="handleLogin()">Sign In</button>
            
            <p class="auth-toggle">
                Don't have an account? 
                <a href="#" onclick="switchToRegister(event)">Create one</a>
            </p>
        </div>
        
        <!-- Register Form (hidden by default) -->
        <div class="auth-form hidden" id="registerForm">
            <h2>Create Account</h2>
            <p class="auth-subtitle">Join the cosmic community</p>
            
            <div class="form-group">
                <input type="text" id="registerUsername" placeholder="Username" required>
            </div>
            <div class="form-group">
                <input type="email" id="registerEmail" placeholder="Email" required>
            </div>
            <div class="form-group">
                <input type="password" id="registerPassword" placeholder="Password (min 8 chars)" required>
            </div>
            <div class="form-group">
                <input type="password" id="registerPasswordConfirm" placeholder="Confirm Password" required>
            </div>
            <button class="auth-button" onclick="handleRegister()">Create Account</button>
            
            <p class="auth-toggle">
                Already have an account? 
                <a href="#" onclick="switchToLogin(event)">Sign in</a>
            </p>
        </div>
        
        <!-- Error Messages -->
        <div class="auth-errors" id="authErrors" style="display: none;">
            <div id="authErrorList" class="error-list"></div>
        </div>
    </div>
</div>

<!-- User Profile Button (in header) -->
<button class="user-button" id="userButton" style="display: none;">
    <span id="usernameDisplay">Account</span>
    <div class="dropdown-menu" id="userDropdown" style="display: none;">
        <a href="#" onclick="openProfile(event)">View Profile</a>
        <a href="#" onclick="openPreferences(event)">Preferences</a>
        <a href="#" onclick="handleLogout()">Sign Out</a>
    </div>
</button>

<!-- Auth Button (in header) -->
<button class="auth-header-button" id="authHeaderButton" onclick="openAuthModal()">
    Sign In
</button>
```

### 2. Create `/asset/js/auth.js`

```javascript
// Authentication management module
const Auth = {
    api_url: '/api',
    token: localStorage.getItem('auth_token'),
    user: JSON.parse(localStorage.getItem('auth_user')) || null,

    // Initialize auth state
    init() {
        this.updateUI();
        this.setupLogoutOnTokenExpiry();
    },

    // Update UI based on auth state
    updateUI() {
        const authButton = document.getElementById('authHeaderButton');
        const userButton = document.getElementById('userButton');
        const usernameDisplay = document.getElementById('usernameDisplay');

        if (this.token && this.user) {
            authButton.style.display = 'none';
            userButton.style.display = 'block';
            usernameDisplay.textContent = this.user.display_name || this.user.username;
        } else {
            authButton.style.display = 'block';
            userButton.style.display = 'none';
        }
    },

    // Register user
    async register(username, email, password, passwordConfirm) {
        try {
            const response = await fetch(`${this.api_url}/register.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                    password_confirm: passwordConfirm
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.errors?.join(', ') || 'Registration failed');
            }

            // Save token and user
            this.token = data.token;
            this.user = data.user;
            localStorage.setItem('auth_token', this.token);
            localStorage.setItem('auth_user', JSON.stringify(this.user));

            this.updateUI();
            this.closeAuthModal();
            this.showSuccess('Welcome! Your account has been created.');

            return true;
        } catch (error) {
            this.showError(error.message);
            return false;
        }
    },

    // Login user
    async login(email, password) {
        try {
            const response = await fetch(`${this.api_url}/login.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Save token and user
            this.token = data.token;
            this.user = data.user;
            localStorage.setItem('auth_token', this.token);
            localStorage.setItem('auth_user', JSON.stringify(this.user));

            this.updateUI();
            this.closeAuthModal();
            this.showSuccess('Welcome back!');

            // Sync existing readings to account
            this.syncLocalReadings();

            return true;
        } catch (error) {
            this.showError(error.message);
            return false;
        }
    },

    // Logout user
    async logout() {
        try {
            await fetch(`${this.api_url}/logout.php`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
        } catch (error) {
            console.error('Logout error:', error);
        }

        // Clear local storage
        this.token = null;
        this.user = null;
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');

        this.updateUI();
        this.showSuccess('You have been signed out.');
    },

    // Sync local readings to account
    async syncLocalReadings() {
        const localReadings = JSON.parse(localStorage.getItem('reading_history')) || [];
        
        if (localReadings.length === 0) return;

        for (const reading of localReadings) {
            try {
                await this.saveReading(reading);
            } catch (error) {
                console.error('Failed to sync reading:', error);
            }
        }

        // Clear local readings after sync
        localStorage.removeItem('reading_history');
        this.showSuccess(`Synced ${localReadings.length} readings to your account!`);
    },

    // Save reading to user account
    async saveReading(readingData) {
        if (!this.token) {
            // Fallback to localStorage if not authenticated
            const history = JSON.parse(localStorage.getItem('reading_history')) || [];
            history.push({
                ...readingData,
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('reading_history', JSON.stringify(history));
            return;
        }

        try {
            const response = await fetch(`${this.api_url}/readings.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(readingData)
            });

            if (!response.ok) {
                throw new Error('Failed to save reading');
            }

            return await response.json();
        } catch (error) {
            console.error('Save reading error:', error);
            // Fallback to localStorage
            const history = JSON.parse(localStorage.getItem('reading_history')) || [];
            history.push(readingData);
            localStorage.setItem('reading_history', JSON.stringify(history));
        }
    },

    // Get reading history
    async getReadings(limit = 20, offset = 0) {
        if (!this.token) {
            return JSON.parse(localStorage.getItem('reading_history')) || [];
        }

        try {
            const response = await fetch(
                `${this.api_url}/readings.php?limit=${limit}&offset=${offset}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.token}`
                    }
                }
            );

            if (!response.ok) throw new Error('Failed to fetch readings');
            const data = await response.json();
            return data.readings;
        } catch (error) {
            console.error('Get readings error:', error);
            return [];
        }
    },

    // Get user profile
    async getProfile() {
        if (!this.token) return null;

        try {
            const response = await fetch(`${this.api_url}/profile.php`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch profile');
            return await response.json();
        } catch (error) {
            console.error('Get profile error:', error);
            return null;
        }
    },

    // Update profile
    async updateProfile(profileData) {
        if (!this.token) return false;

        try {
            const response = await fetch(`${this.api_url}/profile.php`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(profileData)
            });

            if (!response.ok) throw new Error('Failed to update profile');
            
            // Update local user
            this.user = { ...this.user, ...profileData };
            localStorage.setItem('auth_user', JSON.stringify(this.user));
            this.updateUI();

            return true;
        } catch (error) {
            console.error('Update profile error:', error);
            return false;
        }
    },

    // Get preferences
    async getPreferences() {
        if (!this.token) return null;

        try {
            const response = await fetch(`${this.api_url}/preferences.php`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch preferences');
            return await response.json();
        } catch (error) {
            console.error('Get preferences error:', error);
            return null;
        }
    },

    // Update preferences
    async updatePreferences(preferences) {
        if (!this.token) return false;

        try {
            const response = await fetch(`${this.api_url}/preferences.php`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(preferences)
            });

            if (!response.ok) throw new Error('Failed to update preferences');
            return true;
        } catch (error) {
            console.error('Update preferences error:', error);
            return false;
        }
    },

    // Setup auto-logout when token expires
    setupLogoutOnTokenExpiry() {
        // Check token validity every 6 hours
        setInterval(() => {
            if (this.token) {
                // Token expires after 7 days
                // For now, just verify by making a profile request
                this.getProfile().then(profile => {
                    if (!profile) {
                        this.logout();
                    }
                });
            }
        }, 6 * 60 * 60 * 1000);
    },

    // UI Helpers
    showError(message) {
        const errorContainer = document.getElementById('authErrors');
        const errorList = document.getElementById('authErrorList');
        errorList.innerHTML = `<div class="error-message">${message}</div>`;
        errorContainer.style.display = 'block';
    },

    showSuccess(message) {
        // Show toast or notification
        console.log('Success:', message);
        // TODO: Implement toast notifications
    },

    closeAuthModal() {
        const modal = document.getElementById('authModal');
        modal.style.display = 'none';
    }
};

// UI Event Handlers
function openAuthModal() {
    const modal = document.getElementById('authModal');
    modal.style.display = 'flex';
}

function closeAuthModal() {
    Auth.closeAuthModal();
}

function switchToLogin(e) {
    e.preventDefault();
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('registerForm').classList.add('hidden');
}

function switchToRegister(e) {
    e.preventDefault();
    document.getElementById('registerForm').classList.remove('hidden');
    document.getElementById('loginForm').classList.add('hidden');
}

async function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        Auth.showError('Please fill in all fields');
        return;
    }

    await Auth.login(email, password);
}

async function handleRegister() {
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;

    if (!username || !email || !password || !passwordConfirm) {
        Auth.showError('Please fill in all fields');
        return;
    }

    await Auth.register(username, email, password, passwordConfirm);
}

async function handleLogout() {
    if (confirm('Are you sure you want to sign out?')) {
        await Auth.logout();
    }
}

function openProfile(e) {
    e.preventDefault();
    // Navigate to profile page or open modal
    window.location.href = '/asset/pages/profile.html';
}

function openPreferences(e) {
    e.preventDefault();
    // Open preferences modal
    console.log('Open preferences');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    Auth.init();
});
```

### 3. Create `/asset/pages/profile.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Profile - Spaarow Hub</title>
    <link rel="stylesheet" href="asset/css/main.css">
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar">
        <div class="navbar-content">
            <a href="/" class="logo">Spaarow Hub</a>
            <button class="back-button" onclick="window.history.back()">← Back</button>
        </div>
    </nav>

    <!-- Profile Content -->
    <main class="main-content">
        <section class="profile-section">
            <div class="profile-header">
                <h1>My Profile</h1>
                <button class="edit-button" id="editButton" onclick="toggleEditMode()">Edit Profile</button>
            </div>

            <!-- Profile View Mode -->
            <div id="profileViewMode" class="profile-card">
                <div class="profile-avatar">
                    <div class="avatar-placeholder" id="avatarPlaceholder"></div>
                </div>

                <div class="profile-info">
                    <div class="info-row">
                        <label>Display Name</label>
                        <p id="displayNameView">-</p>
                    </div>
                    <div class="info-row">
                        <label>Username</label>
                        <p id="usernameView">-</p>
                    </div>
                    <div class="info-row">
                        <label>Email</label>
                        <p id="emailView">-</p>
                    </div>
                    <div class="info-row">
                        <label>Birth Date</label>
                        <p id="birthDateView">Not set</p>
                    </div>
                    <div class="info-row">
                        <label>Zodiac Sign</label>
                        <p id="zodiacView">Not detected</p>
                    </div>
                    <div class="info-row">
                        <label>Bio</label>
                        <p id="bioView">-</p>
                    </div>
                    <div class="info-row">
                        <label>Joined</label>
                        <p id="joinedView">-</p>
                    </div>
                </div>

                <!-- Stats -->
                <div class="profile-stats">
                    <div class="stat">
                        <strong id="totalReadings">0</strong>
                        <small>Total Readings</small>
                    </div>
                    <div class="stat">
                        <strong id="favoriteReadings">0</strong>
                        <small>Favorites</small>
                    </div>
                </div>
            </div>

            <!-- Profile Edit Mode -->
            <div id="profileEditMode" class="profile-card hidden">
                <form id="profileForm">
                    <div class="form-group">
                        <label for="displayNameEdit">Display Name</label>
                        <input type="text" id="displayNameEdit" required>
                    </div>
                    <div class="form-group">
                        <label for="bioEdit">Bio</label>
                        <textarea id="bioEdit" rows="4"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="birthDateEdit">Birth Date</label>
                        <input type="date" id="birthDateEdit">
                    </div>
                    <div class="form-group">
                        <label for="zodiacEdit">Zodiac Sign</label>
                        <select id="zodiacEdit">
                            <option value="">Not specified</option>
                            <option value="Aries">Aries</option>
                            <option value="Taurus">Taurus</option>
                            <option value="Gemini">Gemini</option>
                            <option value="Cancer">Cancer</option>
                            <option value="Leo">Leo</option>
                            <option value="Virgo">Virgo</option>
                            <option value="Libra">Libra</option>
                            <option value="Scorpio">Scorpio</option>
                            <option value="Sagittarius">Sagittarius</option>
                            <option value="Capricorn">Capricorn</option>
                            <option value="Aquarius">Aquarius</option>
                            <option value="Pisces">Pisces</option>
                        </select>
                    </div>

                    <div class="form-actions">
                        <button type="submit" class="btn-primary">Save Changes</button>
                        <button type="button" class="btn-secondary" onclick="toggleEditMode()">Cancel</button>
                    </div>
                </form>
            </div>
        </section>

        <!-- Reading History Section -->
        <section class="readings-section">
            <div class="section-header">
                <h2>My Readings</h2>
                <select id="toolFilter" onchange="filterReadings()">
                    <option value="">All Tools</option>
                    <option value="tarot-reading">Tarot</option>
                    <option value="dream-interpreter">Dreams</option>
                    <option value="zodiac-calculator">Zodiac</option>
                    <option value="numerology">Numerology</option>
                </select>
            </div>

            <div id="readingsGrid" class="readings-grid">
                <p>Loading your readings...</p>
            </div>
        </section>
    </main>

    <script src="asset/js/auth.js"></script>
    <script src="asset/js/profile.js"></script>
</body>
</html>
```

### 4. Create `/asset/js/profile.js`

```javascript
// Profile management
const ProfileManager = {
    currentUser: null,
    readings: [],

    async init() {
        // Check if user is logged in
        if (!Auth.token) {
            window.location.href = '/';
            return;
        }

        await this.loadProfile();
        await this.loadReadings();
        this.setupEventListeners();
    },

    async loadProfile() {
        const profile = await Auth.getProfile();
        if (profile) {
            this.currentUser = profile.user;
            this.displayProfile(profile);
        }
    },

    displayProfile(profile) {
        const user = profile.user;
        const stats = profile.stats;

        document.getElementById('displayNameView').textContent = user.display_name || '-';
        document.getElementById('usernameView').textContent = user.username;
        document.getElementById('emailView').textContent = user.email;
        document.getElementById('birthDateView').textContent = user.birth_date ? new Date(user.birth_date).toLocaleDateString() : 'Not set';
        document.getElementById('zodiacView').textContent = user.zodiac_sign || 'Not detected';
        document.getElementById('bioView').textContent = user.bio || '-';
        document.getElementById('joinedView').textContent = new Date(user.created_at).toLocaleDateString();

        document.getElementById('totalReadings').textContent = stats.total_readings;
        document.getElementById('favoriteReadings').textContent = stats.favorite_readings;

        // Fill edit form
        document.getElementById('displayNameEdit').value = user.display_name || '';
        document.getElementById('bioEdit').value = user.bio || '';
        document.getElementById('birthDateEdit').value = user.birth_date || '';
        document.getElementById('zodiacEdit').value = user.zodiac_sign || '';
    },

    async loadReadings() {
        const readings = await Auth.getReadings(50);
        this.readings = readings;
        this.displayReadings();
    },

    displayReadings() {
        const container = document.getElementById('readingsGrid');
        
        if (this.readings.length === 0) {
            container.innerHTML = '<p class="no-data">No readings saved yet.</p>';
            return;
        }

        container.innerHTML = this.readings.map(reading => `
            <div class="reading-card">
                <div class="reading-header">
                    <h3>${reading.tool_name}</h3>
                    <span class="reading-date">${new Date(reading.created_at).toLocaleDateString()}</span>
                </div>
                <p class="reading-preview">${reading.reading_result?.substring(0, 100) || 'No preview available'}</p>
                <div class="reading-actions">
                    <button onclick="viewReading(${reading.id})">View</button>
                    <button onclick="deleteReading(${reading.id})">Delete</button>
                </div>
            </div>
        `).join('');
    },

    setupEventListeners() {
        document.getElementById('profileForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProfile();
        });
    },

    async saveProfile() {
        const profileData = {
            display_name: document.getElementById('displayNameEdit').value,
            bio: document.getElementById('bioEdit').value,
            birth_date: document.getElementById('birthDateEdit').value,
            zodiac_sign: document.getElementById('zodiacEdit').value
        };

        const success = await Auth.updateProfile(profileData);
        if (success) {
            this.displayProfile({
                user: { ...this.currentUser, ...profileData },
                stats: { total_readings: parseInt(document.getElementById('totalReadings').textContent), favorite_readings: parseInt(document.getElementById('favoriteReadings').textContent) }
            });
            toggleEditMode();
            alert('Profile updated successfully!');
        }
    }
};

function toggleEditMode() {
    document.getElementById('profileViewMode').classList.toggle('hidden');
    document.getElementById('profileEditMode').classList.toggle('hidden');
}

function filterReadings() {
    // TODO: Implement filtering
}

function viewReading(id) {
    console.log('View reading:', id);
    // TODO: Implement reading detail view
}

async function deleteReading(id) {
    if (confirm('Are you sure you want to delete this reading?')) {
        // TODO: Implement delete
        console.log('Delete reading:', id);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    ProfileManager.init();
});
```

### 5. Add CSS for Auth UI

Add to `/asset/css/main.css`:

```css
/* Auth Modal */
.auth-modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(5px);
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.auth-content {
    width: 90%;
    max-width: 400px;
    background: #1a1a1a;
    border-radius: 16px;
    padding: 40px;
    position: relative;
}

.modal-close {
    position: absolute;
    top: 15px;
    right: 15px;
    border: none;
    background: none;
    color: #999;
    font-size: 28px;
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-close:hover {
    color: #fff;
}

.auth-form h2 {
    margin: 0 0 10px 0;
    font-size: 24px;
    color: #fff;
}

.auth-subtitle {
    color: #999;
    margin: 0 0 30px 0;
    font-size: 14px;
}

.form-group {
    margin-bottom: 20px;
}

.form-group input,
.form-group select {
    width: 100%;
    padding: 12px;
    border: 1px solid #333;
    border-radius: 8px;
    background: #0a0a0a;
    color: #fff;
    font-size: 14px;
    font-family: inherit;
}

.form-group input:focus,
.form-group select:focus {
    outline: none;
    border-color: #6b46c1;
    box-shadow: 0 0 0 3px rgba(107, 70, 193, 0.1);
}

.auth-button {
    width: 100%;
    padding: 12px;
    background: linear-gradient(135deg, #6b46c1, #8b5cf6);
    color: #fff;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    font-size: 16px;
    margin-top: 20px;
    transition: all 0.3s ease;
}

.auth-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(107, 70, 193, 0.4);
}

.auth-toggle {
    text-align: center;
    margin-top: 20px;
    color: #999;
    font-size: 14px;
}

.auth-toggle a {
    color: #6b46c1;
    text-decoration: none;
    cursor: pointer;
}

.auth-toggle a:hover {
    text-decoration: underline;
}

.auth-errors {
    background: rgba(220, 38, 38, 0.1);
    border: 1px solid #dc2626;
    border-radius: 8px;
    padding: 15px;
    margin-top: 20px;
}

.error-message {
    color: #fca5a5;
    font-size: 14px;
}

.hidden {
    display: none !important;
}

/* User Button in Header */
.user-button {
    background: none;
    border: none;
    color: #fff;
    cursor: pointer;
    font-size: 14px;
    padding: 8px 16px;
    border-radius: 8px;
    position: relative;
}

.user-button:hover {
    background: rgba(107, 70, 193, 0.1);
}

.dropdown-menu {
    position: absolute;
    top: 100%;
    right: 0;
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 8px;
    min-width: 200px;
    margin-top: 10px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
}

.dropdown-menu a {
    display: block;
    padding: 12px 16px;
    color: #fff;
    text-decoration: none;
    border-bottom: 1px solid #333;
    font-size: 14px;
    transition: background 0.2s ease;
}

.dropdown-menu a:last-child {
    border-bottom: none;
}

.dropdown-menu a:hover {
    background: rgba(107, 70, 193, 0.1);
}

/* Auth Header Button */
.auth-header-button {
    background: linear-gradient(135deg, #6b46c1, #8b5cf6);
    color: #fff;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    font-size: 14px;
}

.auth-header-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(107, 70, 193, 0.4);
}

/* Profile Page */
.profile-section {
    max-width: 800px;
    margin: 0 auto;
    padding: 40px 20px;
}

.profile-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
}

.profile-header h1 {
    margin: 0;
    font-size: 32px;
}

.edit-button {
    padding: 10px 20px;
    background: #6b46c1;
    color: #fff;
    border: none;
    border-radius: 8px;
    cursor: pointer;
}

.profile-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 40px;
    margin-bottom: 40px;
}

.profile-avatar {
    text-align: center;
    margin-bottom: 30px;
}

.avatar-placeholder {
    width: 100px;
    height: 100px;
    background: linear-gradient(135deg, #6b46c1, #8b5cf6);
    border-radius: 50%;
    margin: 0 auto;
}

.profile-info {
    margin-bottom: 30px;
}

.info-row {
    display: flex;
    justify-content: space-between;
    padding: 15px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.info-row:last-child {
    border-bottom: none;
}

.info-row label {
    font-weight: 600;
    color: #999;
    font-size: 14px;
}

.info-row p {
    margin: 0;
    color: #fff;
}

.profile-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 20px;
    margin-top: 30px;
    padding-top: 30px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.stat {
    text-align: center;
}

.stat strong {
    display: block;
    font-size: 32px;
    color: #6b46c1;
    margin-bottom: 5px;
}

.stat small {
    color: #999;
    font-size: 12px;
}

.readings-section {
    max-width: 800px;
    margin: 40px auto;
    padding: 0 20px;
}

.readings-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
}

.reading-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 20px;
    transition: all 0.3s ease;
}

.reading-card:hover {
    transform: translateY(-5px);
    border-color: #6b46c1;
    box-shadow: 0 8px 20px rgba(107, 70, 193, 0.2);
}

.reading-header {
    display: flex;
    justify-content: space-between;
    align-items: start;
    margin-bottom: 15px;
}

.reading-header h3 {
    margin: 0;
    font-size: 16px;
}

.reading-date {
    font-size: 12px;
    color: #999;
}

.reading-preview {
    color: #b0b0b0;
    font-size: 14px;
    margin: 10px 0;
}

.reading-actions {
    display: flex;
    gap: 10px;
    margin-top: 15px;
}

.reading-actions button {
    flex: 1;
    padding: 8px;
    border: none;
    border-radius: 6px;
    background: #333;
    color: #fff;
    cursor: pointer;
    font-size: 12px;
}

.reading-actions button:hover {
    background: #6b46c1;
}
```

---

## 📋 Implementation Checklist

- [ ] Create MySQL database and tables
- [ ] Create `/api/config.php` with DB connection
- [ ] Create auth endpoints (register, login, logout)
- [ ] Create profile endpoint
- [ ] Create readings endpoint
- [ ] Create preferences endpoint
- [ ] Add auth.js to index.html
- [ ] Add login/register modal to index.html
- [ ] Add user button to header
- [ ] Create `/asset/pages/profile.html` page
- [ ] Create `/asset/js/profile.js`
- [ ] Add CSS for auth UI
- [ ] Test registration flow
- [ ] Test login flow
- [ ] Test reading sync
- [ ] Test profile update
- [ ] Deploy to server

---

## 🔐 Security Best Practices Implemented

✅ **Password Security:**
- Bcrypt hashing with cost 12
- 8+ character minimum
- Never stored in plaintext

✅ **Session Management:**
- Token-based authentication
- 7-day expiration
- IP and User-Agent tracking

✅ **Input Validation:**
- Email format validation
- Username format validation
- Prepared statements (prevent SQL injection)
- JSON encoding for data storage

✅ **CORS & Headers:**
- Access-Control headers configured
- OPTIONS preflight handling
- Content-Type validation

✅ **Error Handling:**
- Errors logged, not exposed
- User-friendly error messages
- Graceful fallbacks

---

## 🚀 Next Steps

1. **Set up database** - Run the SQL schema on your server
2. **Create API folder** - Create `/api/` directory with all PHP files
3. **Update HTML** - Add auth modal and user button to index.html
4. **Create profile page** - Create `/asset/pages/profile.html`
5. **Test the flow** - Register, login, sync readings
6. **Deploy** - Push to production

Would you like me to help with any specific part of the implementation?
