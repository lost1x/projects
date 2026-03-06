// ===== TAROT READING MAIN SCRIPT =====

class TarotReading {
    constructor() {
        this.currentSpread = null;
        this.currentCards = [];
        this.currentFocus = null;
        this.isRevealing = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupAnimations();
    }

    setupEventListeners() {
        // Character counter for question
        const question = document.getElementById('user-question');
        const charCount = document.getElementById('question-char-count');
        
        question.addEventListener('input', () => {
            const count = question.value.length;
            charCount.textContent = count;
            
            if (count > 300) {
                question.value = question.value.substring(0, 300);
                charCount.textContent = 300;
            }
            
            // Update counter color
            if (count > 250) {
                charCount.style.color = '#FF6B6B';
            } else if (count > 200) {
                charCount.style.color = '#FFD700';
            } else {
                charCount.style.color = 'var(--text-secondary)';
            }
        });

        // Form submission on Enter
        question.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.beginReading();
            }
        });
    }

    setupAnimations() {
        // Animate floating cards
        this.animateFloatingCards();
    }

    animateFloatingCards() {
        const cards = document.querySelectorAll('.tarot-card-float');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 3}s`;
        });
    }

    selectReading(spreadType) {
        if (this.isRevealing) return;
        
        this.currentSpread = spreadType;
        
        // Show question section
        const questionSection = document.getElementById('question-section');
        questionSection.style.display = 'block';
        
        // Scroll to question section
        questionSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Highlight selected option
        const options = document.querySelectorAll('.option-card');
        options.forEach(option => {
            option.classList.remove('selected');
        });
        event.currentTarget.classList.add('selected');
        
        this.trackEvent('reading_type_selected', { spread: spreadType });
    }

    beginReading() {
        if (this.isRevealing) return;

        const question = document.getElementById('user-question').value.trim();
        const focus = document.getElementById('reading-focus').value;

        // Validation
        if (!this.currentSpread) {
            this.showError('Please select a reading type first');
            return;
        }

        // Start the reading process
        this.isRevealing = true;
        this.startRevealAnimation();

        // Generate cards
        const spreadData = tarotSpreads[this.currentSpread];
        this.currentCards = getRandomCards(spreadData.cards, false);
        this.currentFocus = focus || 'general';

        // Process reading
        setTimeout(() => {
            this.processReading(question);
        }, 3000);
    }

    startRevealAnimation() {
        const btn = document.querySelector('.reading-btn');
        const originalText = btn.innerHTML;
        
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Revealing Your Cards...';
        btn.disabled = true;
        btn.dataset.originalText = originalText;

        // Add mystical effects
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
                    background: radial-gradient(circle, #6B46C1, transparent);
                    border-radius: 50%;
                    pointer-events: none;
                    animation: energy-burst ${2 + Math.random() * 2}s ease-out forwards;
                `;
                
                // Random position
                const angle = Math.random() * Math.PI * 2;
                const distance = 100 + Math.random() * 200;
                const centerX = window.innerWidth / 2;
                const centerY = window.innerHeight / 2;
                
                particle.style.left = `${centerX + Math.cos(angle) * distance}px`;
                particle.style.top = `${centerY + Math.sin(angle) * distance}px`;
                
                container.appendChild(particle);
                
                // Remove particle after animation
                setTimeout(() => particle.remove(), 2000);
            }, i * 100);
        }
    }

    processReading(question) {
        // Generate interpretation
        const interpretation = getInterpretation(this.currentCards, this.currentSpread, this.currentFocus);
        
        // Display results
        this.displayResults(interpretation, question);
        
        // Hide loading state
        this.hideRevealAnimation();
        
        // Track reading
        this.trackReading();
    }

    displayResults(interpretation, question) {
        const resultsSection = document.getElementById('results');
        const spreadData = tarotSpreads[this.currentSpread];
        
        // Update reading type badge
        const badge = document.getElementById('reading-type');
        badge.textContent = spreadData.name;
        
        // Display cards
        this.displayCards();
        
        // Update interpretation text
        const interpretationText = document.getElementById('interpretation-text');
        interpretationText.innerHTML = `
            <div class="reading-summary">
                <p><strong>Your Reading:</strong> ${interpretation.summary}</p>
            </div>
            <div class="personal-message">
                <p><em>${interpretation.message}</em></p>
            </div>
        `;
        
        // Update guidance text
        const guidanceText = document.getElementById('guidance-text');
        guidanceText.innerHTML = `
            <p><strong>Guidance:</strong> ${interpretation.guidance}</p>
            <div class="reading-elements">
                <span><strong>Elements:</strong> ${interpretation.elements.join(' • ')}</span>
            </div>
            <div class="reading-keywords">
                <span><strong>Keywords:</strong> ${interpretation.keywords.join(', ')}</span>
            </div>
        `;
        
        // Show results section
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

        this.isRevealing = false;
    }

    displayCards() {
        const cardsDisplay = document.getElementById('cards-display');
        const spreadData = tarotSpreads[this.currentSpread];
        
        cardsDisplay.innerHTML = this.currentCards.map((card, index) => {
            const position = spreadData.positions[index].replace('_', ' ');
            const symbol = cardSymbols[index % cardSymbols.length];
            
            return `
                <div class="card-display">
                    <div class="card-symbol">${symbol}</div>
                    <div class="card-name">${card.name}</div>
                    <div class="card-position">${position}</div>
                </div>
            `;
        }).join('');
    }

    hideRevealAnimation() {
        const btn = document.querySelector('.reading-btn');
        btn.innerHTML = btn.dataset.originalText || '<i class="fas fa-magic"></i> Begin My Reading';
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

    trackEvent(event, data = {}) {
        // Track tarot reading events
        if (window.hub) {
            window.hub.trackEvent(event, {
                tool: 'tarot-reading',
                spread: this.currentSpread,
                focus: this.currentFocus,
                ...data
            });
        }
    }

    trackReading() {
        // Track completed reading
        if (window.hub) {
            window.hub.trackEvent('tarot_reading_completed', {
                spread: this.currentSpread,
                focus: this.currentFocus,
                cards: this.currentCards.length,
                hasQuestion: !!document.getElementById('user-question').value.trim()
            });
        }
    }
}

// ===== GLOBAL FUNCTIONS =====

function selectReading(spreadType) {
    window.tarotReading.selectReading(spreadType);
}

function beginReading() {
    window.tarotReading.beginReading();
}

// ===== INITIALIZATION =====

document.addEventListener('DOMContentLoaded', () => {
    window.tarotReading = new TarotReading();
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
    
    .option-card.selected {
        background: rgba(107, 70, 193, 0.3);
        border-color: rgba(107, 70, 193, 0.6);
        transform: scale(1.02);
    }
    
    .reading-summary {
        background: rgba(107, 70, 193, 0.05);
        border: 1px solid rgba(107, 70, 193, 0.2);
        border-radius: 12px;
        padding: var(--spacing-md);
        margin-bottom: var(--spacing-md);
    }
    
    .personal-message {
        text-align: center;
        font-style: italic;
        color: var(--tarot-secondary);
        font-size: 1.1rem;
        margin: var(--spacing-lg) 0;
    }
    
    .reading-elements,
    .reading-keywords {
        margin-top: var(--spacing-sm);
        padding: var(--spacing-sm);
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        font-size: 0.9rem;
    }
    
    .energy-particle {
        pointer-events: none;
    }
    
    .error-toast {
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(107, 70, 193, 0.9);
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
`;

document.head.appendChild(styleSheet);

// Export for global access
window.TarotReading = TarotReading;
