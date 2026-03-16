// Theme toggle functionality
class ThemeToggle {
    constructor() {
        this.toggleButton = null;
        this.currentTheme = 'dark';
        this.init();
    }

    init() {
        // Load saved theme preference
        this.loadTheme();
        
        // Create toggle button
        this.createToggleButton();
        
        // Add to page
        this.addToPage();
        
        // Setup event listeners
        this.setupEventListeners();
    }

    loadTheme() {
        // Check localStorage first
        const savedTheme = localStorage.getItem('theme-preference');
        if (savedTheme) {
            this.currentTheme = savedTheme;
        } else {
            // Check system preference
            this.currentTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
        }
        
        this.applyTheme();
    }

    createToggleButton() {
        this.toggleButton = document.createElement('button');
        this.toggleButton.className = 'theme-toggle';
        this.toggleButton.innerHTML = this.currentTheme === 'dark' 
            ? '<i class="fas fa-sun"></i>' 
            : '<i class="fas fa-moon"></i>';
        this.toggleButton.title = `Switch to ${this.currentTheme === 'dark' ? 'light' : 'dark'} mode`;
        this.toggleButton.setAttribute('aria-label', `Toggle theme. Current theme: ${this.currentTheme} mode`);
    }

    addToPage() {
        // Add to header if it exists
        const header = document.querySelector('.header-content, .profile-navbar-content');
        if (header) {
            this.toggleButton.style.cssText = `
                background: var(--button-secondary);
                border: 1px solid var(--border);
                color: var(--text-primary);
                padding: 8px 12px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 16px;
                transition: all 0.3s ease;
                margin-left: 10px;
            `;
            
            this.toggleButton.addEventListener('mouseenter', () => {
                this.toggleButton.style.background = 'var(--accent)';
                this.toggleButton.style.borderColor = 'var(--accent)';
            });
            
            this.toggleButton.addEventListener('mouseleave', () => {
                this.toggleButton.style.background = 'var(--button-secondary)';
                this.toggleButton.style.borderColor = 'var(--border)';
            });
            
            header.appendChild(this.toggleButton);
        }
    }

    setupEventListeners() {
        if (this.toggleButton) {
            this.toggleButton.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme-preference')) {
                this.currentTheme = e.matches ? 'light' : 'dark';
                this.applyTheme();
                this.updateToggleButton();
            }
        });

        // Keyboard shortcut (Ctrl/Cmd + Shift + T)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                this.toggleTheme();
            }
        });
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme();
        this.updateToggleButton();
        this.saveTheme();
        this.showThemeChangeNotification();
    }

    applyTheme() {
        if (this.currentTheme === 'light') {
            document.body.classList.add('light-mode');
        } else {
            document.body.classList.remove('light-mode');
        }
        
        // Update meta theme-color for mobile browsers
        this.updateMetaThemeColor();
    }

    updateToggleButton() {
        if (this.toggleButton) {
            this.toggleButton.innerHTML = this.currentTheme === 'dark' 
                ? '<i class="fas fa-sun"></i>' 
                : '<i class="fas fa-moon"></i>';
            this.toggleButton.title = `Switch to ${this.currentTheme === 'dark' ? 'light' : 'dark'} mode`;
            this.toggleButton.setAttribute('aria-label', `Toggle theme. Current theme: ${this.currentTheme} mode`);
        }
    }

    saveTheme() {
        localStorage.setItem('theme-preference', this.currentTheme);
        
        // Also save to user profile if logged in
        if (window.Auth && window.Auth.token && window.Auth.updatePreferences) {
            window.Auth.updatePreferences({ theme: this.currentTheme });
        }
    }

    updateMetaThemeColor() {
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }
        
        metaThemeColor.content = this.currentTheme === 'dark' ? '#6b46c1' : '#8b5cf6';
    }

    showThemeChangeNotification() {
        // Create a subtle notification
        const notification = document.createElement('div');
        notification.className = 'theme-notification';
        notification.textContent = `${this.currentTheme === 'dark' ? '🌙' : '☀️'} ${this.currentTheme} mode activated`;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--accent);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            z-index: 1000;
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.3s ease;
            pointer-events: none;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 10);
        
        // Remove after 2 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(20px)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 2000);
    }

    // Public methods
    getTheme() {
        return this.currentTheme;
    }

    setTheme(theme) {
        if (theme === 'dark' || theme === 'light') {
            this.currentTheme = theme;
            this.applyTheme();
            this.updateToggleButton();
            this.saveTheme();
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.themeToggle = new ThemeToggle();
});

// Export for global access
window.ThemeToggle = ThemeToggle;
