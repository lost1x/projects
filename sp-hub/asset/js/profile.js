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
        if (messageEl) {
            messageEl.textContent = '';
            messageEl.className = 'preferences-message';
        }

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
                messageEl.textContent = 'Preferences saved!';
                messageEl.classList.add('success');
            }
        } else {
            if (messageEl) {
                messageEl.textContent = 'Could not save preferences. Try again later.';
                messageEl.classList.add('error');
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
                    <h3>${reading.tool_name}</h3>
                    <span class="reading-date">${new Date(reading.created_at).toLocaleDateString()}</span>
                </div>
                <p class="reading-preview">${reading.reading_result?.substring(0, 100) || 'No preview available'}</p>
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
        const profileData = {
            display_name: document.getElementById('displayNameEdit').value,
            bio: document.getElementById('bioEdit').value,
            birth_date: document.getElementById('birthDateEdit').value,
            zodiac_sign: document.getElementById('zodiacEdit').value
        };

        const avatarInput = document.getElementById('avatarUpload');
        if (avatarInput && avatarInput.files && avatarInput.files[0]) {
            try {
                const avatarUrl = await this.uploadAvatar(avatarInput.files[0]);
                profileData.avatar_url = avatarUrl;
            } catch (err) {
                console.error('Avatar upload failed:', err);
                alert('Could not upload avatar: ' + err.message);
                return;
            }
        }

        const success = await Auth.updateProfile(profileData);
        if (success) {
            this.displayProfile({
                user: { ...this.currentUser, ...profileData },
                stats: { total_readings: parseInt(document.getElementById('totalReadings').textContent), favorite_readings: parseInt(document.getElementById('favoriteReadings').textContent) }
            });
            toggleEditMode();
            alert('Profile updated successfully!');
        }
    }
};

function toggleEditMode() {
    const viewMode = document.getElementById('profileViewMode');
    const editMode = document.getElementById('profileEditMode');
    if (viewMode && editMode) {
        viewMode.classList.toggle('hidden');
        editMode.classList.toggle('hidden');
    }
}

function filterReadings() {
    // TODO: Implement filtering
}

function viewReading(id) {
    console.log('View reading:', id);
    // TODO: Implement reading detail view
}

async function deleteReading(id) {
    if (confirm('Are you sure you want to delete this reading?')) {
        // TODO: Implement delete
        console.log('Delete reading:', id);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    ProfileManager.init();
});
