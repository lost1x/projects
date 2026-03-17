// ===== SHARED NAVIGATION COMPONENT =====

// Helper list of tool IDs that exist under the hub. Used to resolve the site root and detect the current tool
const KNOWN_TOOL_IDS = [
    'love-language-quiz',
    'tarot-reading',
    'dream-interpreter',
    'fortune-teller',
    'zodiac-calculator',
    'numerology',
    'rune-casting',
    'birth-charts',
    'crystal-healing'
];

let deferredInstallPrompt = null;

function showInstallButton() {
    const btn = document.querySelector('.nav-install-btn');
    if (btn) {
        btn.classList.remove('hidden');
    }
}

function hideInstallButton() {
    const btn = document.querySelector('.nav-install-btn');
    if (btn) {
        btn.classList.add('hidden');
    }
}

function promptInstall() {
    if (!deferredInstallPrompt) return;

    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
            showNavFeedback('App installed!');
        } else {
            showNavFeedback('Install dismissed.');
        }

        deferredInstallPrompt = null;
        hideInstallButton();
    });
}

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

        const segments = path.split('/').filter(Boolean);
        // Find the last segment that matches a known tool ID.
        for (let i = segments.length - 1; i >= 0; i--) {
            if (KNOWN_TOOL_IDS.includes(segments[i])) {
                return segments[i];
            }
        }

        return 'hub';
    }

    getSiteRoot() {
        const path = window.location.pathname;
        const segments = path.split('/').filter(Boolean);

        const toolIndex = segments.findIndex((seg) => KNOWN_TOOL_IDS.includes(seg));
        if (toolIndex === 0) {
            return '/';
        }

        if (toolIndex > 0) {
            return `/${segments.slice(0, toolIndex).join('/')}/`;
        }

        // If there is no known tool segment, assume the first segment is the base path.
        if (segments.length > 0) {
            return `/${segments[0]}/`;
        }

        return '/';
    }

    createNavigation() {
        // Don't add navigation to hub page
        if (this.currentTool === 'hub') return;

        const navHTML = `
            <nav class="hub-nav" aria-label="Primary navigation">
                <div class="nav-container">
                    <button class="nav-home-btn" type="button" onclick="navigateToHub()" aria-label="Go to hub">
                        <i class="fas fa-home"></i>
                        <span>Hub</span>
                    </button>
                    
                    <div class="nav-title">
                        <h2>${this.getToolTitle()}</h2>
                    </div>
                    
                    <div class="nav-actions">
                        <button class="nav-suggest-btn" type="button" onclick="openSuggestionModal()" aria-label="Suggest a tool">
                            <i class="fas fa-lightbulb"></i>
                        </button>
                        <button class="nav-install-btn hidden" type="button" onclick="promptInstall()" aria-label="Install app" title="Install Spaarow Hub">
                            <i class="fas fa-download"></i>
                        </button>
                        <button class="nav-menu-btn" type="button" onclick="toggleNavMenu()" aria-label="Toggle menu" aria-expanded="false" aria-controls="navMenu">
                            <i class="fas fa-bars"></i>
                        </button>
                    </div>
                </div>
                
                <!-- Mobile Menu -->
                <div class="nav-menu" id="navMenu" role="menu" aria-hidden="true">
                    <div class="nav-menu-content">
                        <h3>Other Tools</h3>
                        <div class="nav-tools-grid">
                            ${this.getToolLinks()}
                        </div>
                    </div>
                </div>
                
                <!-- Suggestion Modal -->
                <div class="suggestion-modal" id="suggestionModal" role="dialog" aria-modal="true" aria-labelledby="suggestion-modal-title" aria-hidden="true">
                    <div class="modal-overlay" role="presentation" onclick="closeSuggestionModal()"></div>
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3 id="suggestion-modal-title">💡 Suggest Our Next Tool</h3>
                            <button class="modal-close-btn" type="button" onclick="closeSuggestionModal()" aria-label="Close suggestion modal">
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
                                        <button class="suggest-submit-btn" type="button" onclick="submitNavSuggestion()" aria-label="Submit suggestion">
                                            <i class="fas fa-paper-plane"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="popular-suggestions">
                                <h4>🌟 Popular Requests:</h4>
                                <div class="suggestion-tags">
                                    <span class="suggestion-tag" role="button" tabindex="0" onclick="addNavSuggestion('Aura Reading')">Aura Reading</span>
                                    <span class="suggestion-tag" role="button" tabindex="0" onclick="addNavSuggestion('Palmistry')">Palmistry</span>
                                    <span class="suggestion-tag" role="button" tabindex="0" onclick="addNavSuggestion('Spirit Animal')">Spirit Animal</span>
                                    <span class="suggestion-tag" role="button" tabindex="0" onclick="addNavSuggestion('Tea Leaf Reading')">Tea Leaf Reading</span>
                                    <span class="suggestion-tag" role="button" tabindex="0" onclick="addNavSuggestion('Moon Phase')">Moon Phase</span>
                                    <span class="suggestion-tag" role="button" tabindex="0" onclick="addNavSuggestion('Past Life Regression')">Past Life</span>
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
            'love-language-quiz': 'Love Language Quiz',
            'tarot-reading': 'Tarot Reading',
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
        const basePath = this.getSiteRoot();
        
        const tools = [
            { id: 'love-language-quiz', name: 'Love Language Quiz', url: `${basePath}love-language-quiz/`, icon: 'fa-heart', color: '#EC4899' },
            { id: 'tarot-reading', name: 'Tarot Reading', url: `${basePath}tarot-reading/`, icon: 'fa-moon', color: '#6B46C1' },
            { id: 'dream-interpreter', name: 'Dream Interpreter', url: `${basePath}dream-interpreter/`, icon: 'fa-cloud', color: '#3B82F6' },
            { id: 'fortune-teller', name: 'Fortune Teller', url: `${basePath}fortune-teller/`, icon: 'fa-crystal-ball', color: '#F97316' },
            { id: 'zodiac-calculator', name: 'Zodiac Calculator', url: `${basePath}zodiac-calculator/`, icon: 'fa-star', color: '#14B8A6' },
            { id: 'numerology', name: 'Numerology', url: `${basePath}numerology/`, icon: 'fa-infinity', color: '#9333EA' },
            { id: 'rune-casting', name: 'Rune Casting', url: `${basePath}rune-casting/`, icon: 'fa-ankh', color: '#8B4513' },
            { id: 'birth-charts', name: 'Birth Charts', url: `${basePath}birth-charts/`, icon: 'fa-star-christmas', color: '#4C1D95' },
            { id: 'crystal-healing', name: 'Crystal Healing', url: `${basePath}crystal-healing/`, icon: 'fa-gem', color: '#9333EA' }
        ];

        return tools
            .filter(tool => tool.id !== this.currentTool)
            .map(tool => `
                <a href="${tool.url}" class="nav-tool-link" role="menuitem" tabindex="0" style="--tool-color: ${tool.color}">
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
            
            if (nav && menuBtn && !nav.contains(e.target) && !menuBtn.contains(e.target)) {
                nav.classList.remove('active');
                nav.setAttribute('aria-hidden', 'true');
                menuBtn.setAttribute('aria-expanded', 'false');
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
    const root = window.hubNav?.getSiteRoot?.() || '/';
    window.location.href = root;
}

function openSuggestionModal() {
    const modal = document.getElementById('suggestionModal');
    if (!modal) return;

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    const input = modal.querySelector('#nav-tool-suggestion');
    if (input) {
        input.focus();
    }
}

function closeSuggestionModal() {
    const modal = document.getElementById('suggestionModal');
    if (!modal) return;

    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
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
    const menuBtn = document.querySelector('.nav-menu-btn');
    if (!menu || !menuBtn) return;

    const isActive = menu.classList.toggle('active');
    menu.setAttribute('aria-hidden', String(!isActive));
    menuBtn.setAttribute('aria-expanded', String(isActive));

    if (isActive) {
        // Move focus into menu for keyboard users
        const firstLink = menu.querySelector('.nav-tool-link');
        if (firstLink) {
            firstLink.focus();
        }
    }
}

// Initialize navigation when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Listen for PWA install availability
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredInstallPrompt = e;
        showInstallButton();
    });

    window.addEventListener('appinstalled', () => {
        showNavFeedback('Spaarow Hub installed!');
        deferredInstallPrompt = null;
        hideInstallButton();
    });
    
    // Initialize navigation
    window.hubNav = new HubNavigation();
});

// Export for global access
window.HubNavigation = HubNavigation;
window.navigateToHub = navigateToHub;
window.toggleNavMenu = toggleNavMenu;
