// ===== FORTUNE TELLER MAIN SCRIPT =====

class FortuneTeller {
    constructor() {
        this.currentFortune = null;
        this.isRevealing = false;
        this.init();
    }

    init() {
        this.setupFormValidation();
        this.populateMethods();
        this.populateSacredNumbers();
        this.setupAnimations();
        this.setupCrystalBallInteraction();
    }

    setupFormValidation() {
        const question = document.getElementById('user-question');
        const charCount = document.getElementById('question-char-count');
        
        // Character counter
        question.addEventListener('input', () => {
            const count = question.value.length;
            charCount.textContent = count;
            
            if (count > 200) {
                question.value = question.value.substring(0, 200);
                charCount.textContent = 200;
            }
            
            // Update counter color
            if (count > 150) {
                charCount.style.color = '#FF6B6B';
            } else if (count > 100) {
                charCount.style.color = '#FFD700';
            } else {
                charCount.style.color = 'var(--text-secondary)';
            }
        });

        // Form submission on Enter
        question.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.revealFortune();
            }
        });
    }

    populateMethods() {
        const grid = document.getElementById('methods-grid');
        if (!grid) return;

        grid.innerHTML = fortuneMethods.map(method => `
            <div class="method-card" onclick="showMethodDetails('${method.name}')">
                <div class="method-icon">
                    <i class="fas ${method.icon}"></i>
                </div>
                <h4>${method.name}</h4>
                <p>${method.description}</p>
                <div class="method-origin">
                    <span>${method.origin}</span>
                </div>
            </div>
        `).join('');
    }

    populateSacredNumbers() {
        const grid = document.getElementById('numbers-grid');
        if (!grid) return;

        grid.innerHTML = sacredNumbers.map(num => `
            <div class="number-card">
                <div class="number-symbol">
                    <span class="number-value">${num.number}</span>
                    <div class="number-meaning">${num.meaning}</div>
                </div>
                <div class="number-details">
                    <p class="number-description">${num.description}</p>
                    <div class="number-energy">
                        <strong>Energy:</strong> ${num.energy}
                    </div>
                    <div class="number-symbolism">
                        <strong>Symbolism:</strong> ${num.symbolism}
                    </div>
                </div>
            </div>
        `).join('');
    }

    setupAnimations() {
        // Animate mystical particles
        this.animateParticles();
        
        // Add crystal ball glow effect
        this.animateCrystalBall();
    }

    animateParticles() {
        const particles = document.querySelectorAll('.particle');
        particles.forEach((particle, index) => {
            particle.style.animationDelay = `${index * 0.8}s`;
        });
    }

    animateCrystalBall() {
        const crystalBall = document.getElementById('crystal-ball');
        if (!crystalBall) return;

        // Add hover effect
        crystalBall.addEventListener('mouseenter', () => {
            crystalBall.classList.add('glowing');
        });

        crystalBall.addEventListener('mouseleave', () => {
            crystalBall.classList.remove('glowing');
        });

        // Add mystical swirl animation
        setInterval(() => {
            if (!this.isRevealing) {
                crystalBall.classList.add('swirling');
                setTimeout(() => {
                    crystalBall.classList.remove('swirling');
                }, 3000);
            }
        }, 8000);
    }

    setupCrystalBallInteraction() {
        const crystalBall = document.getElementById('crystal-ball');
        if (!crystalBall) return;

        crystalBall.addEventListener('click', () => {
            if (!this.isRevealing) {
                this.revealFortune();
            }
        });

        // Add parallax effect
        document.addEventListener('mousemove', (e) => {
            const rect = crystalBall.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const angleX = (e.clientY - centerY) / 20;
            const angleY = (e.clientX - centerX) / 20;
            
            crystalBall.style.transform = `rotateX(${-angleX}deg) rotateY(${angleY}deg)`;
        });
    }

    revealFortune() {
        if (this.isRevealing) return;

        const category = document.getElementById('fortune-category').value;
        const question = document.getElementById('user-question').value.trim();
        const timeframe = document.getElementById('timeframe').value;

        // Validation
        if (!category) {
            this.showError('Please select a category for your fortune reading');
            return;
        }

        // Start the reveal process
        this.isRevealing = true;
        this.startRevealAnimation();

        // Generate fortune
        setTimeout(() => {
            this.currentFortune = generateFortune(category, question, timeframe);
            this.displayResults();
            this.trackFortuneReading();
        }, 3000);
    }

    startRevealAnimation() {
        const crystalBall = document.getElementById('crystal-ball');
        const btn = document.querySelector('.fortune-btn');
        
        // Update button
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gazing into the future...';
        btn.disabled = true;
        btn.dataset.originalText = originalText;

        // Add intense crystal ball animation
        crystalBall.classList.add('revealing');
        
        // Add mystical sound effect (visual feedback)
        this.createMysticalEffect();
    }

    createMysticalEffect() {
        const container = document.querySelector('.mystical-container');
        if (!container) return;

        // Create mystical energy particles
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = 'energy-particle';
                particle.style.cssText = `
                    position: absolute;
                    width: 4px;
                    height: 4px;
                    background: radial-gradient(circle, #F97316, transparent);
                    border-radius: 50%;
                    pointer-events: none;
                    animation: energy-burst ${2 + Math.random() * 2}s ease-out forwards;
                `;
                
                // Random position around crystal ball
                const angle = Math.random() * Math.PI * 2;
                const distance = 100 + Math.random() * 100;
                const centerX = window.innerWidth / 2;
                const centerY = window.innerHeight / 2;
                
                particle.style.left = `${centerX + Math.cos(angle) * distance}px`;
                particle.style.top = `${centerY + Math.sin(angle) * distance}px`;
                
                container.appendChild(particle);
                
                // Remove particle after animation
                setTimeout(() => particle.remove(), 4000);
            }, i * 100);
        }
    }

    displayResults() {
        // Hide loading state
        this.hideRevealAnimation();

        // Update category badge
        const categoryBadge = document.getElementById('category-badge');
        categoryBadge.innerHTML = `
            <i class="fas ${this.currentFortune.category.icon}"></i>
            <span>${this.currentFortune.category.name}</span>
        `;
        categoryBadge.style.background = this.currentFortune.category.color;

        // Update fortune text
        const fortuneText = document.getElementById('fortune-text');
        fortuneText.innerHTML = `
            <div class="fortune-message">
                <p>${this.currentFortune.fortune}</p>
            </div>
        `;

        // Update alignment info
        const alignmentInfo = document.getElementById('alignment-info');
        alignmentInfo.innerHTML = `
            <p><strong>Cosmic Alignment:</strong> ${this.currentFortune.alignment}</p>
        `;

        // Update guidance
        const guidanceText = document.getElementById('guidance-text');
        guidanceText.innerHTML = `
            <p>${this.currentFortune.guidance}</p>
        `;

        // Update lucky elements
        const luckyElements = document.getElementById('lucky-elements');
        luckyElements.innerHTML = `
            <div class="lucky-item">
                <i class="fas fa-dice"></i>
                <span><strong>Lucky Numbers:</strong> ${this.currentFortune.luckyElements.numbers.join(', ')}</span>
            </div>
            <div class="lucky-item">
                <i class="fas fa-palette"></i>
                <span><strong>Lucky Color:</strong> ${this.currentFortune.luckyElements.color}</span>
            </div>
            <div class="lucky-item">
                <i class="fas fa-gem"></i>
                <span><strong>Lucky Stone:</strong> ${this.currentFortune.luckyElements.stone}</span>
            </div>
            <div class="lucky-item">
                <i class="fas fa-calendar-day"></i>
                <span><strong>Lucky Day:</strong> ${this.currentFortune.luckyElements.day}</span>
            </div>
        `;

        // Show results section with animation
        const resultsSection = document.getElementById('results');
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Add entrance animation
        resultsSection.style.opacity = '0';
        resultsSection.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            resultsSection.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            resultsSection.style.opacity = '1';
            resultsSection.style.transform = 'translateY(0)';
        }, 100);

        // Reset reveal state
        this.isRevealing = false;
    }

    hideRevealAnimation() {
        const crystalBall = document.getElementById('crystal-ball');
        const btn = document.querySelector('.fortune-btn');
        
        crystalBall.classList.remove('revealing');
        btn.innerHTML = btn.dataset.originalText || '<i class="fas fa-eye"></i> Reveal My Fortune';
        btn.disabled = false;
    }

    showError(message) {
        // Create error toast
        const toast = document.createElement('div');
        toast.className = 'error-toast';
        toast.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
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

    trackFortuneReading() {
        // Track fortune reading event
        if (window.hub) {
            window.hub.trackEvent('fortune_reading', {
                category: document.getElementById('fortune-category').value,
                timeframe: document.getElementById('timeframe').value,
                hasQuestion: !!document.getElementById('user-question').value.trim()
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
        window.hub.trackEvent('premium_unlock_attempt', { tool: 'fortune-teller' });
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
                tool: 'fortune-teller', 
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

function showMethodDetails(methodName) {
    const method = fortuneMethods.find(m => m.name === methodName);
    if (!method) return;

    // Create modal for method details
    const modal = document.createElement('div');
    modal.className = 'method-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas ${method.icon}"></i> ${method.name}</h3>
                <button class="close-btn" onclick="this.parentElement.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="method-description">
                    <p>${method.description}</p>
                </div>
                <div class="method-origin">
                    <h4>📜 Origin & History</h4>
                    <p>${method.origin}</p>
                </div>
                <div class="method-detailed">
                    <h4>🔮 How It Works</h4>
                    <p>${method.detailedInfo}</p>
                </div>
                <div class="method-practitioners">
                    <h4>⭐ Famous Practitioners</h4>
                    <p>${method.famousPractitioners}</p>
                </div>
                <div class="method-accuracy">
                    <h4>🎯 Accuracy & Reliability</h4>
                    <p>${method.accuracy}</p>
                </div>
                <div class="method-best-for">
                    <h4>💡 Best For</h4>
                    <p>${method.bestFor}</p>
                </div>
                <div class="method-tip">
                    <h4>🌟 Mystical Insight</h4>
                    <p>This ancient method has been used for centuries to gain insight into the future and understand the mysteries of life. Each practice carries its own unique wisdom and connection to the universal energies that guide our existence.</p>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Show modal
    setTimeout(() => modal.classList.add('show'), 100);
}

// ===== GLOBAL FUNCTIONS =====

function revealFortune() {
    window.fortuneTeller.revealFortune();
}

// ===== INITIALIZATION =====

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.fortuneTeller = new FortuneTeller();
});

// Add CSS animations dynamically
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes energy-burst {
        0% {
            opacity: 1;
            transform: scale(0) translate(0, 0);
        }
        50% {
            opacity: 0.8;
            transform: scale(2) translate(var(--tx, 0), var(--ty, 0));
        }
        100% {
            opacity: 0;
            transform: scale(4) translate(calc(var(--tx, 0) * 2), calc(var(--ty, 0) * 2));
        }
    }
    
    .particle {
        animation: float-particle 6s ease-in-out infinite;
    }
    
    @keyframes float-particle {
        0%, 100% { 
            opacity: 0.6; 
            transform: translateY(0px) rotate(0deg) scale(1); 
        }
        25% { 
            opacity: 0.9; 
            transform: translateY(-20px) rotate(90deg) scale(1.2); 
        }
        50% { 
            opacity: 0.7; 
            transform: translateY(10px) rotate(180deg) scale(0.8); 
        }
        75% { 
            opacity: 1; 
            transform: translateY(-15px) rotate(270deg) scale(1.1); 
        }
    }
    
    .crystal-ball.revealing {
        animation: crystal-reveal 3s ease-in-out;
    }
    
    @keyframes crystal-reveal {
        0% { transform: scale(1) rotate(0deg); }
        25% { transform: scale(1.1) rotate(180deg); }
        50% { transform: scale(1.2) rotate(360deg); }
        75% { transform: scale(1.1) rotate(540deg); }
        100% { transform: scale(1) rotate(720deg); }
    }
    
    .crystal-ball.swirling {
        animation: crystal-swirl 3s ease-in-out;
    }
    
    @keyframes crystal-swirl {
        0% { transform: scale(1) rotate(0deg); }
        100% { transform: scale(1) rotate(360deg); }
    }
    
    .crystal-ball.glowing {
        box-shadow: 0 0 50px rgba(249, 115, 22, 0.6);
    }
    
    .energy-particle {
        pointer-events: none;
    }
    
    .error-toast {
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(249, 115, 22, 0.9);
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
    
    .method-modal {
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
    
    .method-modal.show {
        display: flex;
    }
    
    .method-modal .modal-content {
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
    
    .method-modal .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--spacing-lg);
        border-bottom: 1px solid var(--border-color);
    }
    
    .method-modal .modal-header h3 {
        margin: 0;
        color: #F8F8F8;
        font-family: var(--font-mystical);
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
    }
    
    .method-modal .modal-body {
        padding: var(--spacing-lg);
    }
    
    .method-modal .modal-body h4 {
        color: var(--fortune-primary);
        margin-bottom: 0.5rem;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    }
    
    .method-modal .modal-body p {
        color: #D8D8D8;
        line-height: 1.6;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    }
    
    .method-modal .method-tip {
        background: rgba(249, 115, 22, 0.1);
        border: 1px solid rgba(249, 115, 22, 0.3);
        border-radius: 12px;
        padding: 1rem;
        margin-top: 1rem;
    }
    
    .method-modal .method-tip h4 {
        color: #F97316;
    }
    
    .method-modal .method-detailed,
    .method-modal .method-practitioners,
    .method-modal .method-accuracy,
    .method-modal .method-best-for {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: 1rem;
        margin-top: 1rem;
    }
    
    .method-modal .method-detailed h4,
    .method-modal .method-practitioners h4,
    .method-modal .method-accuracy h4,
    .method-modal .method-best-for h4 {
        color: var(--fortune-primary);
        margin-bottom: 0.5rem;
    }
`;

document.head.appendChild(styleSheet);

// Export for global access
window.FortuneTeller = FortuneTeller;
window.unlockPremium = unlockPremium;
window.closePremiumModal = closePremiumModal;
window.processPayment = processPayment;
window.showMethodDetails = showMethodDetails;
