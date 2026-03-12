// ===== SPAAROW HUB MAIN JAVASCRIPT =====

class SpaarowHub {
    constructor() {
        this.isLoaded = false;
        this.performanceMode = this.checkPerformanceMode();
        this.init();
    }

    init() {
        // Initialize with performance optimizations
        this.setupPerformanceOptimizations();
        this.setupEventListeners();
        this.setupAnimations();
        this.setupAnalytics();
        this.setupServiceWorker();
    }

    checkPerformanceMode() {
        // Check user's device capabilities
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

    setupPerformanceOptimizations() {
        // Lazy loading for images
        this.setupLazyLoading();
        
        // Optimize animations based on device capabilities
        this.optimizeAnimations();
        
        // Setup intersection observer for performance
        this.setupIntersectionObserver();
    }

    setupLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });

        images.forEach(img => imageObserver.observe(img));
    }

    optimizeAnimations() {
        if (this.performanceMode.reducedMotion || this.performanceMode.lowEndDevice) {
            // Disable heavy animations
            document.body.classList.add('reduced-animations');
        }
        
        if (this.performanceMode.reducedData) {
            // Disable background animations
            document.body.classList.add('reduced-data');
        }
    }

    setupIntersectionObserver() {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Add GPU acceleration for smooth animations
                    entry.target.classList.add('gpu-accelerated');
                }
            });
        }, observerOptions);

        // Observe all cards and sections
        const elementsToObserve = document.querySelectorAll('.tool-card, section, .card');
        elementsToObserve.forEach(el => this.intersectionObserver.observe(el));
    }

    setupServiceWorker() {
        // Register service worker for caching (if supported)
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js').catch(() => {
                // Service worker registration failed, but that's okay
            });
        }
    }

    setupEventListeners() {
        // Add hover effects to cards
        const cards = document.querySelectorAll('.tool-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => this.onCardHover(card, true));
            card.addEventListener('mouseleave', () => this.onCardHover(card, false));
        });

        // Add keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e));
    }

    handleToolClick(event, toolName) {
        event.preventDefault();
        
        // Add loading state to button
        const button = event.currentTarget;
        this.addLoadingState(button);
        
        // Show micro-feedback
        this.showMicroFeedback(`Loading ${this.getToolDisplayName(toolName)}...`, 'info');
        
        // Simulate loading delay for better UX
        setTimeout(() => {
            this.removeLoadingState(button);
            this.showMicroFeedback(`Opening ${this.getToolDisplayName(toolName)}!`, 'success');
            
            // Navigate to tool
            window.location.href = button.href;
        }, 800);
    }

    getToolDisplayName(toolName) {
        const names = {
            lovequiz: 'Love Language Quiz',
            mytarot: 'Tarot Reading',
            'dream-interpreter': 'Dream Interpreter',
            'fortune-teller': 'Fortune Teller',
            'zodiac-calculator': 'Zodiac Calculator',
            numerology: 'Numerology Calculator'
        };
        return names[toolName] || toolName;
    }

    setupAnimations() {
        // Animate cards on scroll
        this.observeCards();
        
        // Add parallax effect to floating orbs
        this.setupParallax();
    }

    setupAnalytics() {
        // Track page views
        this.trackPageView();
        
        // Track card interactions
        const cards = document.querySelectorAll('.tool-card');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const tool = card.dataset.tool;
                this.trackEvent('tool_click', { tool });
            });
        });
    }

    onCardHover(card, isHovering) {
        if (isHovering) {
            card.style.transform = 'translateY(-10px) scale(1.02)';
            card.style.boxShadow = '0 20px 40px rgba(107, 70, 193, 0.3)';
        } else {
            card.style.transform = 'translateY(0) scale(1)';
            card.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
        }
    }

    addGlowEffect(card) {
        const theme = card.dataset.theme;
        if (!theme) return;

        const colors = {
            love: 'rgba(236, 72, 153, 0.4)',
            tarot: 'rgba(107, 70, 193, 0.4)',
            dream: 'rgba(59, 130, 246, 0.4)',
            fortune: 'rgba(249, 115, 22, 0.4)',
            zodiac: 'rgba(20, 184, 166, 0.4)',
            numerology: 'rgba(147, 51, 234, 0.4)'
        };

        card.style.boxShadow = `0 20px 25px rgba(0, 0, 0, 0.1), 0 0 30px ${colors[theme]}`;
    }

    removeGlowEffect(card) {
        card.style.boxShadow = '';
    }

    observeCards() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });

        const cards = document.querySelectorAll('.tool-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(50px)';
            card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
            observer.observe(card);
        });
    }

    setupParallax() {
        document.addEventListener('mousemove', (e) => {
            const orbs = document.querySelectorAll('.floating-orb');
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;

            orbs.forEach((orb, index) => {
                const speed = (index + 1) * 10;
                const xOffset = (x - 0.5) * speed;
                const yOffset = (y - 0.5) * speed;
                
                orb.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
            });
        });
    }

    handleKeyboardNavigation(e) {
        const cards = Array.from(document.querySelectorAll('.tool-card:not(.coming-soon)'));
        const focusedCard = document.activeElement.closest('.tool-card');
        
        if (!focusedCard) return;

        const currentIndex = cards.indexOf(focusedCard);
        let nextIndex = currentIndex;

        switch(e.key) {
            case 'ArrowRight':
            case 'ArrowDown':
                nextIndex = (currentIndex + 1) % cards.length;
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
                nextIndex = (currentIndex - 1 + cards.length) % cards.length;
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                this.navigateToTool(focusedCard.dataset.tool);
                return;
        }

        if (nextIndex !== currentIndex) {
            e.preventDefault();
            cards[nextIndex].focus();
        }
    }

    navigateToTool(tool) {
        if (!tool || tool === 'coming-soon') return;

        // Add loading state
        const card = document.querySelector(`[data-tool="${tool}"]`);
        if (card) {
            card.classList.add('loading');
        }

        // Track navigation
        this.trackEvent('navigation', { tool });

        // Navigate to tool
        setTimeout(() => {
            window.location.href = `/${tool}/`;
        }, 300);
    }

    trackPageView() {
        // Simple analytics tracking
        console.log('Page view: Spaarow Hub');
        
        // In a real implementation, you'd send this to your analytics service
        // gtag('config', 'GA_MEASUREMENT_ID', { page_path: '/' });
    }

    trackEvent(eventName, parameters = {}) {
        // Simple event tracking
        console.log('Event:', eventName, parameters);
        
        // In a real implementation, you'd send this to your analytics service
        // gtag('event', eventName, parameters);
    }
}

// ===== UTILITY FUNCTIONS =====

function navigateToTool(tool) {
    window.hub.navigateToTool(tool);
}

function showPrivacy() {
    showModal('Privacy Policy', 'Your privacy is important to us. We collect minimal data necessary to provide our services...');
}

function showTerms() {
    showModal('Terms of Service', 'By using our services, you agree to our terms and conditions...');
}

function showSupport() {
    showModal('Support', 'Need help? Contact us at support@spaarowhub.great-site.net');
}

function showModal(title, content) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="closeModal()">
                <div class="modal-content" onclick="event.stopPropagation()">
                    <div class="modal-header">
                        <h3 id="modal-title"></h3>
                        <button class="modal-close" onclick="closeModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body" id="modal-body"></div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Set content
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = `<p>${content}</p>`;

    // Show modal
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// ===== CSS FOR MODAL (injected dynamically) =====

const modalStyles = `
<style>
#modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(5px);
}

.modal-content {
    position: relative;
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: 20px;
    padding: 0;
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    backdrop-filter: blur(10px);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-lg);
    border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
    margin: 0;
    color: var(--text-primary);
}

.modal-close {
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 50%;
    transition: all var(--transition-fast);
}

.modal-close:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
}

.modal-body {
    padding: var(--spacing-lg);
    color: var(--text-secondary);
    line-height: 1.6;
}

@media (max-width: 768px) {
    .modal-content {
        margin: var(--spacing-md);
        width: calc(100% - 2rem);
    }
    
    .modal-header,
    .modal-body {
        padding: var(--spacing-md);
    }
}
</style>
`;

// Inject modal styles
if (!document.getElementById('modal-styles')) {
    const styleElement = document.createElement('div');
    styleElement.id = 'modal-styles';
    styleElement.innerHTML = modalStyles;
    document.head.appendChild(styleElement);
}

// ===== INITIALIZATION =====

// Initialize the hub when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.hub = new SpaarowHub();
    
    // Add smooth reveal animation to header
    const header = document.querySelector('.header');
    if (header) {
        header.style.opacity = '0';
        header.style.transform = 'translateY(-30px)';
        header.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        
        setTimeout(() => {
            header.style.opacity = '1';
            header.style.transform = 'translateY(0)';
        }, 100);
    }
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        window.hub.trackPageView();
    }
});

// Export for global access
window.SpaarowHub = SpaarowHub;
window.navigateToTool = navigateToTool;
window.showPrivacy = showPrivacy;
window.showTerms = showTerms;
window.showSupport = showSupport;
window.closeModal = closeModal;

// ===== SUGGESTION SYSTEM =====

class SuggestionSystem {
    constructor() {
        this.suggestions = [];
        this.loadSuggestions();
        this.updateVoteCount();
    }

    loadSuggestions() {
        const stored = localStorage.getItem('toolSuggestions');
        if (stored) {
            this.suggestions = JSON.parse(stored);
        }
    }

    saveSuggestions() {
        localStorage.setItem('toolSuggestions', JSON.stringify(this.suggestions));
    }

    async addSuggestion(suggestion) {
        if (!this.suggestions.includes(suggestion)) {
            this.suggestions.push(suggestion);
            this.saveSuggestions();
            this.updateVoteCount();
            
            // Show loading feedback
            this.showFeedback('Opening email client...', 'info');
            
            // Send email notification
            await this.emailSuggestion(suggestion);
            
            // Show success feedback
            setTimeout(() => {
                this.showFeedback('Thank you for your suggestion!', 'success');
            }, 1000);
        } else {
            this.showFeedback('You already suggested this!', 'info');
        }
    }

    async emailSuggestion(suggestion) {
        try {
            // Create email content
            const subject = encodeURIComponent('New Tool Suggestion - Spaarow Hub');
            const body = encodeURIComponent(`
New Tool Suggestion Received:

Suggestion: ${suggestion}
Date: ${new Date().toLocaleString()}
User Agent: ${navigator.userAgent}

---
This suggestion was submitted from the Spaarow Hub mystical tools platform.
            `);
            
            // Create mailto link
            const mailtoLink = `mailto:spaarow@icloud.com?subject=${subject}&body=${body}`;
            
            // Open email client
            window.open(mailtoLink, '_blank');
            
            console.log('Email client opened for suggestion:', suggestion);
        } catch (error) {
            console.error('Error sending suggestion email:', error);
            this.showFeedback('Error sending suggestion. Please try again.', 'error');
        }
    }

    updateVoteCount() {
        const count = this.suggestions.length;
        document.getElementById('vote-count').textContent = count;
    }

    showFeedback(message, type = 'info') {
        const feedback = document.createElement('div');
        feedback.className = `suggestion-feedback ${type}`;
        feedback.textContent = message;
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 10px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        `;
        
        if (type === 'success') {
            feedback.style.background = 'rgba(34, 197, 94, 0.9)';
        } else if (type === 'error') {
            feedback.style.background = 'rgba(239, 68, 68, 0.9)';
        } else {
            feedback.style.background = 'rgba(59, 130, 246, 0.9)';
        }
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (feedback.parentNode) {
                    feedback.parentNode.removeChild(feedback);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize suggestion system
window.suggestionSystem = new SuggestionSystem();

// Global functions for suggestion system
window.addSuggestion = (suggestion) => window.suggestionSystem.addSuggestion(suggestion);
window.submitSuggestion = () => {
    const input = document.getElementById('tool-suggestion');
    const suggestion = input.value.trim();
    
    if (suggestion) {
        window.suggestionSystem.addSuggestion(suggestion);
        input.value = '';
        input.focus();
    }
};
