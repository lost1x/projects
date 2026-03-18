// ===== UI COMPONENTS SYSTEM =====

/**
 * Enhanced UI components using AppCore utilities
 * Consolidates common UI patterns and interactions
 */

// Enhanced toast notification system
class ToastManager extends AppComponent {
    constructor() {
        super(document.body);
        this.container = null;
        this.toasts = new Map();
        this.init();
    }

    init() {
        super.init();
        this.createContainer();
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.className = 'toast-container';
        this.container.setAttribute('aria-live', 'polite');
        document.body.appendChild(this.container);
    }

    show(message, type = 'info', options = {}) {
        const id = Date.now().toString();
        const toast = this.createToast(id, message, type, options);
        
        this.toasts.set(id, toast);
        this.container.appendChild(toast.element);

        // Animate in
        requestAnimationFrame(() => {
            toast.element.classList.add('show');
        });

        // Auto remove
        const duration = options.duration || AppCore.config.ui.toastDuration;
        setTimeout(() => this.remove(id), duration);

        return id;
    }

    createToast(id, message, type, options) {
        const element = document.createElement('div');
        element.className = `toast toast-${type}`;
        element.setAttribute('role', 'alert');
        element.innerHTML = `
            <div class="toast-icon">
                <i class="fas fa-${this.getIcon(type)}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-message">${message}</div>
                ${options.action ? `<button class="toast-action">${options.action}</button>` : ''}
            </div>
            <button class="toast-close" aria-label="Close">
                <i class="fas fa-times"></i>
            </button>
        `;

        const toast = { id, element, type, options };

        // Event listeners
        element.querySelector('.toast-close').addEventListener('click', () => {
            this.remove(id);
        });

        if (options.action && options.onAction) {
            element.querySelector('.toast-action').addEventListener('click', () => {
                options.onAction();
                this.remove(id);
            });
        }

        return toast;
    }

    getIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    remove(id) {
        const toast = this.toasts.get(id);
        if (!toast) return;

        toast.element.classList.remove('show');
        
        setTimeout(() => {
            toast.element.remove();
            this.toasts.delete(id);
        }, AppCore.config.ui.animationDuration);
    }

    clear() {
        this.toasts.forEach((toast, id) => this.remove(id));
    }
}

// Enhanced modal system
class ModalManager extends AppComponent {
    constructor() {
        super(document.body);
        this.activeModals = new Set();
        this.init();
    }

    init() {
        super.init();
        this.setupGlobalListeners();
    }

    setupGlobalListeners() {
        // Close modals on escape
        this.addEventListener(document, 'keydown', (e) => {
            if (e.key === 'Escape' && this.activeModals.size > 0) {
                const latestModal = Array.from(this.activeModals).pop();
                this.close(latestModal);
            }
        });

        // Close on overlay click
        this.addEventListener(document, 'click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                const modal = e.target.closest('.modal');
                if (modal) this.close(modal);
            }
        });
    }

    show(content, options = {}) {
        const modal = this.createModal(content, options);
        document.body.appendChild(modal);
        this.activeModals.add(modal);

        // Animate in
        requestAnimationFrame(() => {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        });

        // Focus management
        const focusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusable) focusable.focus();

        return modal;
    }

    createModal(content, options) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', `modal-title-${Date.now()}`);

        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                ${options.title ? `
                    <div class="modal-header">
                        <h3 id="modal-title-${Date.now()}">${options.title}</h3>
                        <button class="modal-close-btn" aria-label="Close modal">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                ` : ''}
                <div class="modal-body">${content}</div>
                ${options.footer ? `<div class="modal-footer">${options.footer}</div>` : ''}
            </div>
        `;

        // Close button
        const closeBtn = modal.querySelector('.modal-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close(modal));
        }

        return modal;
    }

    close(modal) {
        if (!this.activeModals.has(modal)) return;

        modal.classList.remove('show');
        
        setTimeout(() => {
            modal.remove();
            this.activeModals.delete(modal);
            
            if (this.activeModals.size === 0) {
                document.body.style.overflow = '';
            }
        }, AppCore.config.ui.animationDuration);
    }

    confirm(message, options = {}) {
        return new Promise((resolve) => {
            const modal = this.show(`
                <p>${message}</p>
                <div class="modal-actions">
                    <button class="btn btn-secondary" data-action="cancel">
                        ${options.cancelText || 'Cancel'}
                    </button>
                    <button class="btn btn-primary" data-action="confirm">
                        ${options.confirmText || 'Confirm'}
                    </button>
                </div>
            `, {
                title: options.title || 'Confirm Action'
            });

            const handleAction = (action) => {
                this.close(modal);
                resolve(action === 'confirm');
            };

            modal.querySelector('[data-action="confirm"]').addEventListener('click', () => handleAction('confirm'));
            modal.querySelector('[data-action="cancel"]').addEventListener('click', () => handleAction('cancel'));
        });
    }

    alert(message, options = {}) {
        return new Promise((resolve) => {
            const modal = this.show(`
                <p>${message}</p>
                <div class="modal-actions">
                    <button class="btn btn-primary" data-action="ok">OK</button>
                </div>
            `, {
                title: options.title || 'Alert'
            });

            modal.querySelector('[data-action="ok"]').addEventListener('click', () => {
                this.close(modal);
                resolve();
            });
        });
    }
}

// Enhanced loading states
class LoadingManager extends AppComponent {
    constructor() {
        super(document.body);
        this.activeLoaders = new Map();
    }

    show(element, options = {}) {
        const id = this.createLoader(element, options);
        this.activeLoaders.set(id, { element, options });
        return id;
    }

    createLoader(element, options) {
        const id = Date.now().toString();
        const loader = document.createElement('div');
        loader.className = 'loading-overlay';
        loader.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-spinner fa-spin"></i>
                <span class="loading-text">${options.text || 'Loading...'}</span>
            </div>
        `;

        // Position loader over element
        const rect = element.getBoundingClientRect();
        loader.style.cssText = `
            position: absolute;
            top: ${rect.top}px;
            left: ${rect.left}px;
            width: ${rect.width}px;
            height: ${rect.height}px;
            z-index: 1000;
        `;

        document.body.appendChild(loader);
        element.style.position = 'relative';

        return id;
    }

    hide(id) {
        const loader = this.activeLoaders.get(id);
        if (!loader) return;

        const overlay = document.querySelector('.loading-overlay');
        if (overlay) overlay.remove();

        this.activeLoaders.delete(id);
    }

    setButtonLoading(button, loading = true) {
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
}

// Enhanced form validation
class FormValidator extends AppComponent {
    constructor(formElement) {
        super(formElement);
        this.form = formElement;
        this.rules = new Map();
        this.errors = new Map();
        this.init();
    }

    init() {
        super.init();
        this.setupValidation();
    }

    setupValidation() {
        this.addEventListener(this.form, 'submit', (e) => {
            if (!this.validate()) {
                e.preventDefault();
            }
        });

        // Real-time validation
        this.addEventListener(this.form, 'input', (e) => {
            if (e.target.matches('input, textarea, select')) {
                this.validateField(e.target);
            }
        });

        this.addEventListener(this.form, 'blur', (e) => {
            if (e.target.matches('input, textarea, select')) {
                this.validateField(e.target);
            }
        }, true);
    }

    addRule(fieldName, rule) {
        this.rules.set(fieldName, rule);
    }

    validate() {
        this.errors.clear();
        let isValid = true;

        this.rules.forEach((rule, fieldName) => {
            const field = this.form.querySelector(`[name="${fieldName}"]`);
            if (field && !this.validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    validateField(field) {
        const rule = this.rules.get(field.name);
        if (!rule) return true;

        const value = field.value.trim();
        let errors = [];

        // Required validation
        if (rule.required && !value) {
            errors.push(`${field.name} is required`);
        }

        // Length validation
        if (value && rule.minLength && value.length < rule.minLength) {
            errors.push(`${field.name} must be at least ${rule.minLength} characters`);
        }

        if (value && rule.maxLength && value.length > rule.maxLength) {
            errors.push(`${field.name} must not exceed ${rule.maxLength} characters`);
        }

        // Pattern validation
        if (value && rule.pattern && !rule.pattern.test(value)) {
            errors.push(rule.message || `${field.name} format is invalid`);
        }

        // Email validation
        if (value && rule.email && !AppCore.validation.isValidEmail(value)) {
            errors.push(`${field.name} must be a valid email address`);
        }

        // Custom validation
        if (rule.validate && typeof rule.validate === 'function') {
            const customError = rule.validate(value);
            if (customError) errors.push(customError);
        }

        // Update UI
        this.updateFieldUI(field, errors);

        if (errors.length > 0) {
            this.errors.set(field.name, errors);
            return false;
        } else {
            this.errors.delete(field.name);
            return true;
        }
    }

    updateFieldUI(field, errors) {
        const container = field.closest('.form-group') || field.parentElement;
        const errorElement = container.querySelector('.field-error');

        if (errors.length > 0) {
            field.classList.add('error');
            if (errorElement) {
                errorElement.textContent = errors[0];
                errorElement.style.display = 'block';
            } else {
                const error = document.createElement('div');
                error.className = 'field-error';
                error.textContent = errors[0];
                error.style.display = 'block';
                container.appendChild(error);
            }
        } else {
            field.classList.remove('error');
            if (errorElement) {
                errorElement.style.display = 'none';
            }
        }
    }

    getErrors() {
        return Array.from(this.errors.values()).flat();
    }

    getFirstError() {
        const errors = this.getErrors();
        return errors.length > 0 ? errors[0] : null;
    }
}

// Enhanced theme manager
class ThemeManager extends AppComponent {
    constructor() {
        super(document.body);
        this.currentTheme = 'dark';
        this.init();
    }

    init() {
        super.init();
        this.loadTheme();
        this.createToggleButton();
        this.setupEventListeners();
    }

    loadTheme() {
        const savedTheme = AppCore.storage.get('theme_preference');
        if (savedTheme) {
            this.currentTheme = savedTheme;
        } else {
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

        // Add to header
        const header = document.querySelector('.header-content, .profile-navbar-content');
        if (header) {
            header.appendChild(this.toggleButton);
        }
    }

    setupEventListeners() {
        this.addEventListener(this.toggleButton, 'click', () => {
            this.toggleTheme();
        });

        // System theme changes
        window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
            if (!AppCore.storage.get('theme_preference')) {
                this.currentTheme = e.matches ? 'light' : 'dark';
                this.applyTheme();
                this.updateToggleButton();
            }
        });

        // Keyboard shortcut
        this.addEventListener(document, 'keydown', (e) => {
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
        this.showNotification();
    }

    applyTheme() {
        if (this.currentTheme === 'light') {
            document.body.classList.add('light-mode');
        } else {
            document.body.classList.remove('light-mode');
        }
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
        AppCore.storage.set('theme_preference', this.currentTheme);
        
        // Save to user profile if logged in
        if (window.Auth?.isAuthenticated) {
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

    showNotification() {
        AppCore.ui.showToast(
            `${this.currentTheme === 'dark' ? '🌙' : '☀️'} ${this.currentTheme} mode activated`,
            'info',
            { duration: 2000 }
        );
    }

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

// Initialize UI components
document.addEventListener('DOMContentLoaded', () => {
    window.Toast = new ToastManager();
    window.Modal = new ModalManager();
    window.Loading = new LoadingManager();
    window.Theme = new ThemeManager();
    
    // Expose FormValidator as a class for instantiation
    window.FormValidator = FormValidator;
    
    // Backward compatibility
    window.showToast = (message, type, options) => window.Toast.show(message, type, options);
    window.showModal = (content, options) => window.Modal.show(content, options);
    window.showConfirm = (message, options) => window.Modal.confirm(message, options);
});

// Export for global access
window.ToastManager = ToastManager;
window.ModalManager = ModalManager;
window.LoadingManager = LoadingManager;
window.ThemeManager = ThemeManager;
window.FormValidator = FormValidator;
