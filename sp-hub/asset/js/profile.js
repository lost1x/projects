// Profile management
const ProfileManager = {
    currentUser: null,
    readings: [],

    async init() {
        // Check if user is logged in
        if (!Auth.token) {
            window.location.href = '/';
            return;
        }

        await this.loadProfile();
        await this.loadPreferences();
        await this.loadReadings();
        this.setupEventListeners();
    },

    async loadProfile() {
        // Add cache-busting timestamp to prevent stale data
        const timestamp = Date.now();
        const profile = await Auth.getProfile();
        if (profile) {
            this.currentUser = profile.user;
            this.displayProfile(profile);
        }
    },

    displayProfile(profile) {
        const user = profile.user;
        const stats = profile.stats;

        const displayNameView = document.getElementById('displayNameView');
        const usernameView = document.getElementById('usernameView');
        const emailView = document.getElementById('emailView');
        const birthDateView = document.getElementById('birthDateView');
        const zodiacView = document.getElementById('zodiacView');
        const bioView = document.getElementById('bioView');
        const joinedView = document.getElementById('joinedView');
        const totalReadings = document.getElementById('totalReadings');
        const favoriteReadings = document.getElementById('favoriteReadings');
        const avatarImage = document.getElementById('avatarImage');

        if (avatarImage) {
            avatarImage.src = user.avatar_url || '../asset/img/avatar-placeholder.svg';
        }

        if (displayNameView) displayNameView.textContent = user.display_name || '-';
        if (usernameView) usernameView.textContent = user.username;
        if (emailView) emailView.textContent = user.email;
        if (birthDateView) birthDateView.textContent = user.birth_date ? new Date(user.birth_date).toLocaleDateString() : 'Not set';
        if (zodiacView) zodiacView.textContent = user.zodiac_sign || 'Not detected';
        if (bioView) bioView.textContent = user.bio || '-';
        if (joinedView) joinedView.textContent = new Date(user.created_at).toLocaleDateString();
        if (totalReadings) totalReadings.textContent = stats.total_readings;
        if (favoriteReadings) favoriteReadings.textContent = stats.favorite_readings;

        // Fill edit form
        const displayNameEdit = document.getElementById('displayNameEdit');
        const bioEdit = document.getElementById('bioEdit');
        const birthDateEdit = document.getElementById('birthDateEdit');
        const zodiacEdit = document.getElementById('zodiacEdit');

        if (displayNameEdit) displayNameEdit.value = user.display_name || '';
        if (bioEdit) bioEdit.value = user.bio || '';
        if (birthDateEdit) birthDateEdit.value = user.birth_date || '';
        if (zodiacEdit) zodiacEdit.value = user.zodiac_sign || '';
    },

    async loadReadings() {
        const readings = await Auth.getReadings(50);
        this.readings = readings;
        this.displayReadings();
    },

    async loadPreferences() {
        const prefs = await Auth.getPreferences();
        if (!prefs) return;

        const themeSelect = document.getElementById('themeSelect');
        const notificationsToggle = document.getElementById('notificationsToggle');
        const emailFrequency = document.getElementById('emailFrequency');
        const languageSelect = document.getElementById('languageSelect');

        if (themeSelect) themeSelect.value = prefs.theme || 'dark';
        if (notificationsToggle) notificationsToggle.value = prefs.notifications_enabled ? '1' : '0';
        if (emailFrequency) emailFrequency.value = prefs.email_frequency || 'weekly';
        if (languageSelect) languageSelect.value = prefs.language || 'en';

        this.applyTheme(prefs.theme);
    },

    applyTheme(theme) {
        const body = document.body;
        if (!body) return;

        body.classList.remove('theme-dark', 'theme-light');
        body.classList.add(theme === 'light' ? 'theme-light' : 'theme-dark');
    },

    async savePreferences() {
        const messageEl = document.getElementById('preferencesMessage');
        const saveButton = document.querySelector('#preferencesForm button[type="submit"]');
        
        if (saveButton) {
            saveButton.disabled = true;
            saveButton.textContent = 'Saving...';
        }
        
        if (messageEl) {
            messageEl.textContent = '';
            messageEl.className = 'preferences-message';
        }

        try {
            const prefs = {
                theme: document.getElementById('themeSelect').value,
                notifications_enabled: document.getElementById('notificationsToggle').value === '1',
                email_frequency: document.getElementById('emailFrequency').value,
                language: document.getElementById('languageSelect').value
            };

            const success = await Auth.updatePreferences(prefs);
            if (success) {
                this.applyTheme(prefs.theme);
                if (messageEl) {
                    messageEl.textContent = 'Preferences saved successfully!';
                    messageEl.classList.add('success');
                }
                this.showMessage('Preferences saved successfully!', 'success');
            } else {
                if (messageEl) {
                    messageEl.textContent = 'Could not save preferences. Try again later.';
                    messageEl.classList.add('error');
                }
                this.showMessage('Failed to save preferences', 'error');
            }
        } catch (err) {
            console.error('Save preferences error:', err);
            if (messageEl) {
                messageEl.textContent = 'Failed to save preferences. Please try again.';
                messageEl.classList.add('error');
            }
            this.showMessage('Failed to save preferences', 'error');
        } finally {
            if (saveButton) {
                saveButton.disabled = false;
                saveButton.textContent = 'Save Preferences';
            }
        }
    },

    async uploadAvatar(file) {
        const form = new FormData();
        form.append('avatar', file);

        const response = await fetch('asset/php/upload_avatar.php', {
            method: 'POST',
            headers: {
                ...(Auth.token ? { Authorization: `Bearer ${Auth.token}` } : {})
            },
            body: form
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Avatar upload failed');
        }
        return data.avatar_url;
    },

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
                    <button onclick="viewReading(${reading.id})">View</button>
                    <button onclick="deleteReading(${reading.id})">Delete</button>
                </div>
            </div>
        `).join('');
    },

    setupEventListeners() {
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveProfile();
            });
        }

        const preferencesForm = document.getElementById('preferencesForm');
        if (preferencesForm) {
            preferencesForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.savePreferences();
            });
        }
    },

    async saveProfile() {
        const saveButton = document.querySelector('#profileForm button[type="submit"]');
        if (saveButton) {
            saveButton.disabled = true;
            saveButton.textContent = 'Saving...';
        }

        try {
            // Validate form data
            const displayName = document.getElementById('displayNameEdit').value.trim();
            const bio = document.getElementById('bioEdit').value.trim();
            const birthDate = document.getElementById('birthDateEdit').value;
            const zodiacSign = document.getElementById('zodiacEdit').value;
            
            if (!displayName) {
                this.showMessage('Display name is required', 'error');
                if (saveButton) {
                    saveButton.disabled = false;
                    saveButton.textContent = 'Save Changes';
                }
                return;
            }
            
            if (displayName.length < 2) {
                this.showMessage('Display name must be at least 2 characters', 'error');
                if (saveButton) {
                    saveButton.disabled = false;
                    saveButton.textContent = 'Save Changes';
                }
                return;
            }
            
            if (bio.length > 500) {
                this.showMessage('Bio must be less than 500 characters', 'error');
                if (saveButton) {
                    saveButton.disabled = false;
                    saveButton.textContent = 'Save Changes';
                }
                return;
            }

            const profileData = {
                display_name: displayName,
                bio: bio || null,
                birth_date: birthDate || null,
                zodiac_sign: zodiacSign || null
            };

            // Handle avatar upload if file is selected
            const avatarInput = document.getElementById('avatarUpload');
            if (avatarInput && avatarInput.files && avatarInput.files[0]) {
                try {
                    const avatarUrl = await this.uploadAvatar(avatarInput.files[0]);
                    profileData.avatar_url = avatarUrl;
                } catch (err) {
                    console.error('Avatar upload failed:', err);
                    this.showMessage('Could not upload avatar: ' + err.message, 'error');
                    // Continue without avatar update
                }
            }

            const success = await Auth.updateProfile(profileData);
            if (success) {
                // Update local user data with response from server
                const updatedProfile = await Auth.getProfile();
                if (updatedProfile) {
                    this.currentUser = updatedProfile.user;
                    this.displayProfile(updatedProfile);
                }
                
                // Switch back to view mode
                toggleEditMode();
                this.showMessage('Profile updated successfully!', 'success');
            } else {
                this.showMessage('Could not update profile. Please try again.', 'error');
            }
        } catch (err) {
            console.error('Save profile error:', err);
            this.showMessage('Failed to save profile. Please try again.', 'error');
        } finally {
            if (saveButton) {
                saveButton.disabled = false;
                saveButton.textContent = 'Save Changes';
            }
        }
    },

    showMessage(message, type = 'info') {
        // Create a toast notification instead of alert
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    },
};

function previewAvatar(event) {
    const file = event.target.files[0];
    if (file) {
        // Validate file size (2MB max)
        const maxSize = 2 * 1024 * 1024;
        if (file.size > maxSize) {
            ProfileManager.showMessage('File too large. Maximum size is 2MB.', 'error');
            event.target.value = ''; // Clear the input
            return;
        }
        
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            ProfileManager.showMessage('Invalid file type. Please use JPG, PNG, or WEBP.', 'error');
            event.target.value = ''; // Clear the input
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('avatarPreview');
            const previewImg = document.getElementById('avatarPreviewImg');
            if (preview && previewImg) {
                previewImg.src = e.target.result;
                preview.style.display = 'block';
            }
        };
        reader.readAsDataURL(file);
    }
}

function toggleEditMode() {
    const viewMode = document.getElementById('profileViewMode');
    const editMode = document.getElementById('profileEditMode');
    if (viewMode && editMode) {
        viewMode.classList.toggle('hidden');
        editMode.classList.toggle('hidden');
        
        // Clear avatar preview when switching back to view mode
        const preview = document.getElementById('avatarPreview');
        if (preview) {
            preview.style.display = 'none';
        }
    }
}

function filterReadings() {
    const filter = document.getElementById('toolFilter').value;
    const allReadings = ProfileManager.readings;
    
    if (!filter) {
        ProfileManager.displayReadings();
        return;
    }
    
    const filtered = allReadings.filter(reading => {
        const toolName = reading.tool_name || reading.tool || '';
        return toolName.toLowerCase().includes(filter.toLowerCase());
    });
    
    // Temporarily replace readings array for display
    const originalReadings = ProfileManager.readings;
    ProfileManager.readings = filtered;
    ProfileManager.displayReadings();
    ProfileManager.readings = originalReadings;
}

function viewReading(id) {
    const reading = ProfileManager.readings.find(r => r.id === id);
    if (!reading) {
        ProfileManager.showMessage('Reading not found', 'error');
        return;
    }
    
    // Create a modal to show the reading details
    const modal = document.createElement('div');
    modal.className = 'reading-modal';
    modal.innerHTML = `
        <div class="modal-overlay" onclick="closeReadingModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>${reading.tool_name || reading.tool || 'Reading'}</h3>
                <button class="modal-close" onclick="closeReadingModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="reading-date">${new Date(reading.created_at || reading.timestamp).toLocaleString()}</div>
                <div class="reading-content">
                    ${reading.reading_result || reading.summary || reading.details || 'No details available'}
                </div>
            </div>
        </div>
    `;
    
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    document.body.appendChild(modal);
    window.currentReadingModal = modal;
}

function closeReadingModal() {
    if (window.currentReadingModal) {
        document.body.removeChild(window.currentReadingModal);
        window.currentReadingModal = null;
    }
}

async function refreshProfileData() {
    const refreshBtn = document.getElementById('refreshButton');
    if (refreshBtn) {
        refreshBtn.disabled = true;
        refreshBtn.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> Refreshing...';
    }
    
    try {
        await ProfileManager.loadProfile();
        await ProfileManager.loadPreferences();
        await ProfileManager.loadReadings();
        ProfileManager.showMessage('Profile data refreshed!', 'success');
    } catch (err) {
        console.error('Refresh error:', err);
        ProfileManager.showMessage('Failed to refresh data', 'error');
    } finally {
        if (refreshBtn) {
            refreshBtn.disabled = false;
            refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
        }
    }
}

async function deleteReading(id) {
    if (confirm('Are you sure you want to delete this reading?')) {
        try {
            const response = await fetch(`${Auth.api_url}/readings.php?id=${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${Auth.token}`
                }
            });
            
            if (response.ok) {
                // Remove from local array and refresh display
                ProfileManager.readings = ProfileManager.readings.filter(r => r.id !== id);
                ProfileManager.displayReadings();
                
                // Update stats
                const totalReadings = document.getElementById('totalReadings');
                if (totalReadings) {
                    totalReadings.textContent = Math.max(0, parseInt(totalReadings.textContent) - 1);
                }
                
                ProfileManager.showMessage('Reading deleted successfully!', 'success');
            } else {
                const data = await response.json();
                ProfileManager.showMessage('Failed to delete reading: ' + (data.error || 'Unknown error'), 'error');
            }
        } catch (err) {
            console.error('Delete reading error:', err);
            ProfileManager.showMessage('Failed to delete reading. Please try again.', 'error');
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    ProfileManager.init();
});
