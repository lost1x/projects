// ===== SPAAROW HUB - CORE SCRIPT =====

class SpaarowHub {
    constructor() {
        this.particles = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.performanceMode = this.getPerformanceMode();
        this.activeFocusElement = null;
        this.deferredInstallPrompt = null;
        this.init();
    }

    init() {
        this.setupPerformanceOptimizations();
        this.setupServiceWorker();
        this.setupInstallPrompt();
        this.setupDailyCard();
        this.setupReadingHistory();
        this.setupParticles();
        this.setupEventListeners();
        this.setupCardInteractions();
        this.loadToolCards();
        this.startAnimations();
        this.setupAnalytics();
    }

    /**
     * Daily Fortune / Card
     */
    getDailyFortunes() {
        return [
            "Trust the gentle wisdom of today; small steps lead to great journeys.",
            "Your intuition is your compass—listen closely to what it whispers.",
            "A kind gesture you make today will return to you in unexpected ways.",
            "Let go of what doesn’t serve you; the space you create will bring new light.",
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

    getDailyCardFromStorage() {
        const stored = localStorage.getItem('spaarowDailyCard');
        if (!stored) return null;
        try {
            return JSON.parse(stored);
        } catch {
            return null;
        }
    }

    saveDailyCard(data) {
        localStorage.setItem('spaarowDailyCard', JSON.stringify(data));
    }

    getDailyCard() {
        const todayKey = this.getTodayKey();
        const stored = this.getDailyCardFromStorage();

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
        this.saveDailyCard(card);
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
            refreshBtn.addEventListener('click', () => {
                const todayKey = this.getTodayKey();
                const fortunes = this.getDailyFortunes();
                const newIndex = Math.floor(Math.random() * fortunes.length);
                const newCard = { date: todayKey, fortune: fortunes[newIndex], seed: newIndex };
                this.saveDailyCard(newCard);
                render();
            });
        }

        if (shareBtn) {
            shareBtn.addEventListener('click', () => {
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

    /**
     * Reading History (localStorage)
     */
    setupReadingHistory() {
        this.historyKey = 'spaarowReadingHistory';
        this.history = this.loadHistory();
        this.renderHistory();

        const clearBtn = document.getElementById('clearHistoryBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.history = [];
                this.persistHistory();
                this.renderHistory();
                this.showToast('Reading history cleared.');
            });
        }
    }

    loadHistory() {
        const raw = localStorage.getItem(this.historyKey);
        if (!raw) return [];
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed;
        } catch (e) {
            // ignore
        }
        return [];
    }

    persistHistory() {
        localStorage.setItem(this.historyKey, JSON.stringify(this.history));
    }

    addHistoryEntry(entry) {
        const record = {
            id: Date.now().toString(36) + Math.random().toString(36).slice(2),
            timestamp: Date.now(),
            ...entry
        };
        this.history.unshift(record);
        this.history = this.history.slice(0, 20);
        this.persistHistory();
        this.renderHistory();
        return record;
    }

    removeHistoryEntry(id) {
        this.history = this.history.filter(item => item.id !== id);
        this.persistHistory();
        this.renderHistory();
    }

    renderHistory() {
        const container = document.getElementById('readingHistory');
        if (!container) return;

        if (!this.history.length) {
            container.innerHTML = '<p class="reading-history-empty">No readings saved yet. Try a tool and save your result!</p>';
            return;
        }

        container.innerHTML = '';
        this.history.forEach(entry => {
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

            card.querySelector('[data-action="share"]').addEventListener('click', () => {
                this.shareAsImage({
                    title: `${entry.tool} Result`,
                    subtitle: entry.title,
                    body: entry.summary || entry.details || ''
                });
            });

            card.querySelector('[data-action="delete"]').addEventListener('click', () => {
                this.removeHistoryEntry(entry.id);
                this.showToast('Reading removed from history.');
            });

            container.appendChild(card);
        });
    }

    shareAsImage({ title, subtitle, body }) {
        const width = 1200;
        const height = 630;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, '#6B46C1');
        gradient.addColorStop(1, '#EC4899');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect(0, 0, width, height);

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

    getPerformanceMode() {
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        const isSlowConnection = connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g');
        const isLowEndDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2;

        return {
            reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
            reducedData: window.matchMedia('(prefers-reduced-data: reduce)').matches,
            slowConnection: isSlowConnection,
            lowEndDevice: isLowEndDevice
        };
    }

    setupPerformanceOptimizations() {
        this.setupLazyLoading();
        this.optimizeAnimations();
        this.setupIntersectionObserver();
    }

    setupLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        if (!('IntersectionObserver' in window) || images.length === 0) return;

        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });

        images.forEach(img => imageObserver.observe(img));
    }

    optimizeAnimations() {
        if (this.performanceMode.reducedMotion || this.performanceMode.lowEndDevice) {
            document.body.classList.add('reduced-animations');
        }

        if (this.performanceMode.reducedData) {
            document.body.classList.add('reduced-data');
        }
    }

    setupIntersectionObserver() {
        if (!('IntersectionObserver' in window)) return;

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible', 'gpu-accelerated');
                }
            });
        }, observerOptions);

        const elementsToObserve = document.querySelectorAll('.tool-card, section, .card');
        elementsToObserve.forEach(el => this.intersectionObserver.observe(el));
    }

    setupServiceWorker() {
        if (!('serviceWorker' in navigator)) return;

        // Use a relative path so the service worker works when hosted in a subdirectory.
        navigator.serviceWorker.register('./sw.js').then(registration => {
            // Auto-update the service worker when new content is available
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                if (!newWorker) return;

                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // New service worker installed, prompt for refresh
                        this.showToast('New version available. Refresh to update.', { action: 'Refresh', onClick: () => window.location.reload() });
                    }
                });
            });
        }).catch(() => {
            // Service worker registration failed.
        });
    }

    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredInstallPrompt = e;
            this.createInstallButton();
        });

        window.addEventListener('appinstalled', () => {
            this.deferredInstallPrompt = null;
            this.showToast('Spaarow Hub installed!');
            this.hideInstallButton();
        });
    }

    createInstallButton() {
        if (document.querySelector('.install-btn')) return;

        const button = document.createElement('button');
        button.className = 'install-btn';
        button.type = 'button';
        button.title = 'Install Spaarow Hub';
        button.innerHTML = '<i class="fas fa-download"></i>';
        button.addEventListener('click', () => this.promptInstall());

        document.body.appendChild(button);
    }

    hideInstallButton() {
        const button = document.querySelector('.install-btn');
        if (button) {
            button.remove();
        }
    }

    promptInstall() {
        if (!this.deferredInstallPrompt) {
            this.showToast('Install prompt not available yet.');
            return;
        }

        this.deferredInstallPrompt.prompt();
        this.deferredInstallPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                this.showToast('Thanks for installing Spaarow Hub!');
            } else {
                this.showToast('Install dismissed.');
            }
            this.deferredInstallPrompt = null;
            this.hideInstallButton();
        });
    }

    setupParticles() {
        const container = document.getElementById('particleContainer');
        if (!container) return;

        for (let i = 0; i < 30; i++) {
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

    setupEventListeners() {
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            this.updateMouseEffects();
        });

        window.addEventListener('scroll', () => {
            this.updateScrollEffects();
        });

        window.addEventListener('resize', () => {
            this.handleResize();
        });

        document.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e));
    }

    setupCardInteractions() {
        const cards = document.querySelectorAll('.tool-card');

        cards.forEach(card => {
            card.setAttribute('tabindex', '0');
            card.setAttribute('role', 'button');
            card.setAttribute('aria-pressed', 'false');

            card.addEventListener('mouseenter', (e) => {
                this.onCardHover(card, true, e);
            });

            card.addEventListener('mouseleave', (e) => {
                this.onCardHover(card, false, e);
            });

            card.addEventListener('click', (e) => {
                this.createRippleEffect(card, e);
                const tool = card.dataset.tool;
                if (tool) this.navigateToTool(tool);
            });

            card.addEventListener('keydown', (e) => {
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

    loadToolCards() {
        const cards = document.querySelectorAll('.tool-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(50px)';

            setTimeout(() => {
                card.style.transition = 'all 0.6s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';

                setTimeout(() => {
                    card.classList.add('loaded');
                }, 600);
            }, index * 100);
        });
    }

    updateMouseEffects() {
        const orbs = document.querySelectorAll('.floating-orb');
        const x = this.mouseX / window.innerWidth;
        const y = this.mouseY / window.innerHeight;

        orbs.forEach((orb, index) => {
            const speed = (index + 1) * 10;
            const xOffset = (x - 0.5) * speed;
            const yOffset = (y - 0.5) * speed;

            orb.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
        });
    }

    updateScrollEffects() {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero-section');

        if (hero) {
            hero.style.transform = `translateY(${scrolled * 0.5}px)`;
            hero.style.opacity = 1 - scrolled / 500;
        }
    }

    handleResize() {
        const container = document.getElementById('particleContainer');
        if (!container) return;

        container.innerHTML = '';
        this.particles = [];
        this.setupParticles();
    }

    startAnimations() {
        this.animateTitle();
        this.animateBackground();
    }

    animateTitle() {
        const title = document.querySelector('.main-title');
        if (!title) return;

        let time = 0;
        setInterval(() => {
            time += 0.01;
            const float = Math.sin(time) * 5;
            title.style.transform = `translateY(${float}px)`;
        }, 50);
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

    handleKeyboardNavigation(e) {
        const cards = Array.from(document.querySelectorAll('.tool-card:not(.coming-soon)'));
        const focusedCard = document.activeElement.closest('.tool-card');
        if (!focusedCard) return;

        const currentIndex = cards.indexOf(focusedCard);
        let nextIndex = currentIndex;

        switch (e.key) {
            case 'ArrowRight':
            case 'ArrowDown':
                nextIndex = (currentIndex + 1) % cards.length;
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
                nextIndex = (currentIndex - 1 + cards.length) % cards.length;
                break;
            default:
                return;
        }

        if (nextIndex !== currentIndex) {
            e.preventDefault();
            cards[nextIndex].focus();
        }
    }

    navigateToTool(tool) {
        if (!tool || tool === 'coming-soon') return;

        const card = document.querySelector(`[data-tool="${tool}"]`);
        if (card) {
            card.classList.add('loading');
        }

        this.trackEvent('navigation', { tool });

        setTimeout(() => {
            // Use a relative path so the hub works from nested base paths (e.g., /sp-hub/)
            window.location.href = `${tool}/`;
        }, 300);
    }

    setupAnalytics() {
        this.trackPageView();

        const cards = document.querySelectorAll('.tool-card');
        cards.forEach(card => {
            card.addEventListener('click', () => {
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

    showToast(message, options = {}) {
        const { duration = 4000, action, onClick } = options;
        const toast = document.createElement('div');
        toast.className = 'hub-toast';
        toast.innerHTML = `
            <span>${message}</span>
            ${action ? `<button class="hub-toast-action" type="button">${action}</button>` : ''}
        `;

        document.body.appendChild(toast);

        if (action && typeof onClick === 'function') {
            toast.querySelector('.hub-toast-action')?.addEventListener('click', () => {
                onClick();
                toast.classList.add('hide');
            });
        }

        setTimeout(() => toast.classList.add('show'), 50);
        setTimeout(() => {
            toast.classList.add('hide');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }
}

// ===== UTILITY & UI HELPERS =====

function navigateToTool(tool) {
    if (typeof tool === 'string') {
        window.hub.navigateToTool(tool);
        return;
    }

    // In case the function is invoked by an event
    const card = tool?.currentTarget?.closest?.('.tool-card');
    const toolName = card?.dataset?.tool;
    if (toolName) {
        window.hub.navigateToTool(toolName);
    }
}

function showPrivacy() {
    showModal('Privacy Policy', 'Your privacy is important to us. We collect minimal data necessary to provide our services...');
}

function showTerms() {
    showModal('Terms of Service', 'By using our services, you agree to our terms and conditions...');
}

function showSupport() {
    showModal('Support', 'Need help? Contact us at support@spaarowhub.great-site.net');
}

function showModal(title, content) {
    const previouslyFocused = document.activeElement;

    let modal = document.getElementById('modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal';
        modal.innerHTML = `
            <div class="modal-overlay" role="presentation" tabindex="-1">
                <div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="modal-title" aria-describedby="modal-body">
                    <div class="modal-header">
                        <h3 id="modal-title"></h3>
                        <button class="modal-close" aria-label="Close modal">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body" id="modal-body"></div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.querySelector('.modal-overlay').addEventListener('click', closeModal);
        modal.querySelector('.modal-close').addEventListener('click', closeModal);

        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        });
    }

    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = `<p>${content}</p>`;

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    const focusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable) focusable.focus();

    window._previouslyFocusedElement = previouslyFocused;
}

function closeModal() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';

        if (window._previouslyFocusedElement && typeof window._previouslyFocusedElement.focus === 'function') {
            window._previouslyFocusedElement.focus();
        }
    }
}

// ===== SUGGESTION SYSTEM =====

class SuggestionSystem {
    constructor() {
        this.suggestions = [];
        this.loadSuggestions();
        this.updateVoteCount();
    }

    loadSuggestions() {
        const stored = localStorage.getItem('toolSuggestions');
        if (stored) {
            try {
                this.suggestions = JSON.parse(stored);
            } catch (e) {
                this.suggestions = [];
            }
        }
    }

    saveSuggestions() {
        localStorage.setItem('toolSuggestions', JSON.stringify(this.suggestions));
    }

    async addSuggestion(suggestion) {
        if (!this.suggestions.includes(suggestion)) {
            this.suggestions.push(suggestion);
            this.saveSuggestions();
            this.updateVoteCount();
            this.showFeedback('Thank you for your suggestion!', 'success');
        } else {
            this.showFeedback('You already suggested this!', 'info');
        }
    }

    updateVoteCount() {
        const countEl = document.getElementById('vote-count');
        if (!countEl) return;
        countEl.textContent = this.suggestions.length;
    }

    showFeedback(message, type = 'info') {
        const feedback = document.createElement('div');
        feedback.className = `suggestion-feedback ${type}`;
        feedback.textContent = message;
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 10px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        `;

        if (type === 'success') {
            feedback.style.background = 'rgba(34, 197, 94, 0.9)';
        } else if (type === 'error') {
            feedback.style.background = 'rgba(239, 68, 68, 0.9)';
        } else {
            feedback.style.background = 'rgba(59, 130, 246, 0.9)';
        }

        document.body.appendChild(feedback);

        setTimeout(() => {
            feedback.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (feedback.parentNode) {
                    feedback.parentNode.removeChild(feedback);
                }
            }, 300);
        }, 3000);
    }
}

// ===== INITIALIZATION =====

document.addEventListener('DOMContentLoaded', () => {
    window.hub = new SpaarowHub();
    window.suggestionSystem = new SuggestionSystem();

    // Expose helper for tools to save readings
    window.saveReading = (entry) => {
        if (window.hub && typeof window.hub.addHistoryEntry === 'function') {
            return window.hub.addHistoryEntry(entry);
        }
        return null;
    };

    // Expose history for debug / advanced usage
    window.readingHistory = {
        getAll: () => window.hub?.history || [],
        clear: () => {
            if (window.hub) {
                window.hub.history = [];
                window.hub.persistHistory();
                window.hub.renderHistory();
            }
        }
    };

    // Reveal header with animation
    const header = document.querySelector('.header');
    if (header) {
        header.style.opacity = '0';
        header.style.transform = 'translateY(-30px)';
        header.style.transition = 'opacity 0.8s ease, transform 0.8s ease';

        setTimeout(() => {
            header.style.opacity = '1';
            header.style.transform = 'translateY(0)';
        }, 100);
    }
});

// Export for global access
window.SpaarowHub = SpaarowHub;
window.navigateToTool = navigateToTool;
window.showPrivacy = showPrivacy;
window.showTerms = showTerms;
window.showSupport = showSupport;
window.closeModal = closeModal;
window.addSuggestion = (suggestion) => window.suggestionSystem?.addSuggestion(suggestion);
window.submitSuggestion = () => {
    const input = document.getElementById('tool-suggestion');
    const suggestion = input?.value.trim();
    if (suggestion) {
        window.suggestionSystem.addSuggestion(suggestion);
        input.value = '';
        input.focus();
    }
};

