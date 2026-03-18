// ===== CONSOLIDATED SCRIPT LOADER =====

/**
 * Optimized script loader that loads all JavaScript modules
 * Replaces multiple individual script tags with a single, efficient loader
 */

(function() {
    'use strict';

    // Script loading configuration
    const SCRIPT_CONFIG = {
        // Core scripts (always loaded first)
        core: [
            'core.js',
            'ui-components.js'
        ],
        
        // Feature scripts (loaded based on page requirements)
        features: {
            auth: 'auth-system.js',
            hub: 'hub-system.js',
            tools: 'tool-system.js',
            app: 'app.js'
        },

        // Page-specific script requirements
        pages: {
            // Main hub page
            '/': ['auth', 'hub', 'app'],
            '/index.html': ['auth', 'hub', 'app'],
            
            // Tool pages
            '/tarot-reading/': ['auth', 'app'],
            '/dream-interpreter/': ['auth', 'app'],
            '/zodiac-calculator/': ['auth', 'app'],
            '/numerology/': ['auth', 'app'],
            '/rune-casting/': ['auth', 'app'],
            '/crystal-healing/': ['auth', 'app'],
            '/fortune-teller/': ['auth', 'app'],
            '/birth-charts/': ['auth', 'app'],
            '/love-language-quiz/': ['auth', 'app'],
            
            // Profile page
            '/asset/pages/profile.html': ['auth', 'app'],
            
            // Default (load all features)
            'default': ['auth', 'hub', 'tools', 'app']
        }
    };

    // Cache for loaded scripts
    const loadedScripts = new Set();
    const loadingPromises = new Map();

    /**
     * Get the current page path
     */
    function getCurrentPage() {
        const path = window.location.pathname;
        
        // Handle root and index.html
        if (path === '/' || path.endsWith('/index.html')) {
            return '/';
        }
        
        // Remove trailing slash for consistent matching
        return path.replace(/\/$/, '');
    }

    /**
     * Determine which scripts to load for the current page
     */
    function getRequiredScripts() {
        const currentPage = getCurrentPage();
        
        // Check for exact match first
        if (SCRIPT_CONFIG.pages[currentPage]) {
            return SCRIPT_CONFIG.pages[currentPage];
        }
        
        // Check for partial matches (for tool pages)
        for (const [page, scripts] of Object.entries(SCRIPT_CONFIG.pages)) {
            if (page !== '/' && page !== '/index.html' && currentPage.startsWith(page.replace(/\/$/, ''))) {
                return scripts;
            }
        }
        
        // Default to all features
        return SCRIPT_CONFIG.pages.default;
    }

    /**
     * Load a single script
     */
    function loadScript(src) {
        if (loadedScripts.has(src)) {
            return Promise.resolve();
        }
        
        if (loadingPromises.has(src)) {
            return loadingPromises.get(src);
        }

        const promise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = true;
            
            script.onload = () => {
                loadedScripts.add(src);
                loadingPromises.delete(src);
                resolve();
            };
            
            script.onerror = () => {
                loadingPromises.delete(src);
                reject(new Error(`Failed to load script: ${src}`));
            };
            
            document.head.appendChild(script);
        });

        loadingPromises.set(src, promise);
        return promise;
    }

    /**
     * Load multiple scripts in order
     */
    async function loadScripts(scripts) {
        const results = [];
        
        for (const script of scripts) {
            try {
                await loadScript(script);
                results.push({ script, status: 'loaded' });
            } catch (error) {
                results.push({ script, status: 'error', error });
                console.error(`Failed to load ${script}:`, error);
            }
        }
        
        return results;
    }

    /**
     * Show loading indicator
     */
    function showLoading() {
        const loading = document.createElement('div');
        loading.id = 'scriptLoader';
        loading.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                </div>
                <div class="loading-text">Loading Spaarow Hub...</div>
            </div>
        `;
        
        loading.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            color: white;
            font-family: 'Poppins', sans-serif;
        `;
        
        const content = loading.querySelector('.loading-content');
        content.style.cssText = `
            text-align: center;
        `;
        
        const spinner = loading.querySelector('.loading-spinner');
        spinner.style.cssText = `
            font-size: 2rem;
            margin-bottom: 1rem;
        `;
        
        const text = loading.querySelector('.loading-text');
        text.style.cssText = `
            font-size: 1.2rem;
            opacity: 0.8;
        `;
        
        document.body.appendChild(loading);
    }

    /**
     * Hide loading indicator
     */
    function hideLoading() {
        const loading = document.getElementById('scriptLoader');
        if (loading) {
            loading.style.opacity = '0';
            loading.style.transition = 'opacity 0.3s ease';
            setTimeout(() => loading.remove(), 300);
        }
    }

    /**
     * Initialize the script loader
     */
    async function init() {
        try {
            showLoading();
            
            // Load core scripts first
            console.log('📦 Loading core scripts...');
            const coreResults = await loadScripts(SCRIPT_CONFIG.core);
            
            const coreErrors = coreResults.filter(r => r.status === 'error');
            if (coreErrors.length > 0) {
                throw new Error(`Core scripts failed to load: ${coreErrors.map(r => r.script).join(', ')}`);
            }
            
            // Determine required feature scripts
            const requiredFeatures = getRequiredScripts();
            console.log('🎯 Required features:', requiredFeatures);
            
            // Load feature scripts
            const featureScripts = requiredFeatures.map(feature => SCRIPT_CONFIG.features[feature]).filter(Boolean);
            console.log('🛠️ Loading feature scripts:', featureScripts);
            
            const featureResults = await loadScripts(featureScripts);
            
            const featureErrors = featureResults.filter(r => r.status === 'error');
            if (featureErrors.length > 0) {
                console.warn('Some feature scripts failed to load:', featureErrors);
            }
            
            hideLoading();
            
            // Emit load complete event
            document.dispatchEvent(new CustomEvent('scripts:loaded', {
                detail: {
                    core: coreResults,
                    features: featureResults,
                    page: getCurrentPage()
                }
            }));
            
        } catch (error) {
            hideLoading();
            console.error('❌ Script loading failed:', error);
            
            // Show error message
            const errorDiv = document.createElement('div');
            errorDiv.innerHTML = `
                <div style="
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: #1a1a2e;
                    color: white;
                    padding: 2rem;
                    border-radius: 8px;
                    text-align: center;
                    z-index: 10000;
                    border: 1px solid #ec4899;
                ">
                    <h3>⚠️ Loading Error</h3>
                    <p>Failed to load application scripts.</p>
                    <button onclick="location.reload()" style="
                        background: #ec4899;
                        color: white;
                        border: none;
                        padding: 0.5rem 1rem;
                        border-radius: 4px;
                        cursor: pointer;
                        margin-top: 1rem;
                    ">Reload</button>
                </div>
            `;
            document.body.appendChild(errorDiv);
        }
    }

    // Start loading when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose utilities for debugging
    window.ScriptLoader = {
        getLoadedScripts: () => Array.from(loadedScripts),
        getRequiredScripts: getRequiredScripts,
        reload: init,
        config: SCRIPT_CONFIG
    };

})();
