// ===== DREAM INTERPRETER MAIN SCRIPT =====

class DreamInterpreter {
    constructor() {
        this.currentInterpretation = null;
        this.init();
    }

    init() {
        this.setupFormValidation();
        this.populateCommonDreams();
        this.setupAnimations();
    }

    setupFormValidation() {
        const description = document.getElementById('dream-description');
        const charCount = document.getElementById('char-count');
        
        // Character counter
        description.addEventListener('input', () => {
            const count = description.value.length;
            charCount.textContent = count;
            
            if (count > 500) {
                description.value = description.value.substring(0, 500);
                charCount.textContent = 500;
            }
            
            // Update counter color
            if (count > 400) {
                charCount.style.color = '#FF6B6B';
            } else if (count > 300) {
                charCount.style.color = '#FFD700';
            } else {
                charCount.style.color = 'var(--text-secondary)';
            }
        });

        // Form submission on Enter
        description.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.interpretDream();
            }
        });
    }

    populateCommonDreams() {
        const grid = document.getElementById('dreams-grid');
        if (!grid) return;

        grid.innerHTML = commonDreams.map(dream => `
            <div class="common-dream-card" onclick="showCommonDream('${dream.title}')">
                <div class="dream-symbol">${dream.symbol}</div>
                <h4>${dream.title}</h4>
                <p>${dream.meaning}</p>
                <div class="learn-more">
                    <span>Learn more</span>
                    <i class="fas fa-arrow-right"></i>
                </div>
            </div>
        `).join('');
    }

    setupAnimations() {
        // Animate floating dream bubbles
        this.animateDreamBubbles();
        
        // Add particle effects
        this.createDreamParticles();
    }

    animateDreamBubbles() {
        const bubbles = document.querySelectorAll('.dream-bubble');
        bubbles.forEach((bubble, index) => {
            bubble.style.animationDelay = `${index * 0.7}s`;
        });
    }

    createDreamParticles() {
        const container = document.querySelector('.dreamscape-container');
        if (!container) return;

        for (let i = 0; i < 15; i++) {
            const particle = document.createElement('div');
            particle.className = 'dream-particle';
            particle.style.cssText = `
                position: absolute;
                width: 3px;
                height: 3px;
                background: linear-gradient(45deg, #87CEEB, #FFD700);
                border-radius: 50%;
                opacity: 0.4;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: float-particle ${6 + Math.random() * 4}s infinite ease-in-out;
                animation-delay: ${Math.random() * 3}s;
            `;
            container.appendChild(particle);
        }
    }

    interpretDream() {
        const title = document.getElementById('dream-title').value.trim();
        const description = document.getElementById('dream-description').value.trim();
        const mood = document.getElementById('dream-mood').value;
        const type = document.getElementById('dream-type').value;

        // Validation
        if (!description) {
            this.showError('Please describe your dream to get an interpretation');
            return;
        }

        if (description.length < 10) {
            this.showError('Please provide more details about your dream (at least 10 characters)');
            return;
        }

        // Show loading state
        this.showLoadingState();

        // Generate interpretation
        setTimeout(() => {
            this.currentInterpretation = generateInterpretation(description, mood, type);
            this.displayResults(title, description, mood, type);
            this.trackInterpretation();
        }, 1500);
    }

    showLoadingState() {
        const btn = document.querySelector('.interpret-btn');
        const originalText = btn.innerHTML;
        
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Interpreting...';
        btn.disabled = true;
        
        // Store original text for later
        btn.dataset.originalText = originalText;
    }

    hideLoadingState() {
        const btn = document.querySelector('.interpret-btn');
        btn.innerHTML = btn.dataset.originalText || '<i class="fas fa-magic"></i> Interpret My Dream';
        btn.disabled = false;
    }

    displayResults(title, description, mood, type) {
        // Hide loading state
        this.hideLoadingState();

        // Update dream summary
        const summaryElement = document.getElementById('dream-summary');
        summaryElement.innerHTML = `
            ${title ? `<h4>${title}</h4>` : ''}
            <div class="dream-details">
                <p><strong>Dream:</strong> ${description}</p>
                ${mood ? `<p><strong>Mood:</strong> <span class="mood-badge" style="background: ${this.currentInterpretation.mood.color}">${mood}</span></p>` : ''}
                ${type ? `<p><strong>Type:</strong> ${type}</p>` : ''}
            </div>
        `;

        // Update interpretation
        const interpretationElement = document.getElementById('interpretation-text');
        interpretationElement.innerHTML = `
            <p>${this.currentInterpretation.interpretation}</p>
        `;

        // Update symbols
        const symbolsElement = document.getElementById('symbols-grid');
        if (this.currentInterpretation.symbols.length > 0) {
            symbolsElement.innerHTML = this.currentInterpretation.symbols.map(symbol => `
                <div class="symbol-item">
                    <h5>${symbol.word.charAt(0).toUpperCase() + symbol.word.slice(1)}</h5>
                    <p><strong>Meaning:</strong> ${symbol.data.meaning}</p>
                    <p><strong>Interpretation:</strong> ${symbol.data.interpretation}</p>
                </div>
            `).join('');
        } else {
            symbolsElement.innerHTML = '<p>No specific symbols were identified in your dream, but the overall meaning is still significant.</p>';
        }

        // Update emotional insights
        const insightsElement = document.getElementById('emotional-insights');
        insightsElement.innerHTML = `
            <p>${generateEmotionalInsights(mood, description)}</p>
            <div class="guidance-box">
                <h4>💡 Personal Guidance</h4>
                <p>${this.currentInterpretation.guidance}</p>
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

    trackInterpretation() {
        // Track dream interpretation event
        if (window.hub) {
            window.hub.trackEvent('dream_interpretation', {
                mood: document.getElementById('dream-mood').value,
                type: document.getElementById('dream-type').value,
                symbolsFound: this.currentInterpretation.symbols.length
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
        window.hub.trackEvent('premium_unlock_attempt', { tool: 'dream-interpreter' });
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
                tool: 'dream-interpreter', 
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

function showCommonDream(dreamTitle) {
    const dream = commonDreams.find(d => d.title === dreamTitle);
    if (!dream) return;

    // Create modal for common dream details
    const modal = document.createElement('div');
    modal.className = 'common-dream-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>${dream.symbol} ${dream.title}</h3>
                <button class="close-btn" onclick="this.parentElement.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="dream-meaning">
                    <h4>Meaning</h4>
                    <p>${dream.meaning}</p>
                </div>
                <div class="dream-interpretation">
                    <h4>Interpretation</h4>
                    <p>${dream.interpretation}</p>
                </div>
                <div class="dream-tip">
                    <h4>💡 Tip</h4>
                    <p>If you frequently dream about ${dream.title.toLowerCase()}, consider what this theme represents in your waking life.</p>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Show modal
    setTimeout(() => modal.classList.add('show'), 100);
}

// ===== GLOBAL FUNCTIONS =====

function interpretDream() {
    window.dreamInterpreter.interpretDream();
}

// ===== INITIALIZATION =====

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.dreamInterpreter = new DreamInterpreter();
});

// Add CSS animations dynamically
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes float-particle {
        0%, 100% { 
            opacity: 0.4; 
            transform: translateY(0px) translateX(0px) scale(1); 
        }
        25% { 
            opacity: 0.8; 
            transform: translateY(-20px) translateX(10px) scale(1.2); 
        }
        50% { 
            opacity: 0.6; 
            transform: translateY(10px) translateX(-10px) scale(0.8); 
        }
        75% { 
            opacity: 0.9; 
            transform: translateY(-10px) translateX(5px) scale(1.1); 
        }
    }
    
    .dream-bubble {
        animation: float-bubble 4s ease-in-out infinite;
    }
    
    @keyframes float-bubble {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-15px) rotate(180deg); }
    }
    
    .dream-particle {
        pointer-events: none;
    }
    
    .error-toast {
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(59, 130, 246, 0.9);
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
    
    .mood-badge {
        display: inline-block;
        padding: 0.2rem 0.6rem;
        border-radius: 12px;
        font-size: 0.8rem;
        font-weight: 500;
        color: white;
    }
    
    .guidance-box {
        background: rgba(59, 130, 246, 0.1);
        border: 1px solid rgba(59, 130, 246, 0.3);
        border-radius: 12px;
        padding: 1rem;
        margin-top: 1rem;
    }
    
    .guidance-box h4 {
        color: #87CEEB;
        margin-bottom: 0.5rem;
    }
    
    .common-dream-modal {
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
    
    .common-dream-modal.show {
        display: flex;
    }
    
    .common-dream-modal .modal-content {
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
    
    .common-dream-modal .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--spacing-lg);
        border-bottom: 1px solid var(--border-color);
    }
    
    .common-dream-modal .modal-header h3 {
        margin: 0;
        color: var(--text-primary);
        font-family: var(--font-mystical);
    }
    
    .common-dream-modal .modal-body {
        padding: var(--spacing-lg);
    }
    
    .common-dream-modal .modal-body h4 {
        color: var(--dream-primary);
        margin-bottom: 0.5rem;
    }
    
    .common-dream-modal .dream-tip {
        background: rgba(255, 215, 0, 0.1);
        border: 1px solid rgba(255, 215, 0, 0.3);
        border-radius: 12px;
        padding: 1rem;
        margin-top: 1rem;
    }
    
    .common-dream-modal .dream-tip h4 {
        color: #FFD700;
    }
`;

document.head.appendChild(styleSheet);

// Export for global access
window.DreamInterpreter = DreamInterpreter;
window.unlockPremium = unlockPremium;
window.closePremiumModal = closePremiumModal;
window.processPayment = processPayment;
window.showCommonDream = showCommonDream;
