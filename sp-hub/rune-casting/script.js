// ===== RUNE CASTING FUNCTIONALITY =====

class RuneCasting {
    constructor() {
        this.selectedMethod = 'single';
        this.castRunes = [];
        this.isPremium = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.createFloatingRunes();
        this.displayRuneReference();
    }

    setupEventListeners() {
        // Method selection
        document.querySelectorAll('.method-option').forEach(option => {
            option.addEventListener('click', (e) => {
                this.selectMethod(e.currentTarget);
            });
        });

        // Cast button
        const castButton = document.getElementById('castButton');
        if (castButton) {
            castButton.addEventListener('click', () => this.performCasting());
        }

        // Question input
        const questionInput = document.getElementById('rune-question');
        if (questionInput) {
            questionInput.addEventListener('input', () => this.validateCasting());
        }
    }

    selectMethod(option) {
        // Remove previous selection
        document.querySelectorAll('.method-option').forEach(opt => {
            opt.classList.remove('selected');
        });

        // Add selection to clicked option
        option.classList.add('selected');
        this.selectedMethod = option.dataset.method;

        // Check if premium
        if (option.classList.contains('premium')) {
            this.isPremium = true;
        } else {
            this.isPremium = false;
        }

        this.validateCasting();
    }

    validateCasting() {
        const castButton = document.getElementById('castButton');
        const questionInput = document.getElementById('rune-question');
        
        if (this.selectedMethod && castButton) {
            if (this.isPremium) {
                castButton.innerHTML = '<i class="fas fa-crown"></i><span>Unlock Premium</span>';
                castButton.onclick = () => this.purchasePremium();
            } else {
                castButton.innerHTML = '<i class="fas fa-hammer"></i><span>Cast Runes</span>';
                castButton.onclick = () => this.performCasting();
            }
        }
    }

    async performCasting() {
        const castButton = document.getElementById('castButton');
        const question = document.getElementById('rune-question').value;
        
        // Disable button and show loading
        castButton.disabled = true;
        castButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Casting...</i>';

        // Hide previous results
        const resultsSection = document.getElementById('resultsSection');
        if (resultsSection) {
            resultsSection.style.display = 'none';
        }

        // Simulate casting delay for dramatic effect
        await this.delay(2000);

        // Perform casting
        const runeCount = this.getRuneCount();
        this.castRunes = this.getRandomRunes(runeCount);

        // Display results
        this.displayResults(question);

        // Re-enable button
        castButton.disabled = false;
        castButton.innerHTML = '<i class="fas fa-hammer"></i><span>Cast Again</span>';
    }

    getRuneCount() {
        switch (this.selectedMethod) {
            case 'single': return 1;
            case 'three': return 3;
            case 'five': return 5;
            default: return 1;
        }
    }

    getRandomRunes(count) {
        const shuffled = [...runeData].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    displayResults(question) {
        const resultsSection = document.getElementById('resultsSection');
        const runesDisplay = document.getElementById('runesDisplay');
        const interpretation = document.getElementById('interpretation');

        if (!resultsSection || !runesDisplay || !interpretation) return;

        // Clear previous results
        runesDisplay.innerHTML = '';
        interpretation.innerHTML = '';

        // Display runes
        const runesContainer = document.createElement('div');
        runesContainer.className = 'casted-runes';

        this.castRunes.forEach((rune, index) => {
            const runeElement = this.createRuneElement(rune, index);
            runesContainer.appendChild(runeElement);
        });

        runesDisplay.appendChild(runesContainer);

        // Generate interpretation
        const interpretationText = this.generateInterpretation(question);
        interpretation.innerHTML = interpretationText;

        // Show results with animation
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Animate runes appearing
        setTimeout(() => {
            document.querySelectorAll('.rune-stone').forEach((stone, index) => {
                setTimeout(() => {
                    stone.classList.add('revealed');
                }, index * 200);
            });
        }, 100);
    }

    createRuneElement(rune, index) {
        const runeDiv = document.createElement('div');
        runeDiv.className = 'rune-stone';
        runeDiv.innerHTML = `
            <div class="rune-symbol">${rune.symbol}</div>
            <div class="rune-name">${rune.name}</div>
            <div class="rune-position">${this.getPositionName(index)}</div>
        `;

        // Add click event for detailed view
        runeDiv.addEventListener('click', () => this.showRuneDetails(rune));

        return runeDiv;
    }

    getPositionName(index) {
        switch (this.selectedMethod) {
            case 'single': return 'Guidance';
            case 'three': 
                return ['Past', 'Present', 'Future'][index];
            case 'five':
                return ['Past', 'Present', 'Future', 'Challenge', 'Outcome'][index];
            default: return '';
        }
    }

    generateInterpretation(question) {
        let interpretation = '<div class="interpretation-content">';
        
        // Add question context if provided
        if (question) {
            interpretation += `<h4>Regarding: "${question}"</h4>`;
        }

        interpretation += `<h3>${castingInterpretations[this.selectedMethod].title}</h3>`;
        interpretation += `<p>${castingInterpretations[this.selectedMethod].description}</p>`;

        // Add individual rune meanings
        interpretation += '<div class="rune-meanings">';
        this.castRunes.forEach((rune, index) => {
            interpretation += `
                <div class="rune-meaning">
                    <h5>${this.getPositionName(index)} - ${rune.name} (${rune.symbol})</h5>
                    <p><strong>Meaning:</strong> ${rune.meaning}</p>
                    <p><strong>Guidance:</strong> ${rune.upright}</p>
                    <div class="rune-keywords">
                        <strong>Keywords:</strong> ${rune.keywords.join(', ')}
                    </div>
                </div>
            `;
        });
        interpretation += '</div>';

        // Add overall guidance
        interpretation += '<div class="overall-guidance">';
        interpretation += '<h4>Overall Guidance</h4>';
        interpretation += this.generateOverallGuidance();
        interpretation += '</div>';

        interpretation += '</div>';
        return interpretation;
    }

    generateOverallGuidance() {
        const themes = this.castRunes.map(rune => rune.keywords).flat();
        const commonThemes = this.findCommonThemes(themes);
        
        let guidance = '<p>The runes reveal ';
        
        if (commonThemes.length > 0) {
            guidance += `strong themes of <strong>${commonThemes.join(', ')}</strong>. `;
        }
        
        guidance += 'Trust in the ancient wisdom of the Norse gods and allow these insights to guide your path forward. ';
        guidance += 'The Elder Futhark speaks through symbols that transcend time, offering clarity in moments of uncertainty.</p>';
        
        return guidance;
    }

    findCommonThemes(keywords) {
        // Simple theme detection - in a real implementation, this would be more sophisticated
        const themeGroups = {
            'growth': ['growth', 'new', 'beginnings', 'rebirth'],
            'change': ['change', 'transformation', 'movement', 'journey'],
            'wisdom': ['wisdom', 'knowledge', 'clarity', 'divine'],
            'strength': ['strength', 'power', 'courage', 'protection'],
            'success': ['success', 'victory', 'achievement', 'harvest']
        };

        const foundThemes = [];
        Object.entries(themeGroups).forEach(([theme, words]) => {
            const matches = keywords.filter(keyword => 
                words.some(word => keyword.toLowerCase().includes(word.toLowerCase()))
            );
            if (matches.length > 1) {
                foundThemes.push(theme);
            }
        });

        return foundThemes.slice(0, 3); // Limit to top 3 themes
    }

    showRuneDetails(rune) {
        // Create modal for detailed rune information
        const modal = document.createElement('div');
        modal.className = 'rune-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
            <div class="modal-content">
                <button class="modal-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
                <div class="rune-details">
                    <div class="rune-symbol-large">${rune.symbol}</div>
                    <h3>${rune.name}</h3>
                    <p><strong>Meaning:</strong> ${rune.meaning}</p>
                    <p><strong>Element:</strong> ${rune.element}</p>
                    <p><strong>Upright:</strong> ${rune.upright}</p>
                    <p><strong>Reversed:</strong> ${rune.reversed}</p>
                    <p><strong>Mythology:</strong> ${rune.mythology}</p>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    createFloatingRunes() {
        const container = document.querySelector('.floating-runes');
        if (!container) return;

        // Create floating rune symbols
        for (let i = 0; i < 10; i++) {
            const rune = runeData[Math.floor(Math.random() * runeData.length)];
            const floatingRune = document.createElement('div');
            floatingRune.className = 'floating-rune';
            floatingRune.textContent = rune.symbol;
            floatingRune.style.cssText = `
                position: absolute;
                font-size: ${Math.random() * 20 + 10}px;
                color: rgba(139, 69, 19, ${Math.random() * 0.3 + 0.1});
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: float ${Math.random() * 10 + 10}s linear infinite;
                opacity: ${Math.random() * 0.5 + 0.2};
            `;
            container.appendChild(floatingRune);
        }
    }

    displayRuneReference() {
        const grid = document.getElementById('runeGrid');
        if (!grid) return;

        grid.innerHTML = '';
        runeData.forEach(rune => {
            const runeCard = document.createElement('div');
            runeCard.className = 'rune-reference-card';
            runeCard.innerHTML = `
                <div class="rune-symbol">${rune.symbol}</div>
                <div class="rune-name">${rune.name}</div>
                <div class="rune-meaning">${rune.meaning}</div>
            `;
            runeCard.addEventListener('click', () => this.showRuneDetails(rune));
            grid.appendChild(runeCard);
        });
    }

    purchasePremium() {
        // In a real implementation, this would integrate with payment system
        alert('Premium features coming soon! This will unlock advanced rune spreads and detailed historical context.');
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// ===== INITIALIZATION =====

document.addEventListener('DOMContentLoaded', () => {
    window.runeCasting = new RuneCasting();
});

// ===== UTILITY FUNCTIONS =====

// Add CSS animations dynamically
const runeAnimations = `
<style>
@keyframes float {
    0% { transform: translateY(100vh) rotate(0deg); }
    100% { transform: translateY(-100px) rotate(360deg); }
}

.rune-stone {
    background: linear-gradient(135deg, #8B4513, #A16207, #C2410C);
    border: 2px solid #654321;
    border-radius: 10px;
    padding: 20px;
    margin: 10px;
    text-align: center;
    opacity: 0;
    transform: scale(0.8) rotate(180deg);
    transition: all 0.6s ease;
    cursor: pointer;
    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
}

.rune-stone.revealed {
    opacity: 1;
    transform: scale(1) rotate(0deg);
}

.rune-symbol {
    font-size: 2.5rem;
    color: #FFD700;
    text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
    margin-bottom: 10px;
}

.rune-name {
    font-family: 'Cinzel', serif;
    font-size: 1.2rem;
    color: #FFF;
    margin-bottom: 5px;
}

.rune-position {
    font-size: 0.9rem;
    color: #D2691E;
    font-style: italic;
}

.casted-runes {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: 20px;
    margin: 30px 0;
}

.interpretation-content {
    background: rgba(139, 69, 19, 0.1);
    border: 1px solid rgba(139, 69, 19, 0.3);
    border-radius: 15px;
    padding: 30px;
    margin-top: 20px;
}

.rune-meanings {
    display: grid;
    gap: 20px;
    margin: 20px 0;
}

.rune-meaning {
    background: rgba(255, 255, 255, 0.05);
    padding: 15px;
    border-radius: 10px;
    border-left: 3px solid #8B4513;
}

.rune-keywords {
    margin-top: 10px;
    font-style: italic;
    color: #D2691E;
}

.method-option {
    background: rgba(139, 69, 19, 0.1);
    border: 2px solid rgba(139, 69, 19, 0.3);
    border-radius: 15px;
    padding: 20px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
}

.method-option:hover {
    background: rgba(139, 69, 19, 0.2);
    border-color: #8B4513;
    transform: translateY(-5px);
}

.method-option.selected {
    background: rgba(139, 69, 19, 0.3);
    border-color: #FFD700;
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
}

.method-option.premium::after {
    content: 'Premium';
    position: absolute;
    top: -10px;
    right: -10px;
    background: linear-gradient(135deg, #6B46C1, #EC4899);
    color: white;
    padding: 5px 10px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: bold;
}

.rune-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
}

.modal-content {
    background: linear-gradient(135deg, #1a1a1a, #2a2a2a);
    border: 2px solid #8B4513;
    border-radius: 20px;
    padding: 30px;
    max-width: 500px;
    max-height: 80vh;
    overflow-y: auto;
    position: relative;
    z-index: 1;
}

.modal-close {
    position: absolute;
    top: 15px;
    right: 15px;
    background: rgba(255, 255, 255, 0.1);
    border: none;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    cursor: pointer;
    color: #FFF;
}

.rune-symbol-large {
    font-size: 4rem;
    color: #FFD700;
    text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
    text-align: center;
    margin-bottom: 20px;
}

.rune-reference-card {
    background: rgba(139, 69, 19, 0.1);
    border: 1px solid rgba(139, 69, 19, 0.3);
    border-radius: 10px;
    padding: 15px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
}

.rune-reference-card:hover {
    background: rgba(139, 69, 19, 0.2);
    transform: translateY(-3px);
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', runeAnimations);
