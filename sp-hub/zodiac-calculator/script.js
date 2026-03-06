// ===== ZODIAC CALCULATOR MAIN SCRIPT =====

class ZodiacCalculator {
    constructor() {
        this.currentSign = null;
        this.init();
    }

    init() {
        this.setupDateInput();
        this.populateZodiacGrid();
        this.setupAnimations();
    }

    setupDateInput() {
        // Set max date to today
        const dateInput = document.getElementById('birth-date');
        const today = new Date().toISOString().split('T')[0];
        dateInput.max = today;

        // Add enter key support
        dateInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.calculateZodiac();
            }
        });
    }

    populateZodiacGrid() {
        const grid = document.getElementById('zodiac-grid');
        if (!grid) return;

        grid.innerHTML = zodiacSigns.map(sign => `
            <div class="zodiac-card" data-sign="${sign.name.toLowerCase()}">
                <div class="zodiac-card-icon" style="color: ${sign.color}">
                    <i class="fas ${sign.icon}"></i>
                </div>
                <h4>${sign.name}</h4>
                <p>${sign.dates}</p>
                <div class="element-badge" style="background: ${getElementColor(sign.element)}">
                    ${sign.element}
                </div>
            </div>
        `).join('');

        // Add click handlers
        grid.querySelectorAll('.zodiac-card').forEach(card => {
            card.addEventListener('click', () => {
                const signName = card.dataset.sign;
                const sign = zodiacSigns.find(s => s.name.toLowerCase() === signName);
                if (sign) {
                    this.displaySign(sign);
                }
            });
        });
    }

    setupAnimations() {
        // Animate floating stars
        this.animateStars();
        
        // Add cosmic particle effects
        this.createCosmicParticles();
    }

    animateStars() {
        const stars = document.querySelectorAll('.star');
        stars.forEach((star, index) => {
            star.style.animationDelay = `${index * 0.5}s`;
        });
    }

    createCosmicParticles() {
        const container = document.querySelector('.cosmic-container');
        if (!container) return;

        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'cosmic-particle';
            particle.style.cssText = `
                position: absolute;
                width: 2px;
                height: 2px;
                background: white;
                border-radius: 50%;
                opacity: 0.3;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: twinkle ${3 + Math.random() * 4}s infinite;
                animation-delay: ${Math.random() * 3}s;
            `;
            container.appendChild(particle);
        }
    }

    calculateZodiac() {
        const dateInput = document.getElementById('birth-date');
        const birthDate = dateInput.value;

        if (!birthDate) {
            this.showError('Please enter your birth date');
            return;
        }

        const date = new Date(birthDate);
        const month = date.getMonth() + 1;
        const day = date.getDate();

        this.currentSign = getZodiacSign(month, day);
        this.displaySign(this.currentSign);
        this.trackCalculation();
    }

    displaySign(sign) {
        // Update zodiac icon and name
        const iconElement = document.getElementById('zodiac-icon');
        const nameElement = document.getElementById('zodiac-name');
        const datesElement = document.getElementById('zodiac-dates');

        iconElement.innerHTML = `
            <div class="sign-symbol" style="color: ${sign.color}">
                <i class="fas ${sign.icon}"></i>
            </div>
            <div class="sign-symbol-text">${sign.symbol}</div>
        `;

        nameElement.textContent = sign.name;
        datesElement.textContent = sign.dates;

        // Update personality traits
        const traitsGrid = document.getElementById('traits-grid');
        traitsGrid.innerHTML = sign.traits.map(trait => `
            <div class="trait-item">
                <i class="fas fa-star"></i>
                <span>${trait}</span>
            </div>
        `).join('');

        // Update cosmic message
        const messageElement = document.getElementById('cosmic-message');
        messageElement.textContent = sign.message;

        // Show results section with animation
        const resultsSection = document.getElementById('results');
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Add entrance animation
        resultsSection.style.opacity = '0';
        resultsSection.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            resultsSection.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            resultsSection.style.opacity = '1';
            resultsSection.style.transform = 'translateY(0)';
        }, 100);
    }

    showError(message) {
        // Create error toast
        const toast = document.createElement('div');
        toast.className = 'error-toast';
        toast.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    trackCalculation() {
        // Track zodiac calculation event
        if (window.hub) {
            window.hub.trackEvent('zodiac_calculation', {
                sign: this.currentSign.name,
                element: this.currentSign.element
            });
        }
    }
}

// ===== PREMIUM FUNCTIONS =====

function unlockPremium() {
    const modal = document.getElementById('premium-modal');
    modal.style.display = 'flex';
    
    // Track premium unlock attempt
    if (window.hub) {
        window.hub.trackEvent('premium_unlock_attempt', { tool: 'zodiac-calculator' });
    }
}

function closePremiumModal() {
    const modal = document.getElementById('premium-modal');
    modal.style.display = 'none';
}

function processPayment() {
    // Show loading state
    const payBtn = document.querySelector('.paypal-btn');
    const originalText = payBtn.innerHTML;
    
    payBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    payBtn.disabled = true;
    
    // Simulate payment processing
    setTimeout(() => {
        // Track payment event
        if (window.hub) {
            window.hub.trackEvent('payment_initiated', { 
                tool: 'zodiac-calculator', 
                amount: 1.00 
            });
        }
        
        // In a real implementation, redirect to PayPal or open PayPal modal
        alert('Payment integration would be handled here. This would redirect to PayPal for $1.00 payment.');
        
        // Reset button
        payBtn.innerHTML = originalText;
        payBtn.disabled = false;
        closePremiumModal();
    }, 2000);
}

// ===== GLOBAL FUNCTIONS =====

function calculateZodiac() {
    window.zodiacCalc.calculateZodiac();
}

// ===== INITIALIZATION =====

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.zodiacCalc = new ZodiacCalculator();
});

// Add CSS animations dynamically
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes twinkle {
        0%, 100% { opacity: 0.3; transform: scale(1); }
        50% { opacity: 0.8; transform: scale(1.2); }
    }
    
    @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-10px) rotate(180deg); }
    }
    
    .star {
        animation: float 3s ease-in-out infinite;
    }
    
    .cosmic-particle {
        pointer-events: none;
    }
    
    .error-toast {
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(239, 68, 68, 0.9);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        z-index: 1000;
        backdrop-filter: blur(10px);
    }
    
    .error-toast.show {
        transform: translateX(0);
    }
    
    .trait-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.8rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        transition: all 0.3s ease;
    }
    
    .trait-item:hover {
        background: rgba(255, 255, 255, 0.1);
        transform: translateY(-2px);
    }
    
    .trait-item i {
        color: var(--zodiac-primary);
        font-size: 0.9rem;
    }
`;

document.head.appendChild(styleSheet);

// Export for global access
window.ZodiacCalculator = ZodiacCalculator;
window.unlockPremium = unlockPremium;
window.closePremiumModal = closePremiumModal;
window.processPayment = processPayment;
