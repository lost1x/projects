// ===== JAVASCRIPT UTILITIES =====

class Utils {
    // DOM Utilities
    static $(selector) {
        return document.querySelector(selector);
    }

    static $$(selector) {
        return document.querySelectorAll(selector);
    }

    static createElement(tag, className = '', innerHTML = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (innerHTML) element.innerHTML = innerHTML;
        return element;
    }

    // Array Utilities
    static getRandomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    static getRandomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // String Utilities
    static capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    static truncate(str, maxLength) {
        return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
    }

    // Storage Utilities
    static storage = {
        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch {
                return defaultValue;
            }
        },

        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch (e) {
                console.warn('Failed to save to localStorage:', e);
            }
        },

        remove(key) {
            localStorage.removeItem(key);
        }
    };

    // Animation Utilities
    static animate(element, properties, duration = 300) {
        return new Promise(resolve => {
            element.style.transition = `all ${duration}ms ease`;
            
            Object.entries(properties).forEach(([prop, value]) => {
                element.style[prop] = value;
            });

            setTimeout(resolve, duration);
        });
    }

    // Debounce Utility
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Throttle Utility
    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Event Utilities
    static on(element, event, handler, options = {}) {
        element.addEventListener(event, handler, options);
        return () => element.removeEventListener(event, handler, options);
    }

    // Toast Notification Utility
    static showToast(message, type = 'info', duration = 3000) {
        const toast = Utils.createElement('div', `toast toast-${type}`, `
            <i class="fas fa-${this.getToastIcon(type)}"></i>
            <span>${message}</span>
        `);

        document.body.appendChild(toast);

        // Animate in
        Utils.animate(toast, { transform: 'translateX(0)', opacity: '1' }, 300);

        // Remove after duration
        setTimeout(() => {
            Utils.animate(toast, { transform: 'translateX(100%)', opacity: '0' }, 300)
                .then(() => toast.remove());
        }, duration);
    }

    static getToastIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    // Loading State Utility
    static setLoading(button, loading = true) {
        if (loading) {
            button.dataset.originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
            button.disabled = true;
        } else {
            button.innerHTML = button.dataset.originalText || button.innerHTML;
            button.disabled = false;
            delete button.dataset.originalText;
        }
    }

    // Form Validation Utility
    static validateForm(formData, rules) {
        const errors = [];

        Object.entries(rules).forEach(([field, rule]) => {
            const value = formData[field];
            
            if (rule.required && (!value || value.trim() === '')) {
                errors.push(`${field} is required`);
            }

            if (rule.minLength && value.length < rule.minLength) {
                errors.push(`${field} must be at least ${rule.minLength} characters`);
            }

            if (rule.maxLength && value.length > rule.maxLength) {
                errors.push(`${field} must not exceed ${rule.maxLength} characters`);
            }

            if (rule.pattern && !rule.pattern.test(value)) {
                errors.push(`${field} format is invalid`);
            }
        });

        return errors;
    }

    // Modal Utility
    static modal = {
        show(modalElement) {
            modalElement.classList.add('active');
            modalElement.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            
            // Focus management
            const focusableElements = modalElement.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (focusableElements.length > 0) {
                focusableElements[0].focus();
            }
        },

        hide(modalElement) {
            modalElement.classList.remove('active');
            modalElement.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        },

        create(content, options = {}) {
            const modal = Utils.createElement('div', 'modal', `
                <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>${options.title || 'Modal'}</h3>
                        <button class="modal-close-btn" onclick="this.parentElement.parentElement.parentElement.remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                </div>
            `);

            document.body.appendChild(modal);
            Utils.modal.show(modal);
            return modal;
        }
    };

    // API Utility (for future use)
    static api = {
        async request(url, options = {}) {
            try {
                const response = await fetch(url, {
                    headers: {
                        'Content-Type': 'application/json',
                        ...options.headers
                    },
                    ...options
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                return await response.json();
            } catch (error) {
                console.error('API request failed:', error);
                throw error;
            }
        }
    };
}

// Export for global use
window.Utils = Utils;
