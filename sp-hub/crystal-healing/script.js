// ===== CRYSTAL HEALING FUNCTIONALITY =====

class CrystalHealing {
    constructor() {
        this.currentFilter = 'all';
        this.searchTerm = '';
        this.assessmentAnswers = {};
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.displayCrystals();
        this.displayChakras();
        this.createFloatingCrystals();
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('crystalSearch');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.handleSearch());
        }

        // Category selection
        document.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => this.selectCategory(card));
        });
    }

    selectCategory(categoryCard) {
        // Remove previous selection
        document.querySelectorAll('.category-card').forEach(card => {
            card.classList.remove('selected');
        });

        // Add selection to clicked card
        categoryCard.classList.add('selected');
        
        // Display crystals for this category
        const category = categoryCard.dataset.category;
        this.displayCategoryCrystals(category);
    }

    displayCategoryCrystals(category) {
        const categoryCrystals = CrystalRecommender.getCrystalsByCategory(category);
        this.displayCrystalList(categoryCrystals, `${category} Healing Crystals`);
    }

    handleSearch() {
        const searchInput = document.getElementById('crystalSearch');
        if (!searchInput) return;

        this.searchTerm = searchInput.value.toLowerCase();
        
        if (this.searchTerm.length < 2) {
            this.displayCrystals();
            return;
        }

        const searchResults = CrystalRecommender.searchCrystals(this.searchTerm);
        this.displayCrystalList(searchResults, `Search Results for "${this.searchTerm}"`);
    }

    searchCrystals() {
        this.handleSearch();
    }

    filterCrystals(filter) {
        this.currentFilter = filter;
        
        // Update filter button states
        document.querySelectorAll('.filter-tag').forEach(tag => {
            tag.classList.remove('active');
        });
        event.target.classList.add('active');

        // Apply filter
        let filteredCrystals = crystals;
        
        switch (filter) {
            case 'chakra':
                filteredCrystals = crystals.filter(c => c.chakra !== "All");
                break;
            case 'rare':
                filteredCrystals = crystals.filter(c => c.hardness <= 6);
                break;
            case 'common':
                filteredCrystals = crystals.filter(c => c.hardness >= 7);
                break;
            case 'protection':
                filteredCrystals = crystals.filter(c => 
                    c.properties.some(prop => 
                        prop.toLowerCase().includes('protection') || 
                        prop.toLowerCase().includes('grounding')
                    )
                );
                break;
        }

        this.displayCrystalList(filteredCrystals, `${filter.charAt(0).toUpperCase() + filter.slice(1)} Crystals`);
    }

    displayCrystals() {
        this.displayCrystalList(crystals, 'All Crystals');
    }

    displayCrystalList(crystalList, title) {
        const crystalGrid = document.getElementById('crystalGrid');
        if (!crystalGrid) return;

        crystalGrid.innerHTML = '';
        
        // Add section title if different from default
        if (title !== 'All Crystals') {
            const titleElement = document.createElement('h4');
            titleElement.className = 'section-title';
            titleElement.textContent = title;
            crystalGrid.appendChild(titleElement);
        }

        crystalList.forEach(crystal => {
            const crystalCard = this.createCrystalCard(crystal);
            crystalGrid.appendChild(crystalCard);
        });
    }

    createCrystalCard(crystal) {
        const card = document.createElement('div');
        card.className = 'crystal-card';
        card.innerHTML = `
            <div class="crystal-image">
                <div class="crystal-color" style="background: ${this.getCrystalColor(crystal.color)}"></div>
                <div class="crystal-shape"></div>
            </div>
            <div class="crystal-info">
                <h4 class="crystal-name">${crystal.name}</h4>
                <div class="crystal-details">
                    <span class="crystal-chakra">${crystal.chakra} Chakra</span>
                    <span class="crystal-element">${crystal.element} Element</span>
                </div>
                <p class="crystal-description">${crystal.description}</p>
                <div class="crystal-properties">
                    ${crystal.properties.slice(0, 3).map(prop => 
                        `<span class="property-tag">${prop}</span>`
                    ).join('')}
                </div>
                <button class="crystal-details-btn" onclick="showCrystalDetails('${crystal.name}')">
                    <i class="fas fa-info-circle"></i>
                    Learn More
                </button>
            </div>
        `;
        
        // Add click event for quick selection
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.crystal-details-btn')) {
                this.selectCrystal(crystal);
            }
        });

        return card;
    }

    getCrystalColor(colorName) {
        const colorMap = {
            'Clear': 'linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))',
            'Purple': 'linear-gradient(135deg, #9333EA, #6B46C1)',
            'Pink': 'linear-gradient(135deg, #EC4899, #F472B6)',
            'Yellow': 'linear-gradient(135deg, #F59E0B, #F97316)',
            'Black': 'linear-gradient(135deg, #1F2937, #111827)',
            'Green': 'linear-gradient(135deg, #10B981, #059669)',
            'Blue': 'linear-gradient(135deg, #3B82F6, #1E40AF)',
            'Orange': 'linear-gradient(135deg, #F97316, #DC2626)',
            'Red': 'linear-gradient(135deg, #DC2626, #991B1B)',
            'White': 'linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.4))',
            'Metallic gray': 'linear-gradient(135deg, #6B7280, #374151)'
        };
        
        return colorMap[colorName] || 'linear-gradient(135deg, #9333EA, #6B46C1)';
    }

    selectCrystal(crystal) {
        // Add to selected crystals (could be used for grid creation)
        if (!this.selectedCrystals) {
            this.selectedCrystals = [];
        }
        
        const existingIndex = this.selectedCrystals.findIndex(c => c.name === crystal.name);
        if (existingIndex === -1) {
            this.selectedCrystals.push(crystal);
            this.showNotification(`${crystal.name} added to your healing collection!`);
        } else {
            this.selectedCrystals.splice(existingIndex, 1);
            this.showNotification(`${crystal.name} removed from your collection`);
        }
        
        // Update visual feedback
        this.updateCrystalSelection();
    }

    updateCrystalSelection() {
        document.querySelectorAll('.crystal-card').forEach(card => {
            const crystalName = card.querySelector('.crystal-name').textContent;
            const isSelected = this.selectedCrystals && 
                this.selectedCrystals.some(c => c.name === crystalName);
            
            if (isSelected) {
                card.classList.add('selected');
            } else {
                card.classList.remove('selected');
            }
        });
    }

    startAssessment() {
        this.showAssessmentModal();
    }

    showAssessmentModal() {
        const modal = document.createElement('div');
        modal.className = 'assessment-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
            <div class="modal-content">
                <button class="modal-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
                <div class="assessment-form">
                    <h3>Energy Assessment</h3>
                    <p>Answer these questions to get personalized crystal recommendations.</p>
                    
                    <div class="assessment-questions">
                        <div class="question">
                            <h4>How is your emotional state?</h4>
                            <div class="answer-options">
                                <label><input type="checkbox" name="emotional" value="stress"> Stressed/Anxious</label>
                                <label><input type="checkbox" name="emotional" value="balanced"> Balanced</label>
                                <label><input type="checkbox" name="emotional" value="overwhelmed"> Overwhelmed</label>
                                <label><input type="checkbox" name="emotional" value="heartbreak"> Heartbroken</label>
                            </div>
                        </div>
                        
                        <div class="question">
                            <h4>What physical support do you need?</h4>
                            <div class="answer-options">
                                <label><input type="checkbox" name="physical" value="energy"> More Energy</label>
                                <label><input type="checkbox" name="physical" value="pain"> Pain Relief</label>
                                <label><input type="checkbox" name="physical" value="sleep"> Better Sleep</label>
                                <label><input type="checkbox" name="physical" value="immune"> Immune Support</label>
                            </div>
                        </div>
                        
                        <div class="question">
                            <h4>What are your spiritual goals?</h4>
                            <div class="answer-options">
                                <label><input type="checkbox" name="spiritual" value="growth"> Spiritual Growth</label>
                                <label><input type="checkbox" name="spiritual" value="intuition"> Enhanced Intuition</label>
                                <label><input type="checkbox" name="spiritual" value="protection"> Protection</label>
                                <label><input type="checkbox" name="spiritual" value="connection"> Divine Connection</label>
                            </div>
                        </div>
                    </div>
                    
                    <button class="submit-assessment" onclick="submitAssessment()">
                        <i class="fas fa-sparkles"></i>
                        <span>Get Recommendations</span>
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    displayChakras() {
        const chakraGrid = document.getElementById('chakraGrid');
        if (!chakraGrid) return;

        chakraGrid.innerHTML = '';
        chakras.forEach(chakra => {
            const chakraCard = document.createElement('div');
            chakraCard.className = 'chakra-card';
            chakraCard.innerHTML = `
                <div class="chakra-color" style="background: ${chakra.color}"></div>
                <div class="chakra-info">
                    <h4>${chakra.name} Chakra</h4>
                    <p class="chakra-sanskrit">${chakra.sanskrit}</p>
                    <p class="chakra-location">${chakra.location}</p>
                    <div class="chakra-crystals">
                        <strong>Recommended Crystals:</strong>
                        ${chakra.crystals.slice(0, 3).map(crystal => 
                            `<span class="chakra-crystal">${crystal}</span>`
                        ).join(', ')}
                    </div>
                    <p class="chakra-affirmation">${chakra.affirmation}</p>
                </div>
            `;
            chakraCard.addEventListener('click', () => this.showChakraDetails(chakra));
            chakraGrid.appendChild(chakraCard);
        });
    }

    showChakraDetails(chakra) {
        const modal = document.createElement('div');
        modal.className = 'chakra-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
            <div class="modal-content">
                <button class="modal-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
                <div class="chakra-details">
                    <div class="chakra-color-large" style="background: ${chakra.color}"></div>
                    <h3>${chakra.name} Chakra</h3>
                    <p><strong>Sanskrit:</strong> ${chakra.sanskrit}</p>
                    <p><strong>Element:</strong> ${chakra.element}</p>
                    <p><strong>Location:</strong> ${chakra.location}</p>
                    <p><strong>Issues:</strong> ${chakra.issues.join(', ')}</p>
                    <div class="chakra-crystals-full">
                        <strong>All Recommended Crystals:</strong>
                        <div class="crystal-list">
                            ${chakra.crystals.map(crystal => 
                                `<span class="crystal-tag">${crystal}</span>`
                            ).join('')}
                        </div>
                    </div>
                    <p class="chakra-affirmation-full"><strong>Affirmation:</strong> ${chakra.affirmation}</p>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    showCrystalDetails(crystalName) {
        const crystal = crystals.find(c => c.name === crystalName);
        if (!crystal) return;

        const modal = document.createElement('div');
        modal.className = 'crystal-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="this.parentElement.remove()"></div>
            <div class="modal-content">
                <button class="modal-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
                <div class="crystal-details-full">
                    <div class="crystal-header">
                        <div class="crystal-color-large" style="background: ${this.getCrystalColor(crystal.color)}"></div>
                        <h3>${crystal.name}</h3>
                    </div>
                    <div class="crystal-info-grid">
                        <div class="info-item">
                            <strong>Chakra:</strong> ${crystal.chakra}
                        </div>
                        <div class="info-item">
                            <strong>Element:</strong> ${crystal.element}
                        </div>
                        <div class="info-item">
                            <strong>Color:</strong> ${crystal.color}
                        </div>
                        <div class="info-item">
                            <strong>Hardness:</strong> ${crystal.hardness}/10
                        </div>
                    </div>
                    <p><strong>Description:</strong> ${crystal.description}</p>
                    <div class="crystal-properties-full">
                        <strong>Properties:</strong>
                        <div class="properties-list">
                            ${crystal.properties.map(prop => 
                                `<span class="property-tag">${prop}</span>`
                            ).join('')}
                        </div>
                    </div>
                    <div class="crystal-uses">
                        <strong>Common Uses:</strong>
                        <ul>
                            ${crystal.uses.map(use => `<li>${use}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    submitAssessment() {
        // Collect answers
        const checkboxes = document.querySelectorAll('.assessment-questions input[type="checkbox"]:checked');
        const answers = {};
        
        checkboxes.forEach(checkbox => {
            const category = checkbox.name;
            if (!answers[category]) {
                answers[category] = [];
            }
            answers[category].push(checkbox.value);
        });

        // Generate recommendations
        const recommendations = CrystalRecommender.getPersonalizedRecommendations(answers);
        this.displayRecommendations(recommendations);

        // Close modal
        document.querySelector('.assessment-modal').remove();
    }

    displayRecommendations(recommendations) {
        const resultsSection = document.getElementById('resultsSection');
        const recommendationsDiv = document.getElementById('recommendations');
        
        if (!resultsSection || !recommendationsDiv) return;

        recommendationsDiv.innerHTML = '';
        
        recommendations.forEach(crystal => {
            const recCard = this.createCrystalCard(crystal);
            recCard.classList.add('recommendation');
            recommendationsDiv.appendChild(recCard);
        });

        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    createFloatingCrystals() {
        const container = document.querySelector('.floating-crystals');
        if (!container) return;

        // Create floating crystal animations
        for (let i = 0; i < 8; i++) {
            const crystal = document.createElement('div');
            crystal.className = 'floating-crystal';
            crystal.innerHTML = '💎';
            crystal.style.cssText = `
                position: absolute;
                font-size: ${Math.random() * 15 + 10}px;
                color: rgba(147, 51, 234, ${Math.random() * 0.3 + 0.1});
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: float ${Math.random() * 10 + 15}s linear infinite;
                opacity: ${Math.random() * 0.5 + 0.3};
            `;
            container.appendChild(crystal);
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'crystal-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: linear-gradient(135deg, #9333EA, #EC4899);
            color: white;
            padding: 15px 20px;
            border-radius: 12px;
            z-index: 1001;
            transform: translateX(100%);
            transition: all 0.3s ease;
            font-family: 'Poppins', sans-serif;
            font-weight: 500;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 4 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    purchasePremium() {
        alert('Premium features coming soon! This will unlock custom crystal grids, advanced chakra analysis, and personalized healing calendars.');
    }
}

// Global functions for onclick handlers
function showCrystalDetails(crystalName) {
    window.crystalHealing.showCrystalDetails(crystalName);
}

function submitAssessment() {
    window.crystalHealing.submitAssessment();
}

// ===== INITIALIZATION =====

document.addEventListener('DOMContentLoaded', () => {
    window.crystalHealing = new CrystalHealing();
});

// ===== UTILITY FUNCTIONS =====

// Add CSS animations dynamically
const crystalAnimations = `
<style>
@keyframes float {
    0% { transform: translateY(100vh) rotate(0deg); }
    100% { transform: translateY(-100px) rotate(360deg); }
}

.category-card {
    background: rgba(147, 51, 234, 0.1);
    border: 2px solid rgba(147, 51, 234, 0.3);
    border-radius: 15px;
    padding: 1.5rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.category-card:hover {
    background: rgba(147, 51, 234, 0.2);
    border-color: #9333EA;
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(147, 51, 234, 0.3);
}

.category-card.selected {
    background: rgba(147, 51, 234, 0.3);
    border-color: #EC4899;
    box-shadow: 0 0 20px rgba(236, 72, 153, 0.4);
}

.category-icon {
    font-size: 2.5rem;
    color: #EC4899;
    margin-bottom: 1rem;
}

.category-card h4 {
    font-family: 'Cinzel', serif;
    color: #FFFFFF;
    margin-bottom: 0.5rem;
}

.category-card p {
    font-family: 'Poppins', sans-serif;
    color: #B8B8B8;
    line-height: 1.4;
    margin-bottom: 1rem;
}

.category-crystals {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
}

.crystal-tag {
    background: rgba(147, 51, 234, 0.2);
    border: 1px solid rgba(147, 51, 234, 0.4);
    border-radius: 15px;
    padding: 0.3rem 0.8rem;
    font-size: 0.8rem;
    color: #FFFFFF;
}

.search-container {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
}

.search-container input {
    flex: 1;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(147, 51, 234, 0.3);
    border-radius: 10px;
    padding: 1rem;
    color: #FFFFFF;
    font-family: 'Poppins', sans-serif;
    font-size: 1rem;
}

.search-button {
    background: linear-gradient(135deg, #9333EA, #EC4899);
    border: none;
    border-radius: 10px;
    padding: 1rem 1.5rem;
    color: white;
    cursor: pointer;
    transition: all 0.3s ease;
}

.search-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(147, 51, 234, 0.4);
}

.filter-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
    margin-bottom: 2rem;
}

.filter-tag {
    background: rgba(147, 51, 234, 0.1);
    border: 1px solid rgba(147, 51, 234, 0.3);
    border-radius: 20px;
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
    color: #FFFFFF;
    cursor: pointer;
    transition: all 0.3s ease;
}

.filter-tag:hover,
.filter-tag.active {
    background: rgba(147, 51, 234, 0.3);
    border-color: #EC4899;
}

.crystal-card {
    background: rgba(147, 51, 234, 0.05);
    border: 1px solid rgba(147, 51, 234, 0.2);
    border-radius: 15px;
    padding: 1.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
}

.crystal-card:hover {
    background: rgba(147, 51, 234, 0.1);
    transform: translateY(-3px);
    box-shadow: 0 10px 25px rgba(147, 51, 234, 0.3);
}

.crystal-card.selected {
    border-color: #EC4899;
    box-shadow: 0 0 15px rgba(236, 72, 153, 0.4);
}

.crystal-card.recommendation {
    border-color: #10B981;
    box-shadow: 0 0 20px rgba(16, 185, 129, 0.5);
}

.crystal-image {
    width: 80px;
    height: 80px;
    margin: 0 auto 1rem;
    position: relative;
    border-radius: 50%;
    overflow: hidden;
}

.crystal-color {
    width: 100%;
    height: 100%;
    border-radius: 50%;
}

.crystal-shape {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 60%;
    height: 60%;
    background: rgba(255, 255, 255, 0.2);
    clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
}

.crystal-name {
    font-family: 'Cinzel', serif;
    font-size: 1.3rem;
    color: #FFFFFF;
    margin-bottom: 0.5rem;
    text-align: center;
}

.crystal-details {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.crystal-chakra,
.crystal-element {
    background: rgba(147, 51, 234, 0.2);
    padding: 0.2rem 0.5rem;
    border-radius: 10px;
    font-size: 0.8rem;
    color: #FFFFFF;
    display: inline-block;
    margin: 0.2rem 0.2rem 0 0;
}

.crystal-description {
    font-family: 'Poppins', sans-serif;
    color: #B8B8B8;
    line-height: 1.5;
    font-size: 0.9rem;
    flex: 1;
}

.crystal-properties {
    display: flex;
    flex-wrap: wrap;
    gap: 0.3rem;
    margin-bottom: 1rem;
}

.property-tag {
    background: rgba(236, 72, 153, 0.2);
    border: 1px solid rgba(236, 72, 153, 0.4);
    border-radius: 12px;
    padding: 0.2rem 0.6rem;
    font-size: 0.7rem;
    color: #FFFFFF;
}

.crystal-details-btn {
    background: linear-gradient(135deg, #9333EA, #EC4899);
    border: none;
    border-radius: 8px;
    padding: 0.5rem 1rem;
    color: white;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.3s ease;
    align-self: flex-start;
}

.crystal-details-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(147, 51, 234, 0.4);
}

.assessment-button {
    background: linear-gradient(135deg, #9333EA, #EC4899);
    border: none;
    border-radius: 15px;
    padding: 1rem 2rem;
    color: white;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 2rem;
}

.assessment-button:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 25px rgba(147, 51, 234, 0.4);
}

.chakra-card {
    background: rgba(147, 51, 234, 0.1);
    border: 1px solid rgba(147, 51, 234, 0.3);
    border-radius: 15px;
    padding: 1.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: center;
}

.chakra-card:hover {
    background: rgba(147, 51, 234, 0.2);
    transform: translateY(-3px);
    box-shadow: 0 10px 25px rgba(147, 51, 234, 0.3);
}

.chakra-color {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    margin: 0 auto 1rem;
}

.chakra-info h4 {
    font-family: 'Cinzel', serif;
    color: #FFFFFF;
    margin-bottom: 0.5rem;
}

.chakra-sanskrit {
    font-style: italic;
    color: #B8B8B8;
    margin-bottom: 0.5rem;
}

.chakra-location {
    color: #B8B8B8;
    margin-bottom: 1rem;
}

.chakra-crystals {
    margin-bottom: 1rem;
}

.chakra-crystal {
    background: rgba(147, 51, 234, 0.2);
    padding: 0.2rem 0.5rem;
    border-radius: 10px;
    font-size: 0.8rem;
    color: #FFFFFF;
    display: inline-block;
    margin: 0.2rem;
}

.chakra-affirmation {
    font-style: italic;
    color: #EC4899;
    margin-top: 1rem;
    line-height: 1.4;
}

@media (max-width: 768px) {
    .search-container {
        flex-direction: column;
        max-width: 100%;
    }
    
    .filter-tags {
        justify-content: flex-start;
    }
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', crystalAnimations);
