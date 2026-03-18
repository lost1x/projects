// ===== MAIN APPLICATION BOOTSTRAP =====

/**
 * Main application bootstrap that initializes all systems
 * Replaces multiple script tags with a single, optimized loader
 */

class ApplicationBootstrap {
    constructor() {
        this.version = '2.0.0';
        this.systems = new Map();
        this.isInitialized = false;
        this.initPromise = null;
    }

    async init() {
        if (this.isInitialized) return;
        if (this.initPromise) return this.initPromise;

        this.initPromise = this._initialize();
        return this.initPromise;
    }

    async _initialize() {
        try {
            console.log(`🚀 Initializing Spaarow Hub v${this.version}...`);

            // Initialize core systems first
            await this.initializeCore();
            
            // Initialize UI components
            await this.initializeUI();
            
            // Initialize authentication
            await this.initializeAuth();
            
            // Initialize hub functionality
            await this.initializeHub();
            
            // Initialize tool-specific functionality
            await this.initializeTools();
            
            // Setup global event handlers
            this.setupGlobalHandlers();
            
            // Show ready state
            this.showReadyState();
            
            this.isInitialized = true;
            console.log('✅ Spaarow Hub initialized successfully');

            // Emit ready event
            document.dispatchEvent(new CustomEvent('app:ready', { 
                detail: { version: this.version, systems: Array.from(this.systems.keys()) }
            }));

        } catch (error) {
            console.error('❌ Failed to initialize application:', error);
            this.showErrorState(error);
        }
    }

    async initializeCore() {
        console.log('📦 Initializing core systems...');
        
        // Core utilities are already initialized via DOMContentLoaded
        // Just verify they're available
        if (!window.AppCore) {
            throw new Error('Core utilities not loaded');
        }

        this.systems.set('core', window.AppCore);
    }

    async initializeUI() {
        console.log('🎨 Initializing UI components...');
        
        // UI components are already initialized via DOMContentLoaded
        const uiComponents = ['Toast', 'Modal', 'Loading', 'Theme'];
        
        uiComponents.forEach(name => {
            if (window[name]) {
                this.systems.set(name.toLowerCase(), window[name]);
            } else {
                console.warn(`UI component ${name} not available`);
            }
        });
    }

    async initializeAuth() {
        console.log('🔐 Initializing authentication...');
        
        if (window.Auth) {
            this.systems.set('auth', window.Auth);
        } else {
            console.warn('Authentication system not available');
        }
    }

    async initializeHub() {
        console.log('🏠 Initializing hub functionality...');
        
        const hubSystems = ['Hub', 'Suggestions', 'Navigation'];
        
        hubSystems.forEach(name => {
            if (window[name]) {
                this.systems.set(name.toLowerCase(), window[name]);
            } else {
                console.warn(`Hub system ${name} not available`);
            }
        });
    }

    async initializeTools() {
        console.log('🛠️ Initializing tool systems...');
        
        const toolSystems = ['Chatbot', 'Profile', 'ScrollReveal'];
        
        toolSystems.forEach(name => {
            if (window[name]) {
                this.systems.set(name.toLowerCase(), window[name]);
            } else {
                console.log(`Tool system ${name} not available (not on this page)`);
            }
        });
    }

    setupGlobalHandlers() {
        // Handle unhandled errors
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            this.handleGlobalError(event.error);
        });

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.handleGlobalError(event.reason);
            event.preventDefault();
        });

        // Handle visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAnimations();
            } else {
                this.resumeAnimations();
            }
        });

        // Handle online/offline status
        window.addEventListener('online', () => {
            this.showOnlineStatus();
        });

        window.addEventListener('offline', () => {
            this.showOfflineStatus();
        });

        // Handle page unload
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
    }

    handleGlobalError(error) {
        if (window.Toast) {
            window.Toast.show('An unexpected error occurred', 'error');
        }
    }

    pauseAnimations() {
        document.body.classList.add('animations-paused');
    }

    resumeAnimations() {
        document.body.classList.remove('animations-paused');
    }

    showOnlineStatus() {
        if (window.Toast) {
            window.Toast.show('Connection restored', 'success', { duration: 2000 });
        }
    }

    showOfflineStatus() {
        if (window.Toast) {
            window.Toast.show('Connection lost', 'warning', { duration: 3000 });
        }
    }

    showReadyState() {
        // Remove loading screen if present
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => loadingScreen.remove(), 300);
        }

        // Add ready class to body
        document.body.classList.add('app-ready');
    }

    showErrorState(error) {
        const errorScreen = document.createElement('div');
        errorScreen.id = 'errorScreen';
        errorScreen.className = 'error-screen';
        errorScreen.innerHTML = `
            <div class="error-content">
                <h1>⚠️ Application Error</h1>
                <p>Failed to initialize the application.</p>
                <details>
                    <summary>Error Details</summary>
                    <pre>${error.message || error}</pre>
                </details>
                <button onclick="location.reload()" class="btn btn-primary">Reload Application</button>
            </div>
        `;
        
        document.body.appendChild(errorScreen);
    }

    cleanup() {
        console.log('🧹 Cleaning up application...');
        
        // Cleanup all systems
        this.systems.forEach((system, name) => {
            if (system.destroy && typeof system.destroy === 'function') {
                try {
                    system.destroy();
                } catch (error) {
                    console.warn(`Error cleaning up ${name}:`, error);
                }
            }
        });
    }

    // Public API
    getSystem(name) {
        return this.systems.get(name.toLowerCase());
    }

    isReady() {
        return this.isInitialized;
    }

    async whenReady() {
        if (this.isInitialized) return;
        return this.init();
    }

    // Debug utilities
    debug() {
        return {
            version: this.version,
            initialized: this.isInitialized,
            systems: Array.from(this.systems.keys()),
            performance: AppCore.performance,
            storage: Object.keys(localStorage).filter(key => key.startsWith('spaarow_'))
        };
    }
}

// Create global application instance
window.SpaarowApp = new ApplicationBootstrap();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    await window.SpaarowApp.init();
});

// Expose utilities for backward compatibility
window.app = {
    ready: () => window.SpaarowApp.whenReady(),
    get: (name) => window.SpaarowApp.getSystem(name),
    debug: () => window.SpaarowApp.debug()
};

// Performance monitoring
if (window.performance && window.performance.mark) {
    window.performance.mark('app-bootstrap-start');
    
    document.addEventListener('app:ready', () => {
        window.performance.mark('app-bootstrap-end');
        window.performance.measure('app-bootstrap', 'app-bootstrap-start', 'app-bootstrap-end');
        
        const measure = window.performance.getEntriesByName('app-bootstrap')[0];
        console.log(`📊 Application initialized in ${measure.duration.toFixed(2)}ms`);
    });
}

// Service Worker registration for PWA
if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('📱 Service Worker registered:', registration.scope);
            })
            .catch(error => {
                console.log('❌ Service Worker registration failed:', error);
            });
    });
}

// Export for global access
window.ApplicationBootstrap = ApplicationBootstrap;
