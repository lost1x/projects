// Input validation and sanitization utilities
const Validation = {
    // Sanitize HTML to prevent XSS
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // Sanitize and limit text length
    sanitizeText(text, maxLength = null) {
        if (!text) return '';
        let sanitized = text.trim();
        if (maxLength) {
            sanitized = sanitized.substring(0, maxLength);
        }
        return this.escapeHtml(sanitized);
    },

    // Validate email format
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Validate username (alphanumeric, underscore, hyphen)
    isValidUsername(username) {
        const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
        return usernameRegex.test(username);
    },

    // Validate display name
    isValidDisplayName(name) {
        return name && name.trim().length >= 2 && name.trim().length <= 50;
    },

    // Validate bio length
    isValidBio(bio) {
        return !bio || bio.length <= 500;
    },

    // Validate tool name (whitelist approach)
    isValidToolName(toolName) {
        const validTools = [
            'tarot-reading',
            'dream-interpreter', 
            'zodiac-calculator',
            'numerology',
            'rune-casting',
            'crystal-healing',
            'fortune-teller',
            'birth-charts',
            'love-language-quiz'
        ];
        return validTools.includes(toolName);
    },

    // Sanitize reading data
    sanitizeReadingData(data) {
        const sanitized = {};
        
        if (data.tool_name && this.isValidToolName(data.tool_name)) {
            sanitized.tool_name = this.sanitizeText(data.tool_name, 100);
        }
        
        if (data.reading_type) {
            sanitized.reading_type = this.sanitizeText(data.reading_type, 50);
        }
        
        if (data.reading_result) {
            sanitized.reading_result = this.sanitizeText(data.reading_result, 10000);
        }
        
        if (data.reading_data && typeof data.reading_data === 'object') {
            sanitized.reading_data = JSON.stringify(data.reading_data);
        }
        
        return sanitized;
    },

    // Validate and sanitize profile data
    sanitizeProfileData(data) {
        const sanitized = {};
        
        if (data.display_name && this.isValidDisplayName(data.display_name)) {
            sanitized.display_name = this.sanitizeText(data.display_name, 50);
        }
        
        if (data.bio !== undefined) {
            if (this.isValidBio(data.bio)) {
                sanitized.bio = this.sanitizeText(data.bio, 500);
            }
        }
        
        if (data.birth_date) {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            if (dateRegex.test(data.birth_date)) {
                sanitized.birth_date = data.birth_date;
            }
        }
        
        if (data.zodiac_sign) {
            const validSigns = [
                'aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
                'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'
            ];
            if (validSigns.includes(data.zodiac_sign.toLowerCase())) {
                sanitized.zodiac_sign = this.sanitizeText(data.zodiac_sign, 20);
            }
        }
        
        return sanitized;
    }
};
