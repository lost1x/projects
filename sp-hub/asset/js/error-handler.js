// Standardized error handling utility
const ErrorHandler = {
    // Standard error response format
    createError(message, code = 'UNKNOWN_ERROR', details = null) {
        return {
            error: true,
            message,
            code,
            details,
            timestamp: new Date().toISOString()
        };
    },

    // Handle API responses consistently
    async handleApiResponse(response) {
        try {
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || data.message || `HTTP ${response.status}`);
            }
            
            return data;
        } catch (error) {
            if (error instanceof SyntaxError) {
                throw new Error('Invalid server response');
            }
            throw error;
        }
    },

    // Log errors with context
    logError(error, context = {}) {
        const errorInfo = {
            message: error.message || error,
            stack: error.stack,
            context,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        console.error('Application Error:', errorInfo);
        
        // In production, you might want to send this to a logging service
        if (typeof gtag !== 'undefined') {
            gtag('event', 'exception', {
                description: error.message,
                fatal: false
            });
        }
    },

    // Show user-friendly error messages
    showError(error, fallbackMessage = 'An error occurred. Please try again.') {
        const message = error.message || fallbackMessage;
        
        // Dispatch custom event for UI components to handle
        window.dispatchEvent(new CustomEvent('appError', {
            detail: { message, error }
        }));
        
        // Fallback to console if no UI handler
        if (!document.querySelector('.toast-container')) {
            console.error('Error:', message);
        }
    },

    // Initialize global error handlers
    init() {
        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.logError(event.reason, { type: 'unhandled_promise_rejection' });
            this.showError(event.reason, 'An unexpected error occurred.');
            event.preventDefault();
        });

        // Handle uncaught errors
        window.addEventListener('error', (event) => {
            this.logError(event.error || new Error(event.message), { 
                type: 'uncaught_error',
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
            this.showError(event.error, 'An unexpected error occurred.');
        });
    }
};

// Initialize error handling
if (typeof window !== 'undefined') {
    ErrorHandler.init();
}
