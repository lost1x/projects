// Authentication management module
const Auth = {
    api_url: 'asset/php',
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
            if (authButton) authButton.style.display = 'none';
            if (userButton) userButton.style.display = 'block';
            if (usernameDisplay) usernameDisplay.textContent = this.user.display_name || this.user.username;
        } else {
            if (authButton) authButton.style.display = 'block';
            if (userButton) userButton.style.display = 'none';
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
        if (errorContainer && errorList) {
            errorList.innerHTML = `<div class="error-message">${message}</div>`;
            errorContainer.style.display = 'block';
        }
    },

    showSuccess(message) {
        // Show toast or notification
        console.log('Success:', message);
        // TODO: Implement toast notifications
    },

    closeAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal) modal.style.display = 'none';
    }
};

// UI Event Handlers
function openAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeAuthModal() {
    Auth.closeAuthModal();
}

function switchToLogin(e) {
    e.preventDefault();
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    if (loginForm && registerForm) {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
    }
}

function switchToRegister(e) {
    e.preventDefault();
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    if (registerForm && loginForm) {
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
    }
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
    window.location.href = 'asset/pages/profile.html';
}

function openPreferences(e) {
    e.preventDefault();
    console.log('Open preferences');
}

// Toggle user dropdown
function toggleUserDropdown(e) {
    e.preventDefault();
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
    const userButton = document.getElementById('userButton');
    const dropdown = document.getElementById('userDropdown');
    if (userButton && dropdown && !userButton.contains(e.target)) {
        dropdown.style.display = 'none';
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    Auth.init();
});
