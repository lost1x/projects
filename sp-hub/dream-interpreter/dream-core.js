// ===== DREAM INTERPRETER CORE =====

class DreamInterpreter {
    constructor() {
        this.currentInterpretation = null;
        this.isProcessing = false;
        this.init();
    }

    init() {
        this.setupFormValidation();
        this.populateCommonDreams();
        this.setupAnimations();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Close modals on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });

        // Close modals on background click
        Utils.on(document, 'click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeAllModals();
            }
        });
    }

    setupFormValidation() {
        const description = Utils.$('#dream-description');
        const charCount = Utils.$('#char-count');
        
        if (!description || !charCount) return;

        Utils.on(description, 'input', Utils.debounce(() => {
            const count = description.value.length;
            charCount.textContent = count;
            
            // Enforce character limit
            if (count > 500) {
                description.value = description.value.substring(0, 500);
                charCount.textContent = 500;
            }
            
            // Update counter color based on length
            this.updateCharCounterColor(count);
        }, 100));

        // Submit on Enter (without shift)
        Utils.on(description, 'keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.interpretDream();
            }
        });
    }

    updateCharCounterColor(count) {
        const charCount = Utils.$('#char-count');
        if (!charCount) return;

        if (count > 400) {
            charCount.style.color = '#FF6B6B';
        } else if (count > 300) {
            charCount.style.color = '#FFD700';
        } else {
            charCount.style.color = 'var(--text-secondary)';
        }
    }

    populateCommonDreams() {
        const grid = Utils.$('#dreams-grid');
        if (!grid || !window.commonDreams) return;

        grid.innerHTML = window.commonDreams.map(dream => `
            <div class="common-dream-card" data-dream="${dream.title}">
                <div class="dream-symbol">${dream.symbol}</div>
                <h4>${dream.title}</h4>
                <p>${dream.meaning}</p>
                <div class="learn-more">
                    <span>Learn more</span>
                    <i class="fas fa-arrow-right"></i>
                </div>
            </div>
        `).join('');

        // Add click handlers
        Utils.$$('.common-dream-card').forEach(card => {
            Utils.on(card, 'click', () => {
                this.showCommonDream(card.dataset.dream);
            });
        });
    }

    setupAnimations() {
        this.animateDreamBubbles();
        this.createDreamParticles();
    }

    animateDreamBubbles() {
        const bubbles = Utils.$$('.dream-bubble');
        bubbles.forEach((bubble, index) => {
            bubble.style.animationDelay = `${index * 0.7}s`;
        });
    }

    createDreamParticles() {
        const container = Utils.$('.dreamscape-container');
        if (!container) return;

        // Remove existing particles
        container.querySelectorAll('.dream-particle').forEach(p => p.remove());

        for (let i = 0; i < 15; i++) {
            const particle = Utils.createElement('div', 'dream-particle');
            particle.style.cssText = `
                position: absolute;
                width: 3px;
                height: 3px;
                background: linear-gradient(45deg, #87CEEB, #FFD700);
                border-radius: 50%;
                opacity: 0.4;
                left: ${Utils.getRandomNumber(0, 100)}%;
                top: ${Utils.getRandomNumber(0, 100)}%;
                animation: float-particle ${6 + Utils.getRandomNumber(0, 4)}s infinite ease-in-out;
                animation-delay: ${Utils.getRandomNumber(0, 3)}s;
            `;
            container.appendChild(particle);
        }
    }

    async interpretDream() {
        if (this.isProcessing) return;

        const formData = this.getFormData();
        const errors = this.validateFormData(formData);

        if (errors.length > 0) {
            Utils.showToast(errors[0], 'error');
            return;
        }

        this.isProcessing = true;
        this.showLoadingState();

        try {
            // Simulate processing time
            await this.delay(1500);
            
            this.currentInterpretation = window.generateInterpretation(
                formData.description, 
                formData.mood, 
                formData.type
            );
            
            this.displayResults(formData);
            this.trackInterpretation(formData);
            
        } catch (error) {
            console.error('Dream interpretation failed:', error);
            Utils.showToast('Failed to interpret dream. Please try again.', 'error');
        } finally {
            this.isProcessing = false;
            this.hideLoadingState();
        }
    }

    getFormData() {
        return {
            title: Utils.$('#dream-title')?.value?.trim() || '',
            description: Utils.$('#dream-description')?.value?.trim() || '',
            mood: Utils.$('#dream-mood')?.value || '',
            type: Utils.$('#dream-type')?.value || ''
        };
    }

    validateFormData(data) {
        const errors = [];

        if (!data.description) {
            errors.push('Please describe your dream to get an interpretation');
        } else if (data.description.length < 10) {
            errors.push('Please provide more details about your dream (at least 10 characters)');
        }

        return errors;
    }

    showLoadingState() {
        const btn = Utils.$('.interpret-btn');
        if (btn) Utils.setLoading(btn, true);
    }

    hideLoadingState() {
        const btn = Utils.$('.interpret-btn');
        if (btn) Utils.setLoading(btn, false);
    }

    displayResults(formData) {
        const resultsSection = Utils.$('#results');
        if (!resultsSection) return;

        this.updateDreamSummary(formData);
        this.updateInterpretation();
        this.updateSymbols();
        this.updateEmotionalInsights(formData.mood);

        // Show results with animation
        resultsSection.classList.remove('hidden');
        resultsSection.style.opacity = '0';
        resultsSection.style.transform = 'translateY(30px)';

        Utils.animate(resultsSection, {
            opacity: '1',
            transform: 'translateY(0)'
        }, 600).then(() => {
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    updateDreamSummary(formData) {
        const summaryElement = Utils.$('#dream-summary');
        if (!summaryElement) return;

        const moodData = this.currentInterpretation.mood;
        summaryElement.innerHTML = `
            ${formData.title ? `<h4>${Utils.capitalize(formData.title)}</h4>` : ''}
            <div class="dream-details">
                <p><strong>Dream:</strong> ${formData.description}</p>
                ${formData.mood ? `<p><strong>Mood:</strong> <span class="mood-badge" style="background: ${moodData.color}">${formData.mood}</span></p>` : ''}
                ${formData.type ? `<p><strong>Type:</strong> ${Utils.capitalize(formData.type)}</p>` : ''}
            </div>
        `;
    }

    updateInterpretation() {
        const interpretationElement = Utils.$('#interpretation-text');
        if (!interpretationElement) return;

        interpretationElement.innerHTML = `
            <p>${this.currentInterpretation.interpretation}</p>
        `;
    }

    updateSymbols() {
        const symbolsElement = Utils.$('#symbols-grid');
        if (!symbolsElement) return;

        const symbols = this.currentInterpretation.symbols;
        
        if (symbols.length > 0) {
            symbolsElement.innerHTML = symbols.map(symbol => `
                <div class="symbol-item">
                    <h5>${Utils.capitalize(symbol.word)}</h5>
                    <p><strong>Meaning:</strong> ${symbol.data.meaning}</p>
                    <p><strong>Interpretation:</strong> ${symbol.data.interpretation}</p>
                </div>
            `).join('');
        } else {
            symbolsElement.innerHTML = '<p>No specific symbols were identified in your dream, but the overall meaning is still significant.</p>';
        }
    }

    updateEmotionalInsights(mood) {
        const insightsElement = Utils.$('#emotional-insights');
        if (!insightsElement) return;

        insightsElement.innerHTML = `
            <p>${window.generateEmotionalInsights(mood, this.currentInterpretation.interpretation)}</p>
            <div class="guidance-box">
                <h4>💡 Personal Guidance</h4>
                <p>${this.currentInterpretation.guidance}</p>
            </div>
        `;
    }

    showCommonDream(dreamTitle) {
        const dream = window.commonDreams?.find(d => d.title === dreamTitle);
        if (!dream) return;

        const content = `
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
        `;

        Utils.modal.create(content, {
            title: `${dream.symbol} ${dream.title}`
        });
    }

    closeAllModals() {
        Utils.$$('.modal.active, .common-dream-modal').forEach(modal => {
            Utils.modal.hide(modal);
        });
    }

    trackInterpretation(formData) {
        // Track dream interpretation event
        if (window.hub) {
            window.hub.trackEvent('dream_interpretation', {
                mood: formData.mood,
                type: formData.type,
                symbolsFound: this.currentInterpretation.symbols.length,
                descriptionLength: formData.description.length
            });
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Premium functionality
class PremiumManager {
    static unlock() {
        const modal = Utils.$('#premium-modal');
        if (modal) {
            Utils.modal.show(modal);
        }

        // Track premium unlock attempt
        if (window.hub) {
            window.hub.trackEvent('premium_unlock_attempt', { tool: 'dream-interpreter' });
        }
    }

    static closeModal() {
        const modal = Utils.$('#premium-modal');
        if (modal) {
            Utils.modal.hide(modal);
        }
    }

    static processPayment() {
        const payBtn = Utils.$('.paypal-btn');
        if (!payBtn) return;

        Utils.setLoading(payBtn, true);

        // Simulate payment processing
        setTimeout(() => {
            // Track payment event
            if (window.hub) {
                window.hub.trackEvent('payment_initiated', { 
                    tool: 'dream-interpreter', 
                    amount: 1.99 
                });
            }
            
            Utils.showToast('Payment integration would redirect to PayPal for $1.99', 'info');
            Utils.setLoading(payBtn, false);
            PremiumManager.closeModal();
        }, 2000);
    }
}

// Global functions for backward compatibility
function interpretDream() {
    if (window.dreamInterpreter) {
        window.dreamInterpreter.interpretDream();
    }
}

function unlockPremium() {
    PremiumManager.unlock();
}

function closePremiumModal() {
    PremiumManager.closeModal();
}

function processPayment() {
    PremiumManager.processPayment();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.dreamInterpreter = new DreamInterpreter();
    
    // Export for global access
    window.DreamInterpreter = DreamInterpreter;
    window.PremiumManager = PremiumManager;
});
