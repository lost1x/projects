// ===== SHARED NAVIGATION COMPONENT =====

class HubNavigation {
    constructor() {
        this.currentTool = this.getCurrentTool();
        this.init();
    }

    init() {
        this.createNavigation();
        this.setupEventListeners();
    }

    getCurrentTool() {
        const path = window.location.pathname;
        if (path === '/' || path.endsWith('/index.html')) return 'hub';
        return path.split('/').filter(Boolean)[0] || 'hub';
    }

    createNavigation() {
        // Don't add navigation to hub page
        if (this.currentTool === 'hub') return;

        const navHTML = `
            <nav class="hub-nav">
                <div class="nav-container">
                    <button class="nav-home-btn" onclick="navigateToHub()" title="Back to Hub">
                        <i class="fas fa-home"></i>
                        <span>Hub</span>
                    </button>
                    
                    <div class="nav-title">
                        <h2>${this.getToolTitle()}</h2>
                    </div>
                    
                    <div class="nav-actions">
                        <button class="nav-suggest-btn" onclick="openSuggestionModal()" title="Suggest a Tool">
                            <i class="fas fa-lightbulb"></i>
                        </button>
                        <button class="nav-menu-btn" onclick="toggleNavMenu()" title="Menu">
                            <i class="fas fa-bars"></i>
                        </button>
                    </div>
                </div>
                
                <!-- Mobile Menu -->
                <div class="nav-menu" id="navMenu">
                    <div class="nav-menu-content">
                        <h3>Other Tools</h3>
                        <div class="nav-tools-grid">
                            ${this.getToolLinks()}
                        </div>
                    </div>
                </div>
                
                <!-- Suggestion Modal -->
                <div class="suggestion-modal" id="suggestionModal">
                    <div class="modal-overlay" onclick="closeSuggestionModal()"></div>
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>💡 Suggest Our Next Tool</h3>
                            <button class="modal-close-btn" onclick="closeSuggestionModal()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        
                        <div class="modal-body">
                            <p>What mystical tool would you like to see next? Your ideas help shape our future!</p>
                            
                            <div class="suggestion-form">
                                <div class="form-group">
                                    <label for="nav-tool-suggestion">Your Brilliant Idea:</label>
                                    <div class="input-group">
                                        <input type="text" id="nav-tool-suggestion" placeholder="e.g., Aura Reading, Palmistry..." maxlength="100">
                                        <button class="suggest-submit-btn" onclick="submitNavSuggestion()">
                                            <i class="fas fa-paper-plane"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="popular-suggestions">
                                <h4>🌟 Popular Requests:</h4>
                                <div class="suggestion-tags">
                                    <span class="suggestion-tag" onclick="addNavSuggestion('Aura Reading')">Aura Reading</span>
                                    <span class="suggestion-tag" onclick="addNavSuggestion('Palmistry')">Palmistry</span>
                                    <span class="suggestion-tag" onclick="addNavSuggestion('Spirit Animal')">Spirit Animal</span>
                                    <span class="suggestion-tag" onclick="addNavSuggestion('Tea Leaf Reading')">Tea Leaf Reading</span>
                                    <span class="suggestion-tag" onclick="addNavSuggestion('Moon Phase')">Moon Phase</span>
                                    <span class="suggestion-tag" onclick="addNavSuggestion('Past Life Regression')">Past Life</span>
                                </div>
                            </div>
                            
                            <div class="suggestion-status">
                                <div class="status-icon">
                                    <i class="fas fa-heart"></i>
                                </div>
                                <div class="status-text">
                                    <span id="nav-suggestion-count">0</span> cosmic ideas shared
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        `;

        // Insert navigation at the beginning of body
        document.body.insertAdjacentHTML('afterbegin', navHTML);
    }

    getToolTitle() {
        const titles = {
            'lovequiz': 'Love Language Quiz',
            'mytarot': 'Tarot Reading',
            'dream-interpreter': 'Dream Interpreter',
            'fortune-teller': 'Fortune Teller',
            'zodiac-calculator': 'Zodiac Calculator',
            'numerology': 'Numerology',
            'rune-casting': 'Rune Casting',
            'birth-charts': 'Birth Charts',
            'crystal-healing': 'Crystal Healing'
        };
        const currentTool = this.getCurrentTool();
        return titles[currentTool] || 'Spaarow Hub';
    }

    getToolLinks() {
        // Check if we're on the homepage
        const isHomepage = window.location.pathname === '/' || window.location.pathname.endsWith('/index.html');
        const basePath = isHomepage ? '' : '../';
        
        const tools = [
            { name: 'Love Language Quiz', url: `${basePath}lovequiz/`, icon: 'fa-heart', color: '#EC4899' },
            { name: 'Tarot Reading', url: `${basePath}mytarot/`, icon: 'fa-moon', color: '#6B46C1' },
            { name: 'Dream Interpreter', url: `${basePath}dream-interpreter/`, icon: 'fa-cloud', color: '#3B82F6' },
            { name: 'Fortune Teller', url: `${basePath}fortune-teller/`, icon: 'fa-crystal-ball', color: '#F97316' },
            { name: 'Zodiac Calculator', url: `${basePath}zodiac-calculator/`, icon: 'fa-star', color: '#14B8A6' },
            { name: 'Numerology', url: `${basePath}numerology/`, icon: 'fa-infinity', color: '#9333EA' },
            { name: 'Rune Casting', url: `${basePath}rune-casting/`, icon: 'fa-ankh', color: '#8B4513' },
            { name: 'Birth Charts', url: `${basePath}birth-charts/`, icon: 'fa-star-christmas', color: '#4C1D95' },
            { name: 'Crystal Healing', url: `${basePath}crystal-healing/`, icon: 'fa-gem', color: '#9333EA' }
        ];

        return tools
            .filter(tool => tool.url !== `../${this.currentTool}/`)
            .map(tool => `
                <a href="${tool.url}" class="nav-tool-link" style="--tool-color: ${tool.color}">
                    <i class="fas ${tool.icon}"></i>
                    <span>${tool.name}</span>
                </a>
            `).join('');
    }

    setupEventListeners() {
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            const nav = document.getElementById('navMenu');
            const menuBtn = document.querySelector('.nav-menu-btn');
            const modal = document.getElementById('suggestionModal');
            
            if (!nav.contains(e.target) && !menuBtn.contains(e.target)) {
                nav.classList.remove('active');
            }
            
            // Close modal when clicking overlay
            if (e.target === modal || e.target.classList.contains('modal-overlay')) {
                closeSuggestionModal();
            }
        });
    }
}

// ===== UTILITY FUNCTIONS =====

function navigateToHub() {
    window.location.href = '/';
}

function openSuggestionModal() {
    const modal = document.getElementById('suggestionModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeSuggestionModal() {
    const modal = document.getElementById('suggestionModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

function addNavSuggestion(suggestion) {
    const input = document.getElementById('nav-tool-suggestion');
    input.value = suggestion;
    submitNavSuggestion();
}

function submitNavSuggestion() {
    const input = document.getElementById('nav-tool-suggestion');
    const suggestion = input.value.trim();
    
    if (!suggestion) return;
    
    // Save to localStorage
    const suggestions = JSON.parse(localStorage.getItem('navSuggestions') || '[]');
    suggestions.push({
        text: suggestion,
        timestamp: new Date().toISOString(),
        id: Date.now()
    });
    localStorage.setItem('navSuggestions', JSON.stringify(suggestions));
    
    // Update count
    updateSuggestionCount(suggestions.length);
    
    // Show feedback
    showNavFeedback('✨ Thank you for your cosmic suggestion!');
    
    // Clear input
    input.value = '';
}

function loadSuggestionCount() {
    const suggestions = JSON.parse(localStorage.getItem('navSuggestions') || '[]');
    updateSuggestionCount(suggestions.length);
}

function updateSuggestionCount(count) {
    const countElement = document.getElementById('nav-suggestion-count');
    if (countElement) {
        countElement.textContent = count;
    }
}

function showNavFeedback(message) {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = 'nav-feedback-toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(135deg, #6B46C1, #EC4899);
        color: white;
        padding: 15px 20px;
        border-radius: 12px;
        z-index: 10001;
        transform: translateX(100%);
        transition: all 0.3s ease;
        font-family: 'Poppins', sans-serif;
        font-weight: 500;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    `;

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);

    // Remove after 4 seconds
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 4000);
}

function toggleNavMenu() {
    const menu = document.getElementById('navMenu');
    if (menu) {
        menu.classList.toggle('active');
    }
}

// ===== CSS FOR NAVIGATION (injected dynamically) =====

const navStyles = `
<style>
.hub-nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: rgba(15, 15, 35, 0.95);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.15);
    z-index: 1000;
    transition: all 0.3s ease;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.nav-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1.5rem;
    max-width: 1200px;
    margin: 0 auto;
    height: 70px;
}

.nav-home-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    padding: 0.5rem 1rem;
    color: #FFFFFF;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.2s ease;
    cursor: pointer;
    font-family: 'Poppins', sans-serif;
}

.nav-home-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.nav-title h2 {
    margin: 0;
    font-family: 'Cinzel', serif;
    font-size: 1.5rem;
    background: linear-gradient(135deg, #6B46C1, #EC4899, #FFD700);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-align: center;
    flex: 1;
}

.nav-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.nav-menu-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    padding: 0.5rem;
    color: #FFFFFF;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 1.1rem;
}

.nav-menu-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
}

.nav-menu {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: rgba(15, 15, 35, 0.98);
    backdrop-filter: blur(15px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.15);
    transform: translateY(-100%);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}

.nav-menu.active {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
}

.nav-menu-content {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
}

.nav-menu-content h3 {
    margin: 0 0 1.5rem 0;
    font-family: 'Cinzel', serif;
    color: #FFFFFF;
    text-align: center;
    font-size: 1.3rem;
}

.nav-tools-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
}

.nav-tool-link {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    padding: 1rem;
    color: #FFFFFF;
    text-decoration: none;
    transition: all 0.2s ease;
    text-align: center;
    justify-content: center;
    font-family: 'Poppins', sans-serif;
    font-weight: 500;
}

.nav-tool-link:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: #6B46C1;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.nav-tool-link i {
    font-size: 1.2rem;
    color: var(--tool-color);
}

/* Suggestion Button */
.nav-suggest-btn {
    background: linear-gradient(135deg, var(--primary-purple), var(--primary-pink));
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    cursor: pointer;
    transition: all var(--transition-fast);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.1rem;
}

.nav-suggest-btn:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(107, 70, 193, 0.4);
}

/* Suggestion Modal */
.suggestion-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    visibility: hidden;
    transition: all var(--transition-normal);
}

.suggestion-modal.active {
    opacity: 1;
    visibility: visible;
}

.modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
}

.modal-content {
    background: rgba(15, 15, 35, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    padding: 0;
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
    transform: scale(0.9);
    transition: all var(--transition-normal);
}

.suggestion-modal.active .modal-content {
    transform: scale(1);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h3 {
    margin: 0;
    font-family: var(--font-mystical);
    font-size: 1.3rem;
    background: linear-gradient(135deg, var(--primary-purple), var(--primary-pink));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.modal-close-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    width: 36px;
    height: 36px;
    cursor: pointer;
    transition: all var(--transition-fast);
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-close-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
}

.modal-body {
    padding: 1.5rem;
}

.modal-body p {
    margin-bottom: 1.5rem;
    color: var(--text-primary);
    font-size: 1rem;
    line-height: 1.6;
    text-align: center;
}

.suggestion-form {
    margin-bottom: 1.5rem;
}

.form-group {
    margin-bottom: 1rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    color: var(--text-primary);
    font-weight: 500;
    font-family: var(--font-primary);
}

.input-group {
    display: flex;
    gap: 0.5rem;
}

.input-group input {
    flex: 1;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    padding: 0.75rem 1rem;
    color: var(--text-primary);
    font-family: var(--font-primary);
    font-size: 0.9rem;
    transition: all var(--transition-fast);
}

.input-group input:focus {
    outline: none;
    border-color: var(--primary-purple);
    box-shadow: 0 0 0 3px rgba(107, 70, 193, 0.3);
}

.suggest-submit-btn {
    background: linear-gradient(135deg, var(--primary-purple), var(--primary-pink));
    border: none;
    border-radius: 12px;
    padding: 0.75rem 1.5rem;
    color: white;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition-fast);
    font-family: var(--font-primary);
}

.suggest-submit-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(107, 70, 193, 0.4);
}

.popular-suggestions {
    margin-top: 1.5rem;
}

.popular-suggestions h4 {
    margin-bottom: 1rem;
    color: var(--text-primary);
    font-family: var(--font-primary);
    text-align: center;
}

.suggestion-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
}

.suggestion-tag {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    padding: 0.5rem 1rem;
    color: var(--text-primary);
    cursor: pointer;
    transition: all var(--transition-fast);
    font-size: 0.85rem;
    font-family: var(--font-primary);
}

.suggestion-tag:hover {
    background: rgba(107, 70, 193, 0.2);
    border-color: var(--primary-purple);
    transform: translateY(-2px);
}

.suggestion-status {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 1.5rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
}

.status-icon {
    color: var(--primary-pink);
    font-size: 1.2rem;
}

.status-text {
    color: var(--text-secondary);
    font-size: 0.9rem;
    font-family: var(--font-primary);
}

/* Feedback Toast */
.nav-feedback-toast {
    position: fixed;
    top: 100px;
    right: 20px;
    background: linear-gradient(135deg, #6B46C1, #EC4899);
    color: white;
    padding: 15px 20px;
    border-radius: 12px;
    z-index: 10001;
    font-family: var(--font-primary);
    font-weight: 500;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    transform: translateX(100%);
    transition: all 0.3s ease;
}

.nav-feedback-toast.show {
    transform: translateX(0);
}

/* Add body padding to account for fixed nav */
body {
    padding-top: 70px !important;
}

/* Responsive Design */
@media (max-width: 768px) {
    .nav-container {
        padding: 0.75rem 1rem;
        height: 60px;
    }
    
    .nav-title h2 {
        font-size: 1.2rem;
    }
    
    .nav-home-btn span {
        display: none;
    }
    
    .nav-tools-grid {
        grid-template-columns: 1fr;
    }
    
    body {
        padding-top: 60px !important;
    }
}

@media (max-width: 480px) {
    .nav-menu-content {
        padding: 1.5rem;
    }
    
    .nav-tools-grid {
        gap: 0.75rem;
    }
    
    .nav-tool-link {
        padding: 0.8rem;
        font-size: 0.9rem;
    }
}
</style>
`;

// Initialize navigation when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Inject navigation styles
    if (!document.getElementById('nav-styles')) {
        const styleElement = document.createElement('div');
        styleElement.id = 'nav-styles';
        styleElement.innerHTML = navStyles;
        document.head.appendChild(styleElement);
    }
    
    // Initialize navigation
    window.hubNav = new HubNavigation();
});

// Export for global access
window.HubNavigation = HubNavigation;
window.navigateToHub = navigateToHub;
window.toggleNavMenu = toggleNavMenu;
