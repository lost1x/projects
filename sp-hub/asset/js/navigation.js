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
            </nav>
        `;

        // Insert navigation at the beginning of body
        document.body.insertAdjacentHTML('afterbegin', navHTML);
    }

    getToolTitle() {
        const titles = {
            'lovequiz': 'Love Quiz',
            'mytarot': 'Tarot Reading',
            'dream-interpreter': 'Dream Interpreter',
            'fortune-teller': 'Fortune Teller',
            'zodiac-calculator': 'Zodiac Calculator',
            'numerology': 'Numerology'
        };
        return titles[this.currentTool] || 'Mystical Tool';
    }

    getToolLinks() {
        const tools = [
            { id: 'lovequiz', name: 'Love Quiz', icon: 'fa-heart', color: '#EC4899' },
            { id: 'mytarot', name: 'Tarot Reading', icon: 'fa-moon', color: '#6B46C1' },
            { id: 'dream-interpreter', name: 'Dream Interpreter', icon: 'fa-cloud', color: '#3B82F6' },
            { id: 'fortune-teller', name: 'Fortune Teller', icon: 'fa-circle', color: '#F97316' },
            { id: 'zodiac-calculator', name: 'Zodiac Calculator', icon: 'fa-star', color: '#14B8A6' },
            { id: 'numerology', name: 'Numerology', icon: 'fa-infinity', color: '#9333EA' }
        ];

        return tools
            .filter(tool => tool.id !== this.currentTool)
            .map(tool => `
                <a href="/${tool.id}/" class="nav-tool-link" style="--tool-color: ${tool.color}">
                    <i class="fas ${tool.icon}"></i>
                    <span>${tool.name}</span>
                </a>
            `).join('');
    }

    setupEventListeners() {
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            const menu = document.getElementById('navMenu');
            const menuBtn = document.querySelector('.nav-menu-btn');
            
            if (menu && menuBtn && !menu.contains(e.target) && !menuBtn.contains(e.target)) {
                menu.classList.remove('active');
            }
        });

        // Handle escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const menu = document.getElementById('navMenu');
                if (menu) menu.classList.remove('active');
            }
        });
    }
}

// ===== UTILITY FUNCTIONS =====

function navigateToHub() {
    window.location.href = '/';
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
    color: #6B46C1;
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
