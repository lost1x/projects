// ===== AUTHENTICATION SYSTEM =====

/**
 * Enhanced authentication system using AppCore utilities
 * Consolidates auth functionality and reduces redundancy
 */

class AuthManager extends AppComponent {
    constructor() {
        super(document.body);
        this.token = AppCore.storage.get('auth_token');
        this.user = AppCore.storage.get('auth_user');
        this.api = AppCore.config.api.baseUrl;
        this.init();
    }

    init() {
        super.init();
        this.forceHideModal();
        this.updateUI();
        this.setupAutoLogout();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Auth form submissions
        this.addEventListener(document, 'submit', (e) => {
            if (e.target.id === 'loginForm') {
                e.preventDefault();
                this.handleLogin();
            } else if (e.target.id === 'registerForm') {
                e.preventDefault();
                this.handleRegister();
            }
        });

        // Modal controls
        this.addEventListener(document, 'click', (e) => {
            if (e.target.id === 'openAuthModal') {
                this.openModal();
            } else if (e.target.id === 'closeAuthModal') {
                this.closeModal();
            } else if (e.target.id === 'switchToLogin') {
                this.switchForm('login');
            } else if (e.target.id === 'switchToRegister') {
                this.switchForm('register');
            }
        });

        // Logout
        this.addEventListener(document, 'click', (e) => {
            if (e.target.id === 'logoutBtn') {
                this.logout();
            }
        });
    }

    forceHideModal() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.classList.remove('show', 'visible', 'active');
            modal.style.setProperty('display', 'none', 'important');
            modal.style.setProperty('visibility', 'hidden', 'important');
            modal.setAttribute('aria-hidden', 'true');
        }
    }

    updateUI() {
        const authButton = document.getElementById('authHeaderButton');
        const userButton = document.getElementById('userButton');
        const usernameDisplay = document.getElementById('usernameDisplay');

        if (this.token && this.user) {
            authButton?.style.setProperty('display', 'none');
            userButton?.style.setProperty('display', 'flex');
            if (usernameDisplay) {
                usernameDisplay.textContent = this.user.display_name || this.user.username;
            }
        } else {
            authButton?.style.setProperty('display', 'block');
            userButton?.style.setProperty('display', 'none');
        }
    }

    async register(username, email, password, passwordConfirm) {
        try {
            const validation = AppCore.validation.validateForm({
                username: { required: true, minLength: 3, maxLength: 20 },
                email: { required: true, email: true },
                password: { required: true, minLength: 6 },
                passwordConfirm: { required: true }
            }, { username, email, password, passwordConfirm });

            if (validation.length > 0) {
                this.showError(validation[0]);
                return false;
            }

            if (password !== passwordConfirm) {
                this.showError('Passwords do not match');
                return false;
            }

            const data = await AppCore.api.post('register.php', {
                username,
                email,
                password,
                password_confirm: passwordConfirm
            });

            this.token = data.token;
            this.user = data.user;
            AppCore.storage.set('auth_token', this.token);
            AppCore.storage.set('auth_user', this.user);

            this.updateUI();
            this.closeModal();
            AppCore.ui.showToast('Welcome! Your account has been created.', 'success');
            return true;

        } catch (error) {
            this.showError(error.message);
            return false;
        }
    }

    async login(email, password) {
        try {
            const validation = AppCore.validation.validateForm({
                email: { required: true, email: true },
                password: { required: true }
            }, { email, password });

            if (validation.length > 0) {
                this.showError(validation[0]);
                return false;
            }

            const data = await AppCore.api.post('login.php', { email, password });

            this.token = data.token;
            this.user = data.user;
            AppCore.storage.set('auth_token', this.token);
            AppCore.storage.set('auth_user', this.user);

            this.updateUI();
            this.closeModal();
            AppCore.ui.showToast('Welcome back!', 'success');

            // Sync local readings
            await this.syncLocalReadings();
            return true;

        } catch (error) {
            this.showError(error.message);
            return false;
        }
    }

    async logout() {
        try {
            await AppCore.api.post('logout.php');
        } catch (error) {
            console.warn('Logout API error:', error);
        }

        this.token = null;
        this.user = null;
        AppCore.storage.remove('auth_token');
        AppCore.storage.remove('auth_user');

        this.updateUI();
        AppCore.ui.showToast('You have been signed out.', 'info');

        // Redirect to hub if not already there
        if (!window.location.pathname.endsWith('/')) {
            window.location.href = '../';
        }
    }

    async syncLocalReadings() {
        const localReadings = AppCore.storage.get('reading_history', []);
        if (localReadings.length === 0) return;

        let synced = 0;
        for (const reading of localReadings) {
            try {
                await this.saveReading(reading);
                synced++;
            } catch (error) {
                console.warn('Failed to sync reading:', error);
            }
        }

        if (synced > 0) {
            AppCore.storage.remove('reading_history');
            AppCore.ui.showToast(`Synced ${synced} readings to your account!`, 'success');
        }
    }

    async saveReading(readingData) {
        if (!this.token) {
            // Fallback to localStorage
            const history = AppCore.storage.get('reading_history', []);
            history.push({
                ...readingData,
                timestamp: new Date().toISOString()
            });
            AppCore.storage.set('reading_history', history);
            return;
        }

        try {
            return await AppCore.api.post('readings.php', readingData);
        } catch (error) {
            console.error('Save reading error:', error);
            // Fallback to localStorage
            const history = AppCore.storage.get('reading_history', []);
            history.push(readingData);
            AppCore.storage.set('reading_history', history);
        }
    }

    async getReadings(limit = 20, offset = 0) {
        if (!this.token) {
            return AppCore.storage.get('reading_history', []);
        }

        try {
            const data = await AppCore.api.get('readings.php', { limit, offset });
            return data.readings || [];
        } catch (error) {
            console.error('Get readings error:', error);
            return [];
        }
    }

    async getProfile() {
        if (!this.token) return null;

        try {
            return await AppCore.api.get('profile.php');
        } catch (error) {
            console.error('Get profile error:', error);
            return null;
        }
    }

    async updateProfile(profileData) {
        if (!this.token) return false;

        try {
            const success = await AppCore.api.put('profile.php', profileData);
            if (success) {
                // Update local user data
                this.user = { ...this.user, ...profileData };
                AppCore.storage.set('auth_user', this.user);
                this.updateUI();
            }
            return success;
        } catch (error) {
            console.error('Update profile error:', error);
            return false;
        }
    }

    async getPreferences() {
        if (!this.token) return null;

        try {
            return await AppCore.api.get('preferences.php');
        } catch (error) {
            console.error('Get preferences error:', error);
            return null;
        }
    }

    async updatePreferences(preferences) {
        if (!this.token) return false;

        try {
            return await AppCore.api.put('preferences.php', preferences);
        } catch (error) {
            console.error('Update preferences error:', error);
            return false;
        }
    }

    setupAutoLogout() {
        // Check token validity every 6 hours
        setInterval(async () => {
            if (this.token) {
                try {
                    const profile = await this.getProfile();
                    if (!profile) {
                        this.logout();
                    }
                } catch (error) {
                    console.warn('Token validation failed:', error);
                }
            }
        }, 6 * 60 * 60 * 1000);
    }

    openModal() {
        const modal = document.getElementById('authModal');
        if (!modal) return;

        // Reset modal state
        modal.classList.remove('show', 'visible', 'active');
        modal.style.removeProperty('visibility');
        modal.style.removeProperty('display');
        modal.removeAttribute('aria-hidden');

        // Show modal
        setTimeout(() => {
            modal.classList.add('active');
            modal.style.display = 'flex';
            modal.style.visibility = 'visible';
            modal.setAttribute('aria-hidden', 'false');
        }, 10);
    }

    closeModal() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.classList.remove('active', 'show', 'visible');
            modal.style.setProperty('display', 'none', 'important');
            modal.style.setProperty('visibility', 'hidden', 'important');
            modal.setAttribute('aria-hidden', 'true');
        }
    }

    switchForm(formType) {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');

        if (formType === 'login') {
            loginForm?.classList.remove('hidden');
            registerForm?.classList.add('hidden');
        } else {
            registerForm?.classList.remove('hidden');
            loginForm?.classList.add('hidden');
        }
    }

    async handleLogin() {
        const email = document.getElementById('loginEmail')?.value;
        const password = document.getElementById('loginPassword')?.value;

        if (!email || !password) {
            this.showError('Please fill in all fields');
            return;
        }

        await this.login(email, password);
    }

    async handleRegister() {
        const username = document.getElementById('registerUsername')?.value;
        const email = document.getElementById('registerEmail')?.value;
        const password = document.getElementById('registerPassword')?.value;
        const passwordConfirm = document.getElementById('registerPasswordConfirm')?.value;

        await this.register(username, email, password, passwordConfirm);
    }

    showError(message) {
        const errorContainer = document.getElementById('authErrors');
        const errorList = document.getElementById('authErrorList');
        
        if (errorContainer && errorList) {
            errorList.innerHTML = `<div class="error-message">${message}</div>`;
            errorContainer.style.display = 'block';
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                errorContainer.style.display = 'none';
            }, 5000);
        } else {
            AppCore.ui.showToast(message, 'error');
        }
    }

    // Getters for external access
    get isAuthenticated() {
        return !!this.token;
    }

    get currentUser() {
        return this.user;
    }

    get authToken() {
        return this.token;
    }
}

// Initialize auth system
document.addEventListener('DOMContentLoaded', () => {
    window.Auth = new AuthManager();
    
    // Expose legacy functions for backward compatibility
    window.openAuthModal = () => window.Auth.openModal();
    window.closeAuthModal = () => window.Auth.closeModal();
    window.switchToLogin = (e) => {
        e.preventDefault();
        window.Auth.switchForm('login');
    };
    window.switchToRegister = (e) => {
        e.preventDefault();
        window.Auth.switchForm('register');
    };
    window.handleLogin = () => window.Auth.handleLogin();
    window.handleRegister = () => window.Auth.handleRegister();
    window.handleLogout = () => window.Auth.logout();
});

// Export for global access
window.AuthManager = AuthManager;
