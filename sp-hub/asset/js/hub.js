// ===== SPAAROW HUB - ENHANCED INTERACTIONS =====

class SpaarowHub {
    constructor() {
        this.particles = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.isLoaded = false;
        this.init();
    }

    init() {
        this.setupParticles();
        this.setupEventListeners();
        this.setupCardInteractions();
        this.loadToolCards();
        this.startAnimations();
    }

    setupParticles() {
        const container = document.getElementById('particleContainer');
        if (!container) return;

        // Create floating particles
        for (let i = 0; i < 30; i++) {
            this.createParticle(container);
        }
    }

    createParticle(container) {
        const particle = document.createElement('div');
        particle.className = 'cosmic-particle';
        
        // Random properties
        const size = Math.random() * 4 + 1;
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 10;
        const startX = Math.random() * window.innerWidth;
        
        particle.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${startX}px;
            animation-delay: ${delay}s;
            animation-duration: ${duration}s;
            background: rgba(255, 255, 255, ${Math.random() * 0.8 + 0.2});
        `;
        
        container.appendChild(particle);
        this.particles.push(particle);
    }

    setupEventListeners() {
        // Mouse tracking for interactive effects
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            this.updateMouseEffects();
        });

        // Scroll effects
        window.addEventListener('scroll', () => {
            this.updateScrollEffects();
        });

        // Resize handler
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    setupCardInteractions() {
        const cards = document.querySelectorAll('.tool-card');
        
        cards.forEach(card => {
            // Enhanced hover effects
            card.addEventListener('mouseenter', (e) => {
                this.onCardHover(card, true, e);
            });
            
            card.addEventListener('mouseleave', (e) => {
                this.onCardHover(card, false, e);
            });

            // Click ripple effect
            card.addEventListener('click', (e) => {
                this.createRippleEffect(card, e);
            });
        });
    }

    onCardHover(card, isHovering, event) {
        const theme = card.dataset.theme;
        const glow = card.querySelector('.card-glow');
        
        if (isHovering) {
            // Enhanced glow effect
            if (glow) {
                const rect = card.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
                
                glow.style.cssText = `
                    background: radial-gradient(circle at ${x}px ${y}px, 
                        rgba(255,255,255,0.3) 0%, 
                        rgba(255,255,255,0.1) 40%, 
                        transparent 70%);
                    opacity: 1;
                    animation: glowPulse 2s ease-in-out infinite;
                `;
            }
            
            // Add floating effect
            card.style.transform = 'translateY(-10px) scale(1.02)';
            card.style.zIndex = '10';
        } else {
            // Reset effects
            card.style.transform = '';
            card.style.zIndex = '';
            
            if (glow) {
                glow.style.cssText = '';
            }
        }
    }

    createRippleEffect(card, event) {
        const ripple = document.createElement('div');
        ripple.className = 'card-ripple';
        
        const rect = card.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 70%);
            border-radius: 50%;
            transform: scale(0);
            animation: rippleExpand 0.6s ease-out;
            pointer-events: none;
            z-index: 100;
        `;
        
        card.appendChild(ripple);
        
        // Remove after animation
        setTimeout(() => {
            if (card.contains(ripple)) {
                card.removeChild(ripple);
            }
        }, 600);
    }

    loadToolCards() {
        // Dynamic tool card loading with staggered animation
        const cards = document.querySelectorAll('.tool-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(50px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.6s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
                
                // Add entrance animation
                setTimeout(() => {
                    card.classList.add('loaded');
                }, 600);
            }, index * 100);
        });
    }

    updateMouseEffects() {
        // Parallax effect on particles
        this.particles.forEach((particle, index) => {
            const speed = (index % 3 + 1) * 0.01;
            const x = (this.mouseX - window.innerWidth / 2) * speed;
            const y = (this.mouseY - window.innerHeight / 2) * speed;
            
            particle.style.transform = `translate(${x}px, ${y}px)`;
        });
    }

    updateScrollEffects() {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero-section');
        
        if (hero) {
            hero.style.transform = `translateY(${scrolled * 0.5}px)`;
            hero.style.opacity = 1 - scrolled / 500;
        }
    }

    handleResize() {
        // Recreate particles for new screen size
        const container = document.getElementById('particleContainer');
        if (container) {
            container.innerHTML = '';
            this.particles = [];
            this.setupParticles();
        }
    }

    startAnimations() {
        // Ambient animations
        this.animateTitle();
        this.animateBackground();
    }

    animateTitle() {
        const title = document.querySelector('.main-title');
        if (!title) return;

        // Subtle floating animation
        let time = 0;
        setInterval(() => {
            time += 0.01;
            const float = Math.sin(time) * 5;
            title.style.transform = `translateY(${float}px)`;
        }, 50);
    }

    animateBackground() {
        const background = document.getElementById('cosmicBackground');
        if (!background) return;

        // Color shifting effect
        let hue = 0;
        setInterval(() => {
            hue = (hue + 0.1) % 360;
            const color1 = `hsl(${hue}, 20%, 10%)`;
            const color2 = `hsl(${(hue + 60) % 360}, 25%, 15%)`;
            
            background.style.background = `radial-gradient(ellipse at center, ${color1} 0%, ${color2} 50%, #050510 100%)`;
        }, 100);
    }
}

// ===== UTILITY FUNCTIONS =====

function navigateToTool(toolName) {
    // Add loading state
    const button = event.currentTarget;
    const originalContent = button.innerHTML;
    
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    button.disabled = true;
    
    // Simulate loading for better UX
    setTimeout(() => {
        window.location.href = `${toolName}/`;
    }, 800);
}

// ===== CSS ANIMATIONS (injected dynamically) =====

const hubAnimations = `
<style>
@keyframes rippleExpand {
    0% {
        transform: scale(0);
        opacity: 1;
    }
    100% {
        transform: scale(2);
        opacity: 0;
    }
}

@keyframes glowPulse {
    0%, 100% {
        transform: rotate(0deg) scale(1);
        opacity: 0.8;
    }
    50% {
        transform: rotate(180deg) scale(1.2);
        opacity: 1;
    }
}

.tool-card.loaded {
    animation: cardEntrance 0.8s ease-out;
}

@keyframes cardEntrance {
    0% {
        opacity: 0;
        transform: translateY(50px) scale(0.9);
    }
    100% {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

/* Enhanced card states */
.tool-card:hover .card-background {
    opacity: 0.3;
    transition: all 0.3s ease;
}

.tool-card:hover .card-pattern {
    animation-duration: 5s;
}

/* Loading states */
.card-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none !important;
}

.card-button .fa-spinner {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}
</style>
`;

// ===== INITIALIZATION =====

document.addEventListener('DOMContentLoaded', () => {
    // Inject animations
    document.head.insertAdjacentHTML('beforeend', hubAnimations);
    
    // Initialize hub
    window.spaarowHub = new SpaarowHub();
    
    // Add loading complete class
    setTimeout(() => {
        document.body.classList.add('hub-loaded');
    }, 1000);
});

// ===== PERFORMANCE OPTIMIZATIONS =====

// Throttled scroll handler
let scrollTimer;
window.addEventListener('scroll', () => {
    if (scrollTimer) {
        clearTimeout(scrollTimer);
    }
    scrollTimer = setTimeout(() => {
        // Scroll-based animations
    }, 16);
});

// Intersection Observer for lazy loading
const observerOptions = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1
};

const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe all cards when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.tool-card');
    cards.forEach(card => cardObserver.observe(card));
});
