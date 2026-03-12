// ===== TAROT READING FUNCTIONALITY =====

class TarotReading {
    constructor() {
        this.currentSpread = null;
        this.selectedCards = [];
        this.isRevealing = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        console.log('TarotReading initialized');
    }

    setupEventListeners() {
        // Character counter for question
        const question = document.getElementById('userQuestion');
        const charCount = document.getElementById('charCount');
        
        if (question && charCount) {
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
        }
    }

    selectSpread(spreadType) {
        console.log('Selecting spread:', spreadType);
        this.currentSpread = spreadType;
        
        // Update UI to show selection
        const cards = document.querySelectorAll('.selection-card');
        cards.forEach(card => card.classList.remove('selected'));
        
        const selectedCard = document.querySelector(`[onclick="selectSpread('${spreadType}')"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }
        
        // Show question section
        const questionSection = document.getElementById('questionSection');
        if (questionSection) {
            questionSection.style.display = 'block';
        }
        
        // Update card count
        const spreadData = tarotSpreads[spreadType];
        const cardCount = document.getElementById('cardCount');
        if (cardCount) {
            cardCount.textContent = spreadData.cards;
        }
    }

    beginReading() {
        if (this.isRevealing) return;
        
        const question = document.getElementById('userQuestion').value.trim();
        const focus = document.getElementById('readingFocus').value;
        
        console.log('Beginning reading:', { question, focus, spread: this.currentSpread });
        
        if (!this.currentSpread) {
            this.showError('Please select a reading type first');
            return;
        }
        
        // Generate cards
        const spreadData = tarotSpreads[this.currentSpread];
        this.selectedCards = getRandomCards(spreadData.cards, false);
        
        console.log('Generated cards:', this.selectedCards);
        
        // Show card selection
        this.displayCardSelection();
    }

    displayCardSelection() {
        const cardSelection = document.getElementById('cardSelection');
        if (cardSelection) {
            cardSelection.style.display = 'block';
        }
        
        const tarotSpread = document.getElementById('tarotSpread');
        if (!tarotSpread) return;
        
        tarotSpread.innerHTML = '';
        
        this.selectedCards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'tarot-card-back';
            cardElement.dataset.index = index;
            cardElement.innerHTML = `
                <div class="card-back-design">
                    <i class="fas fa-layer-group"></i>
                </div>
                <div class="card-number">${index + 1}</div>
            `;
            
            cardElement.addEventListener('click', () => this.selectCard(index));
            tarotSpread.appendChild(cardElement);
        });
        
        // Scroll to card selection
        cardSelection.scrollIntoView({ behavior: 'smooth' });
    }

    selectCard(index) {
        const cardElement = document.querySelector(`[data-index="${index}"]`);
        if (cardElement) {
            cardElement.classList.toggle('selected');
            this.updateRevealButton();
        }
    }

    updateRevealButton() {
        const selectedCards = document.querySelectorAll('.tarot-card-back.selected');
        const revealButton = document.getElementById('revealButton');
        
        if (revealButton) {
            revealButton.disabled = selectedCards.length !== this.selectedCards.length;
        }
    }

    resetSelection() {
        const cards = document.querySelectorAll('.tarot-card-back');
        cards.forEach(card => card.classList.remove('selected'));
        
        const revealButton = document.getElementById('revealButton');
        if (revealButton) {
            revealButton.disabled = true;
        }
    }

    revealCards() {
        if (this.isRevealing) return;
        
        this.isRevealing = true;
        const revealButton = document.getElementById('revealButton');
        if (revealButton) {
            revealButton.disabled = true;
            revealButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Revealing...';
        }
        
        // Reveal cards one by one
        const cards = document.querySelectorAll('.tarot-card-back.selected');
        cards.forEach((card, index) => {
            setTimeout(() => {
                this.revealSingleCard(card, index);
            }, index * 500);
        });
        
        // Show results after all cards are revealed
        setTimeout(() => {
            this.showResults();
        }, cards.length * 500 + 1000);
    }

    revealSingleCard(cardElement, index) {
        const card = this.selectedCards[index];
        const isReversed = Math.random() > 0.7; // 30% chance of reversed
        
        cardElement.classList.add('revealed');
        cardElement.innerHTML = `
            <div class="tarot-card-front ${isReversed ? 'reversed' : ''}">
                <div class="card-header">
                    <h3>${card.name}</h3>
                    <span class="card-number">${card.number}</span>
                </div>
                <div class="card-suit">${card.suit}</div>
                <div class="card-meaning">
                    <p><strong>${isReversed ? 'Reversed:' : 'Upright:'}</strong></p>
                    <p>${isReversed ? card.reversed : card.upright}</p>
                </div>
            </div>
        `;
    }

    showResults() {
        const resultsSection = document.getElementById('resultsSection');
        if (resultsSection) {
            resultsSection.style.display = 'block';
        }
        
        const readingResults = document.getElementById('readingResults');
        if (!readingResults) return;
        
        const question = document.getElementById('userQuestion').value.trim();
        const focus = document.getElementById('readingFocus').value;
        const spreadData = tarotSpreads[this.currentSpread];
        
        let resultsHTML = `
            <div class="reading-summary">
                <h3>Reading Summary</h3>
                <p><strong>Question:</strong> ${question || 'No specific question'}</p>
                <p><strong>Focus:</strong> ${focus}</p>
                <p><strong>Spread:</strong> ${spreadData.name}</p>
            </div>
            
            <div class="card-interpretations">
                <h3>Card Interpretations</h3>
        `;
        
        const cards = document.querySelectorAll('.tarot-card-front');
        cards.forEach((cardElement, index) => {
            const position = spreadData.positions[index];
            const card = this.selectedCards[index];
            const isReversed = cardElement.classList.contains('reversed');
            
            resultsHTML += `
                <div class="card-interpretation">
                    <h4>${position.replace('_', ' ').toUpperCase()}</h4>
                    <div class="card-info">
                        <strong>${card.name}</strong> ${isReversed ? '(Reversed)' : '(Upright)'}
                    </div>
                    <p>${isReversed ? card.reversed : card.upright}</p>
                </div>
            `;
        });
        
        resultsHTML += `
            </div>
            <div class="reading-guidance">
                <h3>Overall Guidance</h3>
                <p>This reading provides insights into your current situation. For a complete detailed interpretation including specific guidance and future predictions, unlock the premium reading below.</p>
            </div>
        `;
        
        readingResults.innerHTML = resultsHTML;
        
        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth' });
        
        // Reset reveal button
        const revealButton = document.getElementById('revealButton');
        if (revealButton) {
            revealButton.innerHTML = '<i class="fas fa-eye"></i> Reveal Cards';
            revealButton.disabled = false;
        }
        
        this.isRevealing = false;
    }

    showError(message) {
        // Create error toast
        const errorToast = document.createElement('div');
        errorToast.className = 'error-toast';
        errorToast.textContent = message;
        errorToast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(239, 68, 68, 0.9);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(errorToast);
        
        // Show toast
        setTimeout(() => {
            errorToast.style.transform = 'translateX(0)';
        }, 100);
        
        // Hide toast
        setTimeout(() => {
            errorToast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (errorToast.parentNode) {
                    errorToast.parentNode.removeChild(errorToast);
                }
            }, 300);
        }, 3000);
    }
}

// Global functions for onclick handlers
window.selectSpread = (spreadType) => window.tarotReading.selectSpread(spreadType);
window.beginReading = () => window.tarotReading.beginReading();
window.resetSelection = () => window.tarotReading.resetSelection();
window.revealCards = () => window.tarotReading.revealCards();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.tarotReading = new TarotReading();
});
