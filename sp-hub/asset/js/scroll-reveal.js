// Scroll-reveal animations for tool cards
class ScrollReveal {
    constructor() {
        this.elements = [];
        this.observer = null;
        this.init();
    }

    init() {
        // Get all tool cards
        this.elements = document.querySelectorAll('.tool-card');
        
        if (this.elements.length === 0) return;

        // Set up Intersection Observer
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add revealed class with slight delay for smooth animation
                    setTimeout(() => {
                        entry.target.classList.add('revealed');
                    }, 100);
                    
                    // Stop observing once revealed
                    this.observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1, // Trigger when 10% of element is visible
            rootMargin: '0px 0px -50px 0px' // Start animation slightly before element comes into view
        });

        // Start observing all elements
        this.elements.forEach(element => {
            this.observer.observe(element);
        });

        // Handle elements already in view on page load
        this.checkInitialVisibility();
    }

    checkInitialVisibility() {
        this.elements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const isVisible = (
                rect.top < (window.innerHeight || document.documentElement.clientHeight) &&
                rect.bottom > 0 &&
                rect.left < (window.innerWidth || document.documentElement.clientWidth) &&
                rect.right > 0
            );

            if (isVisible) {
                setTimeout(() => {
                    element.classList.add('revealed');
                }, 200 + Math.random() * 300); // Random delay for staggered effect
                this.observer.unobserve(element);
            }
        });
    }

    // Public method to manually reveal elements
    revealAll() {
        this.elements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add('revealed');
            }, index * 100); // Staggered reveal
        });
    }

    // Clean up
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Only run on main hub page with tool cards
    if (document.querySelector('.tool-grid') || document.querySelector('.tools-container')) {
        window.scrollReveal = new ScrollReveal();
    }
});

// Export for global access
window.ScrollReveal = ScrollReveal;
