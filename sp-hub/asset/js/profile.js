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
    },

    async saveProfile() {
        const profileData = {
            display_name: document.getElementById('displayNameEdit').value,
            bio: document.getElementById('bioEdit').value,
            birth_date: document.getElementById('birthDateEdit').value,
            zodiac_sign: document.getElementById('zodiacEdit').value
        };

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
