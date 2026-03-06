// ===== NUMEROLOGY MAIN SCRIPT =====

class NumerologyCalculator {
    constructor() {
        this.currentResults = null;
        this.isCalculating = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupAnimations();
        this.populateDateOptions();
    }

    setupEventListeners() {
        // Form validation
        const monthSelect = document.getElementById('birth-month');
        const daySelect = document.getElementById('birth-day');
        const yearSelect = document.getElementById('birth-year');
        const nameInput = document.getElementById('full-name');
        
        // Enable/disable day based on month
        monthSelect.addEventListener('change', () => {
            this.updateDayOptions(monthSelect.value, daySelect);
        });
        
        // Track form changes
        [monthSelect, daySelect, yearSelect, nameInput].forEach(element => {
            element.addEventListener('change', () => this.validateForm());
        });
    }

    setupAnimations() {
        // Animate floating numbers
        this.animateFloatingNumbers();
    }

    animateFloatingNumbers() {
        const numbers = document.querySelectorAll('.number-float');
        numbers.forEach((number, index) => {
            number.style.animationDelay = `${index * 2}s`;
        });
    }

    populateDateOptions() {
        const daySelect = document.getElementById('birth-day');
        const yearSelect = document.getElementById('birth-year');
        const currentYear = new Date().getFullYear();
        
        // Populate days (1-31)
        for (let i = 1; i <= 31; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            daySelect.appendChild(option);
        }
        
        // Populate years (current year - 100 to current year)
        for (let i = currentYear - 100; i <= currentYear; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            yearSelect.appendChild(option);
        }
    }

    updateDayOptions(month, daySelect) {
        const daysInMonth = new Date(2024, month, 0).getDate();
        const currentDay = daySelect.value;
        
        // Clear existing options
        daySelect.innerHTML = '<option value="">Select...</option>';
        
        // Add valid days for selected month
        for (let i = 1; i <= daysInMonth; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            if (i == currentDay) {
                option.selected = true;
            }
            daySelect.appendChild(option);
        }
    }

    validateForm() {
        const month = document.getElementById('birth-month').value;
        const day = document.getElementById('birth-day').value;
        const year = document.getElementById('birth-year').value;
        const calculateBtn = document.querySelector('.calculate-btn');
        
        const isValid = month && day && year;
        calculateBtn.disabled = !isValid;
        calculateBtn.classList.toggle('disabled', !isValid);
    }

    calculateNumerology() {
        if (this.isCalculating) return;

        const month = document.getElementById('birth-month').value;
        const day = document.getElementById('birth-day').value;
        const year = document.getElementById('birth-year').value;
        const fullName = document.getElementById('full-name').value.trim();

        // Validation
        if (!month || !day || !year) {
            this.showError('Please select your complete birth date');
            return;
        }

        // Start calculation
        this.isCalculating = true;
        this.startCalculationAnimation();

        // Calculate all numbers
        setTimeout(() => {
            const lifePath = calculateLifePathNumber(parseInt(day), parseInt(month), parseInt(year));
            const nameNumber = calculateNameNumber(fullName);
            const soulNumber = calculateSoulNumber(fullName);
            const personalityNumber = calculatePersonalityNumber(fullName);

            this.currentResults = {
                lifePath,
                nameNumber,
                soulNumber,
                personalityNumber,
                birthDate: `${month}/${day}/${year}`,
                fullName: fullName || "Anonymous"
            };

            this.displayResults();
            this.hideCalculationAnimation();
            this.trackCalculation();
            this.isCalculating = false;
        }, 2500);
    }

    startCalculationAnimation() {
        const btn = document.querySelector('.calculate-btn');
        const originalText = btn.innerHTML;
        
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Calculating Sacred Numbers...';
        btn.disabled = true;
        btn.dataset.originalText = originalText;

        // Add mystical effects
        this.createNumerologyEffect();
    }

    createNumerologyEffect() {
        const container = document.querySelector('.cosmic-container');
        if (!container) return;

        // Create sacred geometry patterns
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                const symbol = document.createElement('div');
                symbol.className = 'sacred-symbol';
                symbol.textContent = ['∞', '◈', '✧', '⬟', '❋', '⬢', '◆', '⬟', '✦', '⬟', '○', '△'][i];
                symbol.style.cssText = `
                    position: absolute;
                    font-size: ${1 + Math.random() * 2}rem;
                    color: rgba(147, 51, 234, ${0.3 + Math.random() * 0.4});
                    pointer-events: none;
                    animation: sacred-float ${3 + Math.random() * 4}s ease-in-out infinite;
                `;
                
                // Random position
                const angle = Math.random() * Math.PI * 2;
                const distance = 50 + Math.random() * 150;
                const centerX = window.innerWidth / 2;
                const centerY = window.innerHeight / 2;
                
                symbol.style.left = `${centerX + Math.cos(angle) * distance}px`;
                symbol.style.top = `${centerY + Math.sin(angle) * distance}px`;
                
                container.appendChild(symbol);
                
                // Remove symbol after animation
                setTimeout(() => symbol.remove(), 8000);
            }, i * 200);
        }
    }

    displayResults() {
        const resultsSection = document.getElementById('results');
        const results = this.currentResults;
        
        // Display numbers grid
        this.displayNumbersGrid();
        
        // Display life path
        this.displayLifePath();
        
        // Display personality traits
        this.displayPersonalityTraits();
        
        // Display destiny message
        this.displayDestinyMessage();
        
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
    }

    displayNumbersGrid() {
        const grid = document.getElementById('numbers-grid');
        const results = this.currentResults;
        
        const numbers = [
            { label: 'Life Path', value: results.lifePath, icon: '🌟' },
            { label: 'Name Number', value: results.nameNumber || 'N/A', icon: '📝' },
            { label: 'Soul Number', value: results.soulNumber || 'N/A', icon: '💫' },
            { label: 'Personality', value: results.personalityNumber || 'N/A', icon: '🎭' }
        ];
        
        grid.innerHTML = numbers.map(num => `
            <div class="number-card">
                <div class="number-icon">${num.icon}</div>
                <div class="number-label">${num.label}</div>
                <div class="number-value">${num.value}</div>
            </div>
        `).join('');
    }

    displayLifePath() {
        const display = document.getElementById('life-path-display');
        const lifePath = this.currentResults.lifePath;
        const meaning = numberMeanings[lifePath];
        
        display.innerHTML = `
            <div class="life-path-number">${lifePath}</div>
            <div class="life-path-title">${meaning.name}</div>
            <div class="life-path-description">${meaning.description}</div>
            <div class="life-path-traits">
                <h4>Key Traits</h4>
                <div class="traits-grid">
                    ${meaning.positive.map(trait => `<span class="trait positive">${trait}</span>`).join('')}
                </div>
            </div>
            <div class="life-path-challenge">
                <h4>Life Challenge</h4>
                <p>${lifePathChallenges[lifePath]}</p>
            </div>
        `;
    }

    displayPersonalityTraits() {
        const list = document.getElementById('traits-list');
        const meaning = numberMeanings[this.currentResults.lifePath];
        
        list.innerHTML = `
            <div class="trait-item">
                <h4>🎯 Natural Talents</h4>
                <p>${meaning.traits.join(', ')}</p>
            </div>
            <div class="trait-item">
                <h4>💼 Best Career Paths</h4>
                <div class="career-list">
                    ${meaning.career.map(career => `<span class="career-tag">${career}</span>`).join('')}
                </div>
            </div>
            <div class="trait-item">
                <h4>🎨 Lucky Elements</h4>
                <div class="lucky-elements">
                    <div class="element-item">
                        <span class="element-label">Colors:</span>
                        <span class="element-value">${meaning.colors.join(', ')}</span>
                    </div>
                    <div class="element-item">
                        <span class="element-label">Days:</span>
                        <span class="element-value">${meaning.days.join(', ')}</span>
                    </div>
                    <div class="element-item">
                        <span class="element-label">Element:</span>
                        <span class="element-value">${meaning.element}</span>
                    </div>
                    <div class="element-item">
                        <span class="element-label">Planet:</span>
                        <span class="element-value">${meaning.ruling_planet}</span>
                    </div>
                </div>
            </div>
        `;
    }

    displayDestinyMessage() {
        const display = document.getElementById('destiny-text');
        const message = generatePersonalMessage(
            this.currentResults.lifePath,
            this.currentResults.nameNumber,
            this.currentResults.soulNumber,
            this.currentResults.personalityNumber
        );
        
        display.innerHTML = `
            <div class="destiny-message">
                <p><em>${message}</em></p>
            </div>
        `;
    }

    hideCalculationAnimation() {
        const btn = document.querySelector('.calculate-btn');
        btn.innerHTML = btn.dataset.originalText || '<i class="fas fa-infinity"></i> Calculate My Numbers';
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

    trackCalculation() {
        // Track numerology calculation
        if (window.hub) {
            window.hub.trackEvent('numerology_calculation', {
                lifePath: this.currentResults.lifePath,
                hasName: !!this.currentResults.fullName,
                masterNumber: masterNumbers.includes(this.currentResults.lifePath)
            });
        }
    }
}

// ===== GLOBAL FUNCTIONS =====

function calculateNumerology() {
    window.numerologyCalculator.calculateNumerology();
}

// ===== INITIALIZATION =====

document.addEventListener('DOMContentLoaded', () => {
    window.numerologyCalculator = new NumerologyCalculator();
});

// Add CSS animations dynamically
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes sacred-float {
        0%, 100% { 
            opacity: 0.2; 
            transform: translateY(0px) rotate(0deg) scale(1); 
        }
        25% { 
            opacity: 0.6; 
            transform: translateY(-20px) rotate(90deg) scale(1.2); 
        }
        50% { 
            opacity: 0.4; 
            transform: translateY(10px) rotate(180deg) scale(0.8); 
        }
        75% { 
            opacity: 0.7; 
            transform: translateY(-15px) rotate(270deg) scale(1.1); 
        }
    }
    
    .number-card {
        background: rgba(147, 51, 234, 0.1);
        border: 1px solid rgba(147, 51, 234, 0.3);
        border-radius: 12px;
        padding: var(--spacing-md);
        text-align: center;
        transition: all var(--transition-normal);
    }
    
    .number-card:hover {
        background: rgba(147, 51, 234, 0.2);
        border-color: rgba(147, 51, 234, 0.5);
        transform: translateY(-3px) scale(1.05);
    }
    
    .number-icon {
        font-size: 2rem;
        margin-bottom: var(--spacing-xs);
    }
    
    .number-label {
        font-size: 0.9rem;
        color: var(--text-secondary);
        margin-bottom: var(--spacing-xs);
    }
    
    .number-value {
        font-size: 2.5rem;
        font-weight: bold;
        color: var(--text-primary);
        text-shadow: 0 0 15px rgba(147, 51, 234, 0.6);
    }
    
    .life-path-number {
        font-size: 4rem;
        font-weight: bold;
        color: #9333EA;
        text-shadow: 0 0 25px rgba(147, 51, 234, 0.8);
        margin-bottom: var(--spacing-md);
    }
    
    .life-path-title {
        font-family: var(--font-mystical);
        font-size: 1.5rem;
        margin-bottom: var(--spacing-md);
        background: linear-gradient(135deg, #9333EA, #6B46C1);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }
    
    .traits-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: var(--spacing-sm);
        margin-top: var(--spacing-md);
    }
    
    .trait.positive {
        background: rgba(147, 51, 234, 0.1);
        border: 1px solid rgba(147, 51, 234, 0.2);
        border-radius: 20px;
        padding: var(--spacing-sm);
        font-size: 0.9rem;
    }
    
    .career-tag {
        display: inline-block;
        background: rgba(147, 51, 234, 0.2);
        border: 1px solid rgba(147, 51, 234, 0.3);
        border-radius: 15px;
        padding: 0.3rem 0.8rem;
        margin: 0.25rem;
        font-size: 0.85rem;
    }
    
    .lucky-elements {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: var(--spacing-sm);
        margin-top: var(--spacing-md);
    }
    
    .element-item {
        display: flex;
        justify-content: space-between;
        padding: var(--spacing-sm);
        background: rgba(147, 51, 234, 0.05);
        border-radius: 8px;
    }
    
    .element-label {
        color: var(--text-secondary);
        font-size: 0.9rem;
    }
    
    .element-value {
        color: var(--text-primary);
        font-weight: 500;
    }
    
    .destiny-message {
        background: rgba(147, 51, 234, 0.05);
        border: 1px solid rgba(147, 51, 234, 0.2);
        border-radius: 12px;
        padding: var(--spacing-lg);
        font-style: italic;
        line-height: 1.6;
        text-align: center;
    }
    
    .sacred-symbol {
        pointer-events: none;
    }
    
    .error-toast {
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(147, 51, 234, 0.9);
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
window.NumerologyCalculator = NumerologyCalculator;
