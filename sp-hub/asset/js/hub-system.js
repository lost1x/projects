// ===== HUB FUNCTIONALITY SYSTEM =====

/**
 * Enhanced hub system using AppCore utilities
 * Consolidates hub-specific functionality and reduces redundancy
 */

class HubManager extends AppComponent {
    constructor() {
        super(document.body);
        this.particles = [];
        this.readingHistory = [];
        this.dailyCard = null;
        this.init();
    }

    init() {
        super.init();
        this.setupDailyCard();
        this.setupReadingHistory();
        this.setupParticles();
        this.setupCardInteractions();
        this.setupAnalytics();
        this.setupServiceWorker();
        this.setupInstallPrompt();
        this.startAnimations();
    }

    // Daily Card System
    getDailyFortunes() {
        return [
            "Trust the gentle wisdom of today; small steps lead to great journeys.",
            "Your intuition is your compass—listen closely to what it whispers.",
            "A kind gesture you make today will return to you in unexpected ways.",
            "Let go of what doesn't serve you; the space you create will bring new light.",
            "A fresh idea is closer than you think—write it down and nurture it.",
            "Courage is not the absence of fear, but moving forward with it.",
            "Take a moment to breathe deeply; clarity often comes in stillness.",
            "Reach out to someone you admire—connection can unlock new doors.",
            "The answer you seek is already within you; trust the quiet voice.",
            "Today is a perfect day to start a small habit that will change your life."
        ];
    }

    getTodayKey() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }

    getDailyCard() {
        const todayKey = this.getTodayKey();
        const stored = AppCore.storage.get('daily_card');

        if (stored && stored.date === todayKey) {
            return stored;
        }

        const fortunes = this.getDailyFortunes();
        const index = Math.floor(Math.random() * fortunes.length);
        const card = {
            date: todayKey,
            fortune: fortunes[index],
            seed: index
        };

        AppCore.storage.set('daily_card', card);
        return card;
    }

    setupDailyCard() {
        const section = document.getElementById('dailyCardSection');
        if (!section) return;

        const refreshBtn = document.getElementById('dailyCardRefresh');
        const shareBtn = document.getElementById('dailyCardShare');

        const render = () => {
            const card = this.getDailyCard();
            const content = document.getElementById('dailyCardContent');
            if (!content) return;

            content.innerHTML = `
                <div class="daily-card-message">${card.fortune}</div>
                <div class="daily-card-meta">Your daily card for ${card.date}</div>
            `;
        };

        if (refreshBtn) {
            this.addEventListener(refreshBtn, 'click', () => {
                const fortunes = this.getDailyFortunes();
                const newIndex = Math.floor(Math.random() * fortunes.length);
                const newCard = {
                    date: this.getTodayKey(),
                    fortune: fortunes[newIndex],
                    seed: newIndex
                };
                AppCore.storage.set('daily_card', newCard);
                render();
            });
        }

        if (shareBtn) {
            this.addEventListener(shareBtn, 'click', () => {
                const card = this.getDailyCard();
                this.shareAsImage({
                    title: 'Daily Fortune',
                    subtitle: card.date,
                    body: card.fortune
                });
            });
        }

        render();
    }

    // Reading History System
    setupReadingHistory() {
        this.readingHistory = AppCore.storage.get('reading_history', []);
        this.renderHistory();

        const clearBtn = document.getElementById('clearHistoryBtn');
        if (clearBtn) {
            this.addEventListener(clearBtn, 'click', async () => {
                const confirmed = await window.Modal.confirm(
                    'Are you sure you want to clear your reading history? This action cannot be undone.',
                    { title: 'Clear History' }
                );
                
                if (confirmed) {
                    this.readingHistory = [];
                    AppCore.storage.remove('reading_history');
                    this.renderHistory();
                    window.Toast.show('Reading history cleared.', 'success');
                }
            });
        }
    }

    addHistoryEntry(entry) {
        const record = {
            id: Date.now().toString(36) + Math.random().toString(36).slice(2),
            timestamp: Date.now(),
            ...entry
        };

        this.readingHistory.unshift(record);
        this.readingHistory = this.readingHistory.slice(0, 20);
        AppCore.storage.set('reading_history', this.readingHistory);

        // Also save to server if user is authenticated
        if (window.Auth?.isAuthenticated) {
            const serverEntry = {
                tool_name: entry.tool || 'Unknown Tool',
                reading_type: entry.type || entry.title || 'Reading',
                reading_data: entry.data || entry,
                reading_result: entry.summary || entry.result || entry.description || ''
            };
            window.Auth.saveReading(serverEntry).catch(error => {
                console.warn('Failed to save reading to server:', error);
            });
        }

        this.renderHistory();
        return record;
    }

    removeHistoryEntry(id) {
        this.readingHistory = this.readingHistory.filter(item => item.id !== id);
        AppCore.storage.set('reading_history', this.readingHistory);
        this.renderHistory();
    }

    renderHistory() {
        const container = document.getElementById('readingHistory');
        if (!container) return;

        if (!this.readingHistory.length) {
            container.innerHTML = '<p class="reading-history-empty">No readings saved yet. Try a tool and save your result!</p>';
            return;
        }

        container.innerHTML = '';
        this.readingHistory.forEach(entry => {
            const card = document.createElement('div');
            card.className = 'reading-history-card';

            const date = new Date(entry.timestamp).toLocaleString();
            card.innerHTML = `
                <h3>${entry.tool} — ${entry.title}</h3>
                <p>${entry.summary || entry.details || 'No details provided.'}</p>
                <div class="history-meta">${date}</div>
                <div class="history-actions">
                    <button class="card-button" data-action="share" data-id="${entry.id}">Share</button>
                    <button class="card-button" data-action="delete" data-id="${entry.id}">Delete</button>
                </div>
            `;

            this.addEventListener(card.querySelector('[data-action="share"]'), 'click', () => {
                this.shareAsImage({
                    title: `${entry.tool} Result`,
                    subtitle: entry.title,
                    body: entry.summary || entry.details || ''
                });
            });

            this.addEventListener(card.querySelector('[data-action="delete"]'), 'click', () => {
                this.removeHistoryEntry(entry.id);
                window.Toast.show('Reading removed from history.', 'info');
            });

            container.appendChild(card);
        });
    }

    // Particle System
    setupParticles() {
        const container = document.getElementById('particleContainer');
        if (!container) return;

        // Reduce particles on low-end devices
        const particleCount = AppCore.performance.lowEndDevice ? 10 : 30;

        for (let i = 0; i < particleCount; i++) {
            this.createParticle(container);
        }
    }

    createParticle(container) {
        const particle = document.createElement('div');
        particle.className = 'cosmic-particle';

        const size = Math.random() * 4 + 1;
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 10;
        const startX = Math.random() * window.innerWidth;

        particle.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${startX}px;
            animation-delay: ${delay}s;
            animation-duration: ${duration}s;
            background: rgba(255, 255, 255, ${Math.random() * 0.8 + 0.2});
        `;

        container.appendChild(particle);
        this.particles.push(particle);
    }

    // Card Interactions
    setupCardInteractions() {
        const cards = document.querySelectorAll('.tool-card');

        cards.forEach(card => {
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
            card.setAttribute('aria-pressed', 'false');

            this.addEventListener(card, 'mouseenter', (e) => {
                this.onCardHover(card, true, e);
            });

            this.addEventListener(card, 'mouseleave', (e) => {
                this.onCardHover(card, false, e);
            });

            this.addEventListener(card, 'click', (e) => {
                this.createRippleEffect(card, e);
                const tool = card.dataset.tool;
                if (tool) this.navigateToTool(tool);
            });

            this.addEventListener(card, 'keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const tool = card.dataset.tool;
                    if (tool) this.navigateToTool(tool);
                }
            });
        });
    }

    onCardHover(card, isHovering, event) {
        const glow = card.querySelector('.card-glow');

        if (isHovering) {
            if (glow && event) {
                const rect = card.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;

                glow.style.cssText = `
                    background: radial-gradient(circle at ${x}px ${y}px, 
                        rgba(255,255,255,0.3) 0%, 
                        rgba(255,255,255,0.1) 40%, 
                        transparent 70%);
                    opacity: 1;
                    animation: glowPulse 2s ease-in-out infinite;
                `;
            }

            card.style.transform = 'translateY(-10px) scale(1.02)';
            card.style.zIndex = '10';
        } else {
            card.style.transform = '';
            card.style.zIndex = '';

            if (glow) {
                glow.style.cssText = '';
            }
        }
    }

    createRippleEffect(card, event) {
        const ripple = document.createElement('div');
        ripple.className = 'card-ripple';

        const rect = card.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 70%);
            border-radius: 50%;
            transform: scale(0);
            animation: rippleExpand 0.6s ease-out;
            pointer-events: none;
            z-index: 100;
        `;

        card.appendChild(ripple);

        setTimeout(() => {
            if (card.contains(ripple)) {
                card.removeChild(ripple);
            }
        }, 600);
    }

    navigateToTool(tool) {
        if (!tool || tool === 'coming-soon') return;

        const card = document.querySelector(`[data-tool="${tool}"]`);
        if (card) {
            card.classList.add('loading');
        }

        this.trackEvent('navigation', { tool });

        setTimeout(() => {
            window.location.href = `${tool}/`;
        }, 300);
    }

    // Analytics
    setupAnalytics() {
        this.trackPageView();

        const cards = document.querySelectorAll('.tool-card');
        cards.forEach(card => {
            this.addEventListener(card, 'click', () => {
                const tool = card.dataset.tool;
                this.trackEvent('tool_click', { tool });
            });
        });
    }

    trackPageView() {
        console.log('Page view: Spaarow Hub');
    }

    trackEvent(eventName, parameters = {}) {
        console.log('Event:', eventName, parameters);
    }

    // Service Worker
    setupServiceWorker() {
        if (!('serviceWorker' in navigator)) return;

        navigator.serviceWorker.register('./sw.js').then(registration => {
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                if (!newWorker) return;

                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        window.Toast.show(
                            'New version available. Refresh to update.',
                            'info',
                            {
                                action: 'Refresh',
                                onAction: () => window.location.reload()
                            }
                        );
                    }
                });
            });
        }).catch(() => {
            // Service worker registration failed
        });
    }

    // Install Prompt
    setupInstallPrompt() {
        this.deferredInstallPrompt = null;

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredInstallPrompt = e;
            this.createInstallButton();
        });

        window.addEventListener('appinstalled', () => {
            this.deferredInstallPrompt = null;
            this.hideInstallButton();
            window.Toast.show('Spaarow Hub installed!', 'success');
        });
    }

    createInstallButton() {
        if (document.querySelector('.install-btn')) return;

        const button = document.createElement('button');
        button.className = 'install-btn';
        button.type = 'button';
        button.title = 'Install Spaarow Hub';
        button.innerHTML = '<i class="fas fa-download"></i>';

        this.addEventListener(button, 'click', () => this.promptInstall());
        document.body.appendChild(button);
    }

    hideInstallButton() {
        const button = document.querySelector('.install-btn');
        if (button) button.remove();
    }

    promptInstall() {
        if (!this.deferredInstallPrompt) {
            window.Toast.show('Install prompt not available yet.', 'info');
            return;
        }

        this.deferredInstallPrompt.prompt();
        this.deferredInstallPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                window.Toast.show('Thanks for installing Spaarow Hub!', 'success');
            } else {
                window.Toast.show('Install dismissed.', 'info');
            }
            this.deferredInstallPrompt = null;
            this.hideInstallButton();
        });
    }

    // Animations
    startAnimations() {
        if (!AppCore.performance.reducedMotion) {
            this.animateTitle();
            this.animateBackground();
        }
    }

    animateTitle() {
        const title = document.querySelector('.main-title');
        if (!title) return;

        let time = 0;
        const animate = () => {
            time += 0.01;
            const float = Math.sin(time) * 5;
            title.style.transform = `translateY(${float}px)`;
            requestAnimationFrame(animate);
        };
        animate();
    }

    animateBackground() {
        const background = document.getElementById('cosmicBackground');
        if (!background) return;

        let hue = 0;
        setInterval(() => {
            hue = (hue + 0.1) % 360;
            const color1 = `hsl(${hue}, 20%, 10%)`;
            const color2 = `hsl(${(hue + 60) % 360}, 25%, 15%)`;

            background.style.background = `radial-gradient(ellipse at center, ${color1} 0%, ${color2} 50%, #050510 100%)`;
        }, 100);
    }

    // Share functionality
    shareAsImage({ title, subtitle, body }) {
        const width = 1200;
        const height = 630;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#6B46C1');
        gradient.addColorStop(1, '#EC4899');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Overlay
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect(0, 0, width, height);

        // Text
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';

        ctx.font = 'bold 64px "Cinzel", serif';
        ctx.fillText(title, width / 2, 140);

        ctx.font = '500 40px "Poppins", sans-serif';
        ctx.fillText(subtitle, width / 2, 220);

        ctx.font = '400 34px "Poppins", sans-serif';
        const lines = this.wrapText(body, 36);
        lines.forEach((line, idx) => {
            ctx.fillText(line, width / 2, 300 + idx * 48);
        });

        // Download
        canvas.toBlob(blob => {
            if (!blob) return;
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${title.replace(/\s+/g, '_')}_${Date.now()}.png`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 15000);
        }, 'image/png');
    }

    wrapText(text, maxChars) {
        const words = text.split(' ');
        const lines = [];
        let current = '';
        
        words.forEach(word => {
            if ((current + ' ' + word).trim().length > maxChars) {
                lines.push(current.trim());
                current = word;
            } else {
                current = (current + ' ' + word).trim();
            }
        });
        
        if (current) lines.push(current);
        return lines.slice(0, 10);
    }
}

// Suggestion System
class SuggestionManager extends AppComponent {
    constructor() {
        super(document.body);
        this.suggestions = [];
        this.init();
    }

    init() {
        super.init();
        this.loadSuggestions();
        this.setupEventListeners();
        this.updateVoteCount();
    }

    setupEventListeners() {
        const form = document.getElementById('suggestionForm');
        const input = document.getElementById('toolSuggestion');

        if (form && input) {
            this.addEventListener(form, 'submit', (e) => {
                e.preventDefault();
                this.handleSuggestion(input.value.trim());
            });
        }

        // Popular suggestion tags
        const tags = document.querySelectorAll('.suggestion-tag');
        tags.forEach(tag => {
            this.addEventListener(tag, 'click', () => {
                const suggestion = tag.textContent.trim();
                if (input) input.value = suggestion;
            });
        });
    }

    loadSuggestions() {
        this.suggestions = AppCore.storage.get('tool_suggestions', []);
    }

    saveSuggestions() {
        AppCore.storage.set('tool_suggestions', this.suggestions);
    }

    async handleSuggestion(suggestion) {
        if (!suggestion) {
            window.Toast.show('Please enter a suggestion', 'warning');
            return;
        }

        if (this.suggestions.includes(suggestion)) {
            window.Toast.show('You already suggested this!', 'info');
            return;
        }

        this.suggestions.push(suggestion);
        this.saveSuggestions();
        this.updateVoteCount();

        window.Toast.show('Thank you for your suggestion!', 'success');

        // Clear input
        const input = document.getElementById('toolSuggestion');
        if (input) input.value = '';
    }

    updateVoteCount() {
        const countEl = document.getElementById('vote-count');
        if (countEl) {
            countEl.textContent = this.suggestions.length;
        }
    }
}

// Initialize hub system
document.addEventListener('DOMContentLoaded', () => {
    window.Hub = new HubManager();
    window.Suggestions = new SuggestionManager();

    // Expose helper for tools to save readings
    window.saveReading = (entry) => {
        if (window.Hub) {
            return window.Hub.addHistoryEntry(entry);
        }
        return null;
    };

    // Expose history for debug / advanced usage
    window.readingHistory = {
        getAll: () => window.Hub?.readingHistory || [],
        clear: () => {
            window.Hub.readingHistory = [];
            AppCore.storage.remove('reading_history');
            window.Hub.renderHistory();
        }
    };

    // Backward compatibility
    window.navigateToTool = (tool) => {
        if (window.Hub) {
            window.Hub.navigateToTool(tool);
        } else {
            window.location.href = `${tool}/`;
        }
    };
});

// Export for global access
window.HubManager = HubManager;
window.SuggestionManager = SuggestionManager;
