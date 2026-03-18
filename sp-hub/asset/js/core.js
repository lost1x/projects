// ===== CORE UTILITIES & BASE CLASSES =====

/**
 * Enhanced utility library with consolidated functionality
 * Reduces redundancy across all JavaScript modules
 */

class AppCore {
    static config = {
        api: {
            baseUrl: 'asset/php',
            timeout: 10000,
            retries: 3
        },
        ui: {
            toastDuration: 4000,
            animationDuration: 300,
            debounceDelay: 300
        },
        storage: {
            prefix: 'spaarow_',
            expiryDays: 30
        }
    };

    static performance = {
        mode: this.getPerformanceMode(),
        isReducedMotion: false,
        isReducedData: false,
        isLowEndDevice: false
    };

    static getPerformanceMode() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        const isSlowConnection = connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g');
        const isLowEndDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;

        return {
            reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
            reducedData: window.matchMedia('(prefers-reduced-data: reduce)').matches,
            slowConnection: isSlowConnection,
            lowEndDevice: isLowEndDevice
        };
    }

    static init() {
        this.performance = this.getPerformanceMode();
        this.setupErrorHandling();
        this.setupPerformanceOptimizations();
    }

    static setupErrorHandling() {
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            this.showToast('An unexpected error occurred', 'error');
            event.preventDefault();
        });

        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            this.showToast('An unexpected error occurred', 'error');
        });
    }

    static setupPerformanceOptimizations() {
        if (this.performance.reducedMotion || this.performance.lowEndDevice) {
            document.body.classList.add('reduced-animations');
        }

        if (this.performance.reducedData) {
            document.body.classList.add('reduced-data');
        }
    }

    // Enhanced storage utilities
    static storage = {
        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(`${AppCore.config.storage.prefix}${key}`);
                if (!item) return defaultValue;
                
                const parsed = JSON.parse(item);
                // Check expiry
                if (parsed.expiry && Date.now() > parsed.expiry) {
                    localStorage.removeItem(`${AppCore.config.storage.prefix}${key}`);
                    return defaultValue;
                }
                return parsed.value;
            } catch (error) {
                console.warn('Storage get error:', error);
                return defaultValue;
            }
        },

        set(key, value, ttlDays = null) {
            try {
                const item = {
                    value,
                    expiry: ttlDays ? Date.now() + (ttlDays * 24 * 60 * 60 * 1000) : null
                };
                localStorage.setItem(`${AppCore.config.storage.prefix}${key}`, JSON.stringify(item));
            } catch (error) {
                console.warn('Storage set error:', error);
            }
        },

        remove(key) {
            localStorage.removeItem(`${AppCore.config.storage.prefix}${key}`);
        },

        clear() {
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith(AppCore.config.storage.prefix)) {
                    localStorage.removeItem(key);
                }
            });
        }
    };

    // Enhanced API utilities
    static api = {
        async request(endpoint, options = {}) {
            const url = `${AppCore.config.api.baseUrl}/${endpoint}`;
            const config = {
                timeout: AppCore.config.api.timeout,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            };

            // Add auth token if available
            if (window.Auth?.token) {
                config.headers.Authorization = `Bearer ${window.Auth.token}`;
            }

            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), config.timeout);

                const response = await fetch(url, {
                    ...config,
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    const error = await response.json().catch(() => ({}));
                    throw new Error(error.error || error.message || `HTTP ${response.status}`);
                }

                return await response.json();
            } catch (error) {
                if (error.name === 'AbortError') {
                    throw new Error('Request timeout');
                }
                throw error;
            }
        },

        async get(endpoint, params = {}) {
            const query = new URLSearchParams(params).toString();
            const url = query ? `${endpoint}?${query}` : endpoint;
            return this.api.request(url);
        },

        async post(endpoint, data = {}) {
            return this.api.request(endpoint, {
                method: 'POST',
                body: JSON.stringify(data)
            });
        },

        async put(endpoint, data = {}) {
            return this.api.request(endpoint, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
        },

        async delete(endpoint) {
            return this.api.request(endpoint, {
                method: 'DELETE'
            });
        }
    };

    // Enhanced UI utilities
    static ui = {
        showToast(message, type = 'info', options = {}) {
            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            toast.innerHTML = `
                <i class="fas fa-${this.getToastIcon(type)}"></i>
                <span>${message}</span>
            `;

            document.body.appendChild(toast);

            // Animate in
            requestAnimationFrame(() => {
                toast.classList.add('show');
            });

            // Auto remove
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), AppCore.config.ui.animationDuration);
            }, options.duration || AppCore.config.ui.toastDuration);
        },

        getToastIcon(type) {
            const icons = {
                success: 'check-circle',
                error: 'exclamation-circle',
                warning: 'exclamation-triangle',
                info: 'info-circle'
            };
            return icons[type] || 'info-circle';
        },

        setLoading(element, loading = true) {
            if (!element) return;

            if (loading) {
                element.dataset.originalText = element.innerHTML;
                element.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
                element.disabled = true;
            } else {
                element.innerHTML = element.dataset.originalText || element.innerHTML;
                element.disabled = false;
                delete element.dataset.originalText;
            }
        },

        animate(element, properties, duration = AppCore.config.ui.animationDuration) {
            return new Promise(resolve => {
                element.style.transition = `all ${duration}ms ease`;
                
                Object.entries(properties).forEach(([prop, value]) => {
                    element.style[prop] = value;
                });

                setTimeout(resolve, duration);
            });
        },

        debounce(func, delay = AppCore.config.ui.debounceDelay) {
            let timeoutId;
            return function (...args) {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => func.apply(this, args), delay);
            };
        },

        throttle(func, limit = 100) {
            let inThrottle;
            return function (...args) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        }
    };

    // Enhanced validation utilities
    static validation = {
        escapeHtml(text) {
            if (!text) return '';
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        },

        sanitizeText(text, maxLength = null) {
            if (!text) return '';
            let sanitized = text.trim();
            if (maxLength) {
                sanitized = sanitized.substring(0, maxLength);
            }
            return this.escapeHtml(sanitized);
        },

        isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        },

        isValidUsername(username) {
            const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
            return usernameRegex.test(username);
        },

        validateForm(data, rules) {
            const errors = [];

            Object.entries(rules).forEach(([field, rule]) => {
                const value = data[field];
                
                if (rule.required && (!value || value.trim() === '')) {
                    errors.push(`${field} is required`);
                    return;
                }

                if (rule.minLength && value.length < rule.minLength) {
                    errors.push(`${field} must be at least ${rule.minLength} characters`);
                }

                if (rule.maxLength && value.length > rule.maxLength) {
                    errors.push(`${field} must not exceed ${rule.maxLength} characters`);
                }

                if (rule.email && !this.isValidEmail(value)) {
                    errors.push(`${field} must be a valid email address`);
                }

                if (rule.pattern && !rule.pattern.test(value)) {
                    errors.push(`${field} format is invalid`);
                }
            });

            return errors;
        }
    };

    // Enhanced modal system
    static modal = {
        show(content, options = {}) {
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-overlay"></div>
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>${options.title || 'Modal'}</h3>
                        <button class="modal-close-btn" aria-label="Close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">${content}</div>
                </div>
            `;

            document.body.appendChild(modal);

            // Event listeners
            const close = () => this.hide(modal);
            modal.querySelector('.modal-overlay').addEventListener('click', close);
            modal.querySelector('.modal-close-btn').addEventListener('click', close);

            // Keyboard support
            const handleKeydown = (e) => {
                if (e.key === 'Escape') close();
            };
            document.addEventListener('keydown', handleKeydown);

            // Show modal
            requestAnimationFrame(() => {
                modal.classList.add('show');
                document.body.style.overflow = 'hidden';
            });

            // Store cleanup function
            modal._cleanup = () => {
                document.removeEventListener('keydown', handleKeydown);
                document.body.style.overflow = '';
            };

            return modal;
        },

        hide(modal) {
            if (!modal) return;

            modal.classList.remove('show');
            
            setTimeout(() => {
                if (modal._cleanup) modal._cleanup();
                modal.remove();
            }, AppCore.config.ui.animationDuration);
        },

        confirm(message, options = {}) {
            return new Promise((resolve) => {
                const modal = this.show(`
                    <p>${message}</p>
                    <div class="modal-actions">
                        <button class="btn btn-secondary" data-action="cancel">Cancel</button>
                        <button class="btn btn-primary" data-action="confirm">Confirm</button>
                    </div>
                `, {
                    title: options.title || 'Confirm'
                });

                const handleAction = (action) => {
                    this.hide(modal);
                    resolve(action === 'confirm');
                };

                modal.querySelector('[data-action="confirm"]').addEventListener('click', () => handleAction('confirm'));
                modal.querySelector('[data-action="cancel"]').addEventListener('click', () => handleAction('cancel'));
            });
        }
    };

    // Enhanced event system
    static events = {
        listeners: new Map(),

        on(element, event, handler, options = {}) {
            const key = `${element}_${event}`;
            if (!this.listeners.has(key)) {
                this.listeners.set(key, []);
            }
            
            const wrappedHandler = handler.bind(this);
            element.addEventListener(event, wrappedHandler, options);
            this.listeners.get(key).push({ handler: wrappedHandler, options });
            
            return () => element.removeEventListener(event, wrappedHandler, options);
        },

        off(element, event, handler) {
            const key = `${element}_${event}`;
            const handlers = this.listeners.get(key) || [];
            
            handlers.forEach(({ handler: h, options }) => {
                if (h === handler) {
                    element.removeEventListener(event, h, options);
                }
            });
        },

        emit(element, event, detail = {}) {
            element.dispatchEvent(new CustomEvent(event, { detail }));
        }
    };

    // Enhanced animation utilities
    static animation = {
        fadeIn(element, duration = AppCore.config.ui.animationDuration) {
            return AppCore.ui.animate(element, { opacity: '1' }, duration);
        },

        fadeOut(element, duration = AppCore.config.ui.animationDuration) {
            return AppCore.ui.animate(element, { opacity: '0' }, duration);
        },

        slideIn(element, direction = 'up', duration = AppCore.config.ui.animationDuration) {
            const transforms = {
                up: 'translateY(0)',
                down: 'translateY(0)',
                left: 'translateX(0)',
                right: 'translateX(0)'
            };
            
            const startTransforms = {
                up: 'translateY(20px)',
                down: 'translateY(-20px)',
                left: 'translateX(20px)',
                right: 'translateX(-20px)'
            };

            element.style.transform = startTransforms[direction];
            element.style.opacity = '0';
            
            return AppCore.ui.animate(element, {
                transform: transforms[direction],
                opacity: '1'
            }, duration);
        },

        slideOut(element, direction = 'up', duration = AppCore.config.ui.animationDuration) {
            const transforms = {
                up: 'translateY(-20px)',
                down: 'translateY(20px)',
                left: 'translateX(-20px)',
                right: 'translateX(20px)'
            };

            return AppCore.ui.animate(element, {
                transform: transforms[direction],
                opacity: '0'
            }, duration);
        }
    };
}

// Base class for all application components
class AppComponent {
    constructor(element) {
        this.element = element;
        this.isInitialized = false;
        this.eventListeners = [];
    }

    init() {
        this.isInitialized = true;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Override in subclasses
    }

    addEventListener(element, event, handler, options = {}) {
        const cleanup = AppCore.events.on(element, event, handler, options);
        this.eventListeners.push(cleanup);
        return cleanup;
    }

    destroy() {
        this.eventListeners.forEach(cleanup => cleanup());
        this.eventListeners = [];
        this.isInitialized = false;
    }

    emit(event, detail = {}) {
        AppCore.events.emit(this.element, event, detail);
    }

    on(event, handler) {
        return AppCore.events.on(this.element, event, handler);
    }
}

// Initialize core when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    AppCore.init();
    window.AppCore = AppCore;
    window.AppComponent = AppComponent;
});

// Export for global access
window.AppCore = AppCore;
window.AppComponent = AppComponent;
