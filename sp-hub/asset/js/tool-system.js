// ===== TOOL-SPECIFIC FUNCTIONALITY SYSTEM =====

/**
 * Enhanced tool system using AppCore utilities
 * Consolidates tool-specific functionality and reduces redundancy
 */

// Enhanced Chatbot System
class ChatbotManager extends AppComponent {
    constructor() {
        super(document.body);
        this.presetQuestions = [
            "What does my future hold?",
            "Will I find love soon?",
            "What is my life purpose?",
            "Am I on the right path?",
            "What challenges will I face?",
            "Should I take this opportunity?",
            "What does my zodiac sign say about me?",
            "How can I improve my relationships?",
            "What career path should I choose?",
            "What message does the universe have for me?"
        ];
        this.conversationContext = [];
        this.init();
    }

    init() {
        super.init();
        this.setupChatInterface();
        this.setupHoroscopeSubscription();
    }

    setupChatInterface() {
        this.chatContainer = document.getElementById('chatbotMessages');
        this.input = document.getElementById('chatbotInput');
        this.sendButton = document.getElementById('chatbotSend');

        if (!this.chatContainer || !this.input || !this.sendButton) return;

        this.addEventListener(this.sendButton, 'click', () => this.handleSend());
        this.addEventListener(this.input, 'keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.handleSend();
            }
        });

        this.addPresetQuestionButtons();
    }

    addPresetQuestionButtons() {
        const questionsHtml = this.presetQuestions.map((question, index) => 
            `<button class="preset-question-btn" onclick="window.Chatbot.selectPresetQuestion(${index})">${question}</button>`
        ).join('');
        
        this.addMessage('system', 
            `<div class="preset-questions">
                <p class="preset-intro">Choose a question to begin your oracle session:</p>
                <div class="preset-buttons">${questionsHtml}</div>
            </div>`
        );
    }

    selectPresetQuestion(index) {
        const question = this.presetQuestions[index];
        this.input.value = question;
        
        // Remove preset buttons
        const presetButtons = this.chatContainer.querySelector('.preset-questions');
        if (presetButtons) {
            presetButtons.remove();
        }
        
        // Auto-send the selected question
        this.handleSend();
    }

    async handleSend() {
        const text = this.input.value.trim();
        if (!text) return;
        
        // Add to conversation context
        this.conversationContext.push({ role: 'user', message: text });
        
        this.addMessage('user', text);
        this.input.value = '';
        window.Loading.setButtonLoading(this.sendButton, true);

        try {
            const response = await AppCore.api.post('chatbot.php', {
                prompt: text,
                context: this.conversationContext.slice(-5) // Send last 5 messages for context
            });

            const reply = response.response || 'The oracle is contemplating your question...';
            
            // Add oracle response to context
            this.conversationContext.push({ role: 'oracle', message: reply });
            
            this.addMessage('oracle', reply);
        } catch (error) {
            this.addMessage('oracle', 'Sorry, I could not connect to the oracle right now.');
            console.error('Chatbot error:', error);
        } finally {
            window.Loading.setButtonLoading(this.sendButton, false);
        }
    }

    addMessage(role, text) {
        if (!this.chatContainer) return;
        
        const msg = document.createElement('div');
        msg.className = `chatbot-message ${role}`;
        msg.textContent = text;
        this.chatContainer.appendChild(msg);
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }
}

// Enhanced Profile System
class ProfileManager extends AppComponent {
    constructor() {
        super(document.body);
        this.currentUser = null;
        this.readings = [];
        this.init();
    }

    init() {
        super.init();
        if (!window.Auth?.isAuthenticated) {
            window.location.href = '../';
            return;
        }

        this.loadProfile();
        this.loadReadings();
        this.setupEventListeners();
    }

    async loadProfile() {
        try {
            const profile = await window.Auth.getProfile();
            if (profile) {
                this.currentUser = profile.user;
                this.displayProfile(profile);
            }
        } catch (error) {
            console.error('Load profile error:', error);
        }
    }

    displayProfile(profile) {
        const user = profile.user;
        const stats = profile.stats;

        // Update view mode elements
        const elements = {
            displayNameView: document.getElementById('displayNameView'),
            usernameView: document.getElementById('usernameView'),
            emailView: document.getElementById('emailView'),
            birthDateView: document.getElementById('birthDateView'),
            zodiacView: document.getElementById('zodiacView'),
            bioView: document.getElementById('bioView'),
            joinedView: document.getElementById('joinedView'),
            totalReadings: document.getElementById('totalReadings'),
            favoriteReadings: document.getElementById('favoriteReadings'),
            avatarImage: document.getElementById('avatarImage')
        };

        if (elements.avatarImage) {
            elements.avatarImage.src = user.avatar_url || '../asset/img/avatar-placeholder.svg';
        }

        if (elements.displayNameView) elements.displayNameView.textContent = user.display_name || '-';
        if (elements.usernameView) elements.usernameView.textContent = user.username;
        if (elements.emailView) elements.emailView.textContent = user.email;
        if (elements.birthDateView) elements.birthDateView.textContent = user.birth_date ? new Date(user.birth_date).toLocaleDateString() : 'Not set';
        if (elements.zodiacView) elements.zodiacView.textContent = user.zodiac_sign || 'Not detected';
        if (elements.bioView) elements.bioView.textContent = user.bio || '-';
        if (elements.joinedView) elements.joinedView.textContent = new Date(user.created_at).toLocaleDateString();
        if (elements.totalReadings) elements.totalReadings.textContent = stats.total_readings;
        if (elements.favoriteReadings) elements.favoriteReadings.textContent = stats.favorite_readings;

        // Fill edit form
        const editElements = {
            displayNameEdit: document.getElementById('displayNameEdit'),
            bioEdit: document.getElementById('bioEdit'),
            birthDateEdit: document.getElementById('birthDateEdit'),
            zodiacEdit: document.getElementById('zodiacEdit')
        };

        if (editElements.displayNameEdit) editElements.displayNameEdit.value = user.display_name || '';
        if (editElements.bioEdit) editElements.bioEdit.value = user.bio || '';
        if (editElements.birthDateEdit) editElements.birthDateEdit.value = user.birth_date || '';
        if (editElements.zodiacEdit) editElements.zodiacEdit.value = user.zodiac_sign || '';
    }

    async loadReadings() {
        try {
            this.readings = await window.Auth.getReadings(50);
            this.displayReadings();
        } catch (error) {
            console.error('Load readings error:', error);
        }
    }

    displayReadings() {
        const container = document.getElementById('readingsGrid');
        if (!container) return;
        
        if (this.readings.length === 0) {
            container.innerHTML = '<p class="no-data">No readings saved yet.</p>';
            return;
        }

        container.innerHTML = this.readings.map(reading => `
            <div class="reading-card">
                <div class="reading-header">
                    <h3>${reading.tool_name || reading.tool || 'Unknown Tool'}</h3>
                    <span class="reading-date">${new Date(reading.created_at || reading.timestamp).toLocaleDateString()}</span>
                </div>
                <p class="reading-preview">${(reading.reading_result || reading.summary || reading.details || 'No preview available').substring(0, 100)}...</p>
                <div class="reading-actions">
                    <button onclick="window.Profile.viewReading(${reading.id})">View</button>
                    <button onclick="window.Profile.deleteReading(${reading.id})">Delete</button>
                </div>
            </div>
        `).join('');
    }

    setupEventListeners() {
        // Profile form
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            this.addEventListener(profileForm, 'submit', (e) => {
                e.preventDefault();
                this.saveProfile();
            });
        }

        // Avatar upload
        this.setupAvatarUploader();
    }

    setupAvatarUploader() {
        const avatarUpload = document.getElementById('avatarUpload');
        const dropZone = document.getElementById('profileEditMode');

        if (!avatarUpload || !dropZone) return;

        this.addEventListener(avatarUpload, 'change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleAvatarFile(file);
            }
        });

        // Drag and drop
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.addEventListener(dropZone, eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            this.addEventListener(dropZone, eventName, () => {
                dropZone.classList.add('drag-over');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            this.addEventListener(dropZone, eventName, () => {
                dropZone.classList.remove('drag-over');
            });
        });

        this.addEventListener(dropZone, 'drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const file = files[0];
                if (file.type.startsWith('image/')) {
                    this.handleAvatarFile(file);
                } else {
                    window.Toast.show('Please upload an image file', 'error');
                }
            }
        });
    }

    async handleAvatarFile(file) {
        // Validate file
        const maxSize = 2 * 1024 * 1024; // 2MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

        if (file.size > maxSize) {
            window.Toast.show('File size must be less than 2MB', 'error');
            return;
        }

        if (!allowedTypes.includes(file.type)) {
            window.Toast.show('Only JPG, PNG, and WEBP files are allowed', 'error');
            return;
        }

        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
            const previewImg = document.getElementById('avatarPreviewImg');
            const preview = document.getElementById('avatarPreview');
            
            if (previewImg && preview) {
                previewImg.src = e.target.result;
                preview.style.display = 'block';
            }
        };
        reader.readAsDataURL(file);

        // Upload file
        await this.uploadAvatar(file);
    }

    async uploadAvatar(file) {
        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const response = await fetch(`${window.Auth.api}/upload_avatar.php`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${window.Auth.token}`
                },
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                window.Toast.show('Avatar uploaded successfully!', 'success');
                // Update avatar image
                const avatarImage = document.getElementById('avatarImage');
                if (avatarImage) {
                    avatarImage.src = data.avatar_url + '?t=' + Date.now();
                }
            } else {
                window.Toast.show('Failed to upload avatar: ' + (data.error || 'Unknown error'), 'error');
            }
        } catch (error) {
            console.error('Avatar upload error:', error);
            window.Toast.show('Failed to upload avatar. Please try again.', 'error');
        }
    }

    async saveProfile() {
        const saveButton = document.querySelector('#profileForm button[type="submit"]');
        
        try {
            // Validate form data
            const displayName = document.getElementById('displayNameEdit').value.trim();
            const bio = document.getElementById('bioEdit').value.trim();
            const birthDate = document.getElementById('birthDateEdit').value;
            const zodiacSign = document.getElementById('zodiacEdit').value;
            
            if (!displayName) {
                window.Toast.show('Display name is required', 'error');
                return;
            }
            
            if (displayName.length < 2) {
                window.Toast.show('Display name must be at least 2 characters', 'error');
                return;
            }
            
            if (bio.length > 500) {
                window.Toast.show('Bio must be less than 500 characters', 'error');
                return;
            }

            const profileData = {
                display_name: displayName,
                bio: bio || null,
                birth_date: birthDate || null,
                zodiac_sign: zodiacSign || null
            };

            const success = await window.Auth.updateProfile(profileData);
            if (success) {
                await this.loadProfile();
                toggleEditMode();
                window.Toast.show('Profile updated successfully!', 'success');
            } else {
                window.Toast.show('Could not update profile. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Save profile error:', error);
            window.Toast.show('Failed to save profile. Please try again.', 'error');
        }
    }

    viewReading(id) {
        const reading = this.readings.find(r => r.id === id);
        if (!reading) {
            window.Toast.show('Reading not found', 'error');
            return;
        }
        
        const modal = window.Modal.show(`
            <div class="reading-date">${new Date(reading.created_at || reading.timestamp).toLocaleString()}</div>
            <div class="reading-content">
                ${reading.reading_result || reading.summary || reading.details || 'No details available'}
            </div>
        `, {
            title: reading.tool_name || reading.tool || 'Reading'
        });
    }

    async deleteReading(id) {
        const confirmed = await window.Modal.confirm('Are you sure you want to delete this reading?');
        if (!confirmed) return;

        try {
            const response = await AppCore.api.delete(`readings.php?id=${id}`);
            
            if (response) {
                this.readings = this.readings.filter(r => r.id !== id);
                this.displayReadings();
                
                const totalReadings = document.getElementById('totalReadings');
                if (totalReadings) {
                    totalReadings.textContent = Math.max(0, parseInt(totalReadings.textContent) - 1);
                }
                
                window.Toast.show('Reading deleted successfully!', 'success');
            }
        } catch (error) {
            console.error('Delete reading error:', error);
            window.Toast.show('Failed to delete reading. Please try again.', 'error');
        }
    }
}

// Enhanced Scroll Reveal System
class ScrollRevealManager extends AppComponent {
    constructor() {
        super(document.body);
        this.elements = [];
        this.observer = null;
        this.init();
    }

    init() {
        super.init();
        this.setupObserver();
    }

    setupObserver() {
        this.elements = document.querySelectorAll('.tool-card, .section-card, .feature-card');
        
        if (this.elements.length === 0) return;

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add('revealed');
                    }, 100);
                    this.observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        this.elements.forEach(element => {
            this.observer.observe(element);
        });

        this.checkInitialVisibility();
    }

    checkInitialVisibility() {
        this.elements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const isVisible = (
                rect.top < (window.innerHeight || document.documentElement.clientHeight) &&
                rect.bottom > 0 &&
                rect.left < (window.innerWidth || document.documentElement.clientWidth) &&
                rect.right > 0
            );

            if (isVisible) {
                setTimeout(() => {
                    element.classList.add('revealed');
                }, 200 + Math.random() * 300);
                this.observer.unobserve(element);
            }
        });
    }

    revealAll() {
        this.elements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add('revealed');
            }, index * 100);
        });
    }

    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }
}

// Enhanced Navigation System
class NavigationManager extends AppComponent {
    constructor() {
        super(document.body);
        this.nav = null;
        this.menuBtn = null;
        this.init();
    }

    init() {
        super.init();
        this.setupNavigation();
        this.setupSuggestionModal();
    }

    setupNavigation() {
        this.nav = document.getElementById('hubNav');
        this.menuBtn = document.getElementById('navMenuBtn');

        if (!this.nav || !this.menuBtn) return;

        this.addEventListener(this.menuBtn, 'click', () => {
            this.toggleMenu();
        });

        // Close menu on outside click
        this.addEventListener(document, 'click', (e) => {
            if (this.nav && this.menuBtn && !this.nav.contains(e.target) && !this.menuBtn.contains(e.target)) {
                this.closeMenu();
            }
        });

        // Tool navigation
        const toolLinks = this.nav.querySelectorAll('.nav-tool-link');
        toolLinks.forEach(link => {
            this.addEventListener(link, 'click', (e) => {
                e.preventDefault();
                const tool = link.dataset.tool;
                if (tool) {
                    window.navigateToTool(tool);
                    this.closeMenu();
                }
            });
        });
    }

    toggleMenu() {
        const isOpen = this.nav.classList.contains('active');
        if (isOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    openMenu() {
        this.nav.classList.add('active');
        this.nav.setAttribute('aria-hidden', 'false');
        this.menuBtn.setAttribute('aria-expanded', 'true');
    }

    closeMenu() {
        this.nav.classList.remove('active');
        this.nav.setAttribute('aria-hidden', 'true');
        this.menuBtn.setAttribute('aria-expanded', 'false');
    }

    setupSuggestionModal() {
        const suggestBtn = document.getElementById('navSuggestBtn');
        const modal = document.getElementById('suggestionModal');

        if (suggestBtn && modal) {
            this.addEventListener(suggestBtn, 'click', () => {
                modal.classList.add('active');
            });

            // Close modal
            const closeBtn = modal.querySelector('.modal-close-btn');
            const overlay = modal.querySelector('.modal-overlay');

            if (closeBtn) this.addEventListener(closeBtn, 'click', () => this.closeSuggestionModal());
            if (overlay) this.addEventListener(overlay, 'click', () => this.closeSuggestionModal());
        }
    }

    closeSuggestionModal() {
        const modal = document.getElementById('suggestionModal');
        if (modal) {
            modal.classList.remove('active');
        }
    }
}

// Initialize tool systems
document.addEventListener('DOMContentLoaded', () => {
    // Initialize chatbot if on chatbot page
    if (document.getElementById('chatbotMessages')) {
        window.Chatbot = new ChatbotManager();
    }

    // Initialize profile if on profile page
    if (document.getElementById('profileViewMode')) {
        window.Profile = new ProfileManager();
    }

    // Initialize scroll reveal on hub pages
    if (document.querySelector('.tool-grid, .tools-container')) {
        window.ScrollReveal = new ScrollRevealManager();
    }

    // Initialize navigation
    window.Navigation = new NavigationManager();

    // Backward compatibility functions
    window.initHoroscopeSubscription = () => {
        // Handled by ChatbotManager
    };

    window.previewAvatar = (event) => {
        const file = event.target.files[0];
        if (file && window.Profile) {
            window.Profile.handleAvatarFile(file);
        }
    };

    window.toggleEditMode = () => {
        const viewMode = document.getElementById('profileViewMode');
        const editMode = document.getElementById('profileEditMode');
        if (viewMode && editMode) {
            viewMode.classList.toggle('hidden');
            editMode.classList.toggle('hidden');
        }
    };

    window.refreshProfileData = async () => {
        if (window.Profile) {
            await window.Profile.loadProfile();
            await window.Profile.loadReadings();
            window.Toast.show('Profile data refreshed!', 'success');
        }
    };
});

// Export for global access
window.ChatbotManager = ChatbotManager;
window.ProfileManager = ProfileManager;
window.ScrollRevealManager = ScrollRevealManager;
window.NavigationManager = NavigationManager;
